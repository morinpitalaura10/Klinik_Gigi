import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../../utils/supabase';
import { GlobalStyles, LayoutStyles, Colors } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAlert } from '../../../context/AlertContext';

export function ListPendingKwitansi() {
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const [pendingBills, setPendingBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [showPicker, setShowPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchPendingBills();
    }, [selectedDate])
  );

  const fetchPendingBills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tb_rekam_medis')
        .select(`
          *,
          tb_pasien (nama_pasien, tgl_lahir, jk, alamat, nope),
          tb_users!fk_rekam_medis_doctor (nama_users)
        `)
        .eq('tanggal', selectedDate)
        .eq('status', 'Selesai')
        .order('id_record', { ascending: false });

      if (error) throw error;

      // Filter out those who already have a receipt (if not handled by status)
      // For now, assume status 'Selesai' means pending payment based on existing logic.
      setPendingBills(data || []);
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = pendingBills.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    return item.tb_pasien?.nama_pasien?.toLowerCase().includes(searchLower);
  });

  const renderCard = (item: any) => {
    return (
      <View key={item.id_record.toString()} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.patientName}>{item.tb_pasien?.nama_pasien || 'Pasien'}</Text>
            <Text style={styles.recordDate}>{formatDate(item.tanggal)}</Text>
          </View>
          <View style={styles.cardHeaderRight}>
            <View style={[styles.layananBadge, { backgroundColor: item.layanan === 'Ortodental' ? '#E3F2FD' : '#FDECEC' }]}>
              <Text style={[styles.layananBadgeText, { color: item.layanan === 'Ortodental' ? '#1E88E5' : '#8B4A4A' }]}>
                {item.layanan || 'Umum'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBody}>
          <View style={styles.cardBodyLeft}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>DOKTER</Text>
              <Text style={styles.infoValue}>{item.tb_users?.nama_users || '-'}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>DIAGNOSA</Text>
              <Text style={styles.infoValue} numberOfLines={2}>{item.diagnosa || '-'}</Text>
            </View>
          </View>

          <View style={styles.cardBodyRight}>
            <TouchableOpacity
              style={styles.payButton}
              onPress={() => navigation.navigate('CreateKwitansi', { record: item })}
            >
              <MaterialCommunityIcons name="cash-register" size={22} color="white" />
              <Text style={styles.payButtonText}>Proses Pembayaran</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const listHeader = (
    <>
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Feather name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama pasien..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.dateSelectorContainer}>
        <TouchableOpacity
          style={styles.dateDisplay}
          onPress={() => setShowPicker(true)}
        >
          <View style={styles.dateIconWrapper}>
            <MaterialCommunityIcons name="calendar-month" size={24} color="#801919" />
          </View>
          <View style={styles.dateTextWrapper}>
            <Text style={styles.dateLabelText}>Tanggal Antrean</Text>
            <Text style={styles.dateValueText}>{formatDate(selectedDate)}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-down" size={20} color="#999" />
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={new Date(selectedDate)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowPicker(false);
              if (date) {
                const formatted = date.toISOString().split('T')[0];
                setSelectedDate(formatted);
              }
            }}
          />
        )}
      </View>
    </>
  );

  return (
    <AdminLayout noScroll={true} customRightTitle="Antrean Pembayaran">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pilih Pasien untuk Kwitansi</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={LayoutStyles.mt50} />
        ) : (
          <FlatList
            style={LayoutStyles.flex1}
            data={filteredData}
            keyExtractor={(item) => item.id_record.toString()}
            renderItem={({ item }) => renderCard(item)}
            ListHeaderComponent={listHeader}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={GlobalStyles.emptyContent}>
                <MaterialCommunityIcons name="account-search-outline" size={60} color="#CCC" />
                <Text style={GlobalStyles.emptyText}>Tidak ada antrean pembayaran.</Text>
              </View>
            }
          />
        )}
      </View>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    elevation: 2,
    gap: 15,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    padding: 20,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#EEE',
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  dateSelectorContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  dateIconWrapper: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#FDECEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  dateTextWrapper: {
    flex: 1,
  },
  dateLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateValueText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#801919',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FBFBFB',
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recordDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  layananBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  layananBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  cardBody: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardBodyLeft: {
    flex: 1,
  },
  cardBodyRight: {
    marginLeft: 15,
  },
  infoBlock: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 13,
    color: '#444',
  },
  payButton: {
    backgroundColor: '#1E88E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  payButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
