import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { supabase } from '../../../utils/supabase';
import { Colors, GlobalStyles, LayoutStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

interface PendingBill {
  id_record: number;
  tanggal: string;
  layanan: string;
  diagnosa: string;
  keterangan: string;
  id_tindakan: number;
  doctor_id: number;
  tb_pasien: {
    nama_pasien: string;
    nope: string;
  };
  tb_users: {
    nama_users: string;
  } | null;
  tb_tindakan: {
    nama_tindakan: string;
  } | null;
}

export function TampilKwitansi() {
  const navigation = useNavigation<any>();
  const [pendingBills, setPendingBills] = useState<PendingBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getLocalDate());
  const [showPicker, setShowPicker] = useState(false);

  const parsedDate = new Date(selectedDate);

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const fetchPendingBills = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('tb_rekam_medis')
        .select(`
          *,
          tb_pasien (nama_pasien, nope),
          tb_users!fk_rekam_medis_doctor (nama_users),
          tb_tindakan (nama_tindakan)
        `)
        .eq('tanggal', selectedDate)
        .eq('status', 'Selesai')
        .order('id_record', { ascending: false });

      if (error) throw error;
      setPendingBills(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPendingBills();
    }, [selectedDate])
  );

  const filteredData = pendingBills.filter(item =>
    item.tb_pasien?.nama_pasien.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderBillCard = ({ item }: { item: PendingBill }) => {
    const isOrto = item.layanan === 'Ortodental';

    return (
      <View style={GlobalStyles.billCard}>
        <View style={GlobalStyles.billBody}>
          <View style={GlobalStyles.billInfoRow}>
            <Text style={GlobalStyles.billLabel}>Nama Dokter</Text>
            <Text style={GlobalStyles.billColon}>:</Text>
            <Text style={GlobalStyles.billValue}>{item.tb_users?.nama_users || '-'}</Text>
          </View>

          <View style={GlobalStyles.billInfoRow}>
            <Text style={GlobalStyles.billLabel}>Nama Pasien</Text>
            <Text style={GlobalStyles.billColon}>:</Text>
            <Text style={GlobalStyles.billValue}>{item.tb_pasien?.nama_pasien}</Text>
          </View>

          <View style={GlobalStyles.billInfoRow}>
            <Text style={GlobalStyles.billLabel}>Keluhan/Diagnosis</Text>
            <Text style={GlobalStyles.billColon}>:</Text>
            <Text style={GlobalStyles.billValue}>{item.diagnosa || '-'}</Text>
          </View>

          <View style={GlobalStyles.billInfoRow}>
            <Text style={GlobalStyles.billLabel}>Perawatan</Text>
            <Text style={GlobalStyles.billColon}>:</Text>
            <Text style={GlobalStyles.billValue}>{item.tb_tindakan?.nama_tindakan || '-'}</Text>
          </View>

          <View style={GlobalStyles.billInfoRow}>
            <Text style={GlobalStyles.billLabel}>Keterangan</Text>
            <Text style={GlobalStyles.billColon}>:</Text>
            <Text style={GlobalStyles.billValue}>{item.keterangan || '-'}</Text>
          </View>
        </View>

        <View style={GlobalStyles.billActionSection}>
          <TouchableOpacity
            style={[GlobalStyles.billCetakBtn, { backgroundColor: isOrto ? Colors.primary : '#2E50D4' }]}
            onPress={() => navigation.navigate('CreateKwitansi', { record: item })}
          >
            <MaterialCommunityIcons name="file-document-outline" size={24} color="white" />
            <Text style={GlobalStyles.billCetakBtnText}>
              Cetak Kwitansi {isOrto ? 'Ortodental' : 'Umum'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <AdminLayout noScroll={true} customRightTitle="Tagihan Harian">
      <View style={LayoutStyles.flex1}>
        <View style={LayoutStyles.pt10}>
          
          <View style={[GlobalStyles.searchRow, LayoutStyles.ph20, LayoutStyles.mb10]}>
            <View style={GlobalStyles.searchWrapper}>
              <View style={GlobalStyles.listSearchContainer}>
                <Feather name="search" size={20} color="#888" style={GlobalStyles.inputIcon} />
                <TextInput
                  style={GlobalStyles.listSearchInput}
                  placeholder="Cari nama pasien..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            <View style={LayoutStyles.ml10}>
              <Text style={GlobalStyles.inputLabelSmall}>Hari/Tanggal :</Text>
              <TouchableOpacity
                style={[GlobalStyles.billDateBox, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}
                onPress={() => setShowPicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={16} color={Colors.primary} />
                <Text style={GlobalStyles.billDateText}>{formatDisplayDate(selectedDate)}</Text>
              </TouchableOpacity>
            </View>

            {showPicker && (
              <DateTimePicker
                value={parsedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                onChange={(event, date) => {
                  setShowPicker(false);
                  if (date) {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const d = String(date.getDate()).padStart(2, '0');
                    setSelectedDate(`${y}-${m}-${d}`);
                  }
                }}
              />
            )}
          </View>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={Colors.black} style={LayoutStyles.mt50} />
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id_record.toString()}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 25, paddingTop: 0 }}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPendingBills();
            }}
            renderItem={renderBillCard}
            ListEmptyComponent={
              <View style={GlobalStyles.emptyContent}>
                <Text style={GlobalStyles.emptyText}>Tidak ada tagihan tertunda hari ini</Text>
              </View>
            }
          />
        )}
      </View>
    </AdminLayout>
  );
}

