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
  StyleSheet,
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
  const [tindakanList, setTindakanList] = useState<any[]>([]);

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

  const formatShortDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const fetchPendingBills = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('tb_rekam_medis')
        .select(`
          *,
          tb_pasien (nama_pasien, nope),
          tb_users!fk_rekam_medis_doctor (nama_users)
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

  const fetchMasterData = async () => {
    try {
      const { data } = await supabase.from('tb_tindakan').select('*');
      if (data) setTindakanList(data);
    } catch (_) {}
  };

  useFocusEffect(
    useCallback(() => {
      fetchMasterData();
      fetchPendingBills();
    }, [selectedDate])
  );

  const filteredData = pendingBills.filter(item =>
    item.tb_pasien?.nama_pasien.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderBillCard = ({ item }: { item: PendingBill }) => {
    const isOrto = item.layanan === 'Ortodental';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.doctorName}>{item.tb_users?.nama_users || 'Dokter tidak diketahui'}</Text>
          <Text style={styles.cardDate}>{formatDisplayDate(item.tanggal)}</Text>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBody}>
          <View style={styles.cardContentLeft}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>NAMA PASIEN</Text>
              <Text style={styles.infoValue}>{item.tb_pasien?.nama_pasien}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>KELUHAN / DIAGNOSIS</Text>
              <Text style={styles.infoValue}>{item.diagnosa || '-'}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>KETERANGAN</Text>
              <Text style={styles.infoValue}>{item.keterangan || '-'}</Text>
            </View>
          </View>

          <View style={styles.cardContentCenter}>
            <View style={styles.treatmentBlock}>
              <Text style={styles.infoLabelCenter}>PERAWATAN</Text>
              <View style={styles.treatmentBadge}>
                <Text style={styles.treatmentText}>
                  {item.id_tindakan ? (
                    item.id_tindakan.toString().split(',').map((id: string) => {
                      const t = tindakanList.find(x => x.id_tindakan.toString() === id.trim());
                      return t ? t.nama_tindakan : '';
                    }).filter(Boolean).join(', ') || '-'
                  ) : '-'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardContentRight}>
            <TouchableOpacity
              style={[styles.printButton, { backgroundColor: isOrto ? '#2B58D1' : '#3E58C1' }]} // Using a premium blue shade
              onPress={() => navigation.navigate('CreateKwitansi', { record: item })}
            >
              <View style={styles.printButtonContent}>
                <MaterialCommunityIcons name="file-document-outline" size={32} color="white" />
                <View style={styles.printButtonTextWrapper}>
                  <Text style={styles.printButtonSmallText}>Cetak Kwitansi</Text>
                  <Text style={styles.printButtonBoldText}>{isOrto ? 'Ortodental' : 'Umum'}</Text>
                </View>
                <View style={styles.arrowIconWrapper}>
                  <MaterialCommunityIcons name="arrow-top-right" size={14} color="white" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <AdminLayout noScroll={true} title="Admin">
      <ScrollView 
        style={[LayoutStyles.flex1, { backgroundColor: '#F8F9FA' }]}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.filterContainer}>
          <View style={styles.searchWrapper}>
            <Feather name="search" size={24} color="#A0A0A0" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama pasien..."
              placeholderTextColor="#A0A0A0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowPicker(true)}
          >
            <View style={styles.calendarIconWrapper}>
              <MaterialCommunityIcons name="calendar-month" size={28} color="white" />
            </View>
            <Text style={styles.dateSelectorText}>{formatShortDate(selectedDate)}</Text>
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

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={Colors.primary} style={LayoutStyles.mt50} />
        ) : (
          <View style={styles.listContent}>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <View key={item.id_record.toString()}>
                   {renderBillCard({ item })}
                </View>
              ))
            ) : (
              <View style={GlobalStyles.emptyContent}>
                <Text style={GlobalStyles.emptyText}>Tidak ada tagihan tertunda hari ini</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 20,
    gap: 15,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    height: 60,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#801919',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#801919',
    borderRadius: 15,
    height: 60,
    paddingRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  calendarIconWrapper: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    height: 60,
    width: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dateSelectorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 25,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#801919',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A1C1C',
  },
  cardDate: {
    fontSize: 13,
    color: '#A45D5D',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0E0E0',
  },
  cardBody: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  cardContentLeft: {
    flex: 2,
    paddingRight: 10,
  },
  cardContentCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  cardContentRight: {
    flex: 1.2,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  infoBlock: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8B4A4A',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoLabelCenter: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8B4A4A',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: '#444',
    lineHeight: 18,
  },
  treatmentBlock: {
    alignItems: 'center',
  },
  treatmentBadge: {
    backgroundColor: '#FDECEC',
    borderWidth: 1,
    borderColor: '#8B4A4A',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  treatmentText: {
    color: '#8B4A4A',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  printButton: {
    width: 170, // Fixed width to prevent it from being too big
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  printButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  printButtonTextWrapper: {
    flex: 1,
    marginLeft: 8,
  },
  printButtonSmallText: {
    color: 'white',
    fontSize: 9,
    opacity: 0.9,
  },
  printButtonBoldText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  arrowIconWrapper: {
    width: 15,
    height: 15,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
});




