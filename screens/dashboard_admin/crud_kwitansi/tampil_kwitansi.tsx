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
  StyleSheet
} from 'react-native';
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

  // Helper date function (Local YYYY-MM-DD)
  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const selectedDate = getLocalDate();

  const fetchPendingBills = async () => {
    try {
      setLoading(true);
      // Ambil record hari ini yang statusnya 'Selesai' (siap ditagih)
      const { data, error } = await supabase
        .from('tb_rekam_medis')
        .select(`
          *,
          tb_pasien (nama_pasien, nope),
          tb_users!doctor_id (nama_users),
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
    }, [])
  );

  const filteredData = pendingBills.filter(item =>
    item.tb_pasien?.nama_pasien.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderBillCard = ({ item }: { item: PendingBill }) => {
    const isOrto = item.layanan === 'Ortodental';

    return (
      <View style={styles.billCard}>
        <View style={styles.billBody}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nama Dokter</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{item.tb_users?.nama_users || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Nama Pasien</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{item.tb_pasien?.nama_pasien}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Keluhan/Diagnosis</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{item.diagnosa || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Perawatan</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{item.tb_tindakan?.nama_tindakan || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Keterangan</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{item.keterangan || '-'}</Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.cetakBtn, { backgroundColor: isOrto ? Colors.primary : '#2E50D4' }]}
            onPress={() => navigation.navigate('CreateKwitansi', { record: item })}
          >
            <MaterialCommunityIcons name="file-document-outline" size={24} color="white" />
            <Text style={styles.cetakBtnText}>
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
          {/* Header Section from SS */}
          <View style={[GlobalStyles.searchRow, LayoutStyles.ph20, { marginBottom: 15 }]}>
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

            <View style={{ marginLeft: 15 }}>
              <Text style={{ fontSize: 13, color: '#666' }}>Hari/Tanggal :</Text>
              <View style={styles.dateBox}>
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={Colors.black} style={LayoutStyles.mt50} />
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id_record.toString()}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
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

const styles = StyleSheet.create({
  billCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  billBody: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 120,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  colon: {
    width: 15,
    fontSize: 14,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  actionSection: {
    justifyContent: 'center',
    marginLeft: 15,
  },
  cetakBtn: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
  },
  cetakBtnText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  dateBox: {
    borderWidth: 1,
    borderColor: '#CCC',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'white',
    marginTop: 2,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  }
});
