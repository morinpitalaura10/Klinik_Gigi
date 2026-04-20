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
  Modal
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { supabase } from '../../../utils/supabase';
import { Colors, GlobalStyles, LayoutStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAlert } from '../../../context/AlertContext';

interface DentalRecord {
  id_record: number;
  tanggal: string;
  layanan: string;
  status: string;
  gigi: string;
  tb_pasien: {
    nama_pasien: string;
    jk: string;
  };
}

export function TampilRecordAdmin() {
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  const [records, setRecords] = useState<DentalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState<number | null>(null);


  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate] = useState(getLocalDate());

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tb_rekam_medis')
        .select(`
            *,
            tb_pasien (
                nama_pasien,
                jk
            )
        `)
        .eq('tanggal', selectedDate)
        .order('id_record', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [selectedDate])
  );

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tb_rekam_medis')
        .update({ status: newStatus })
        .eq('id_record', id);

      if (error) throw error;
      
      setRecords(prev => prev.map(item => 
        item.id_record === id ? { ...item, status: newStatus } : item
      ));
      setStatusModalVisible(false);
    } catch (error: any) {
      showAlert({ title: 'Gagal Update', message: error.message, type: 'error' });
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Menunggu': return { bg: '#F0F0F0', text: '#666' };
      case 'Diproses': return { bg: '#FFF9E6', text: '#D4A017' };
      case 'Selesai': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'Batal': return { bg: '#FFEBEE', text: '#C62828' };
      default: return { bg: '#FFF', text: '#000' };
    }
  };

  const filteredData = records.filter(item =>
    item.tb_pasien?.nama_pasien.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout noScroll={true} customRightTitle="Dental Record">
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.black} style={LayoutStyles.mt50} />
      ) : (
        <View style={LayoutStyles.flex1}>
          <View style={LayoutStyles.pt10}>
            
            <View style={[GlobalStyles.searchRow, LayoutStyles.ph20]}>
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

              <View style={GlobalStyles.listAddButtonContainer}>
                <TouchableOpacity
                  style={GlobalStyles.listAddButton}
                  onPress={() => navigation.navigate('CreateRecordAdmin')}
                >
                  <MaterialCommunityIcons name="plus" size={24} color="white" />
                  <Text style={GlobalStyles.listAddButtonText}>Record Baru</Text>
                </TouchableOpacity>
              </View>
            </View>

            
            <View style={[LayoutStyles.ph20, LayoutStyles.mb15]}>
                <Text style={GlobalStyles.inputLabel}>
                    Tanggal : {new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
            </View>
          </View>

          <View style={[GlobalStyles.tableContainer, LayoutStyles.mh20]}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <View style={[GlobalStyles.tableContentWrapper, LayoutStyles.w900]}>
                <View style={GlobalStyles.tableHeader}>
                  <View style={[GlobalStyles.tableHeaderCell, LayoutStyles.w220]}>
                    <Text style={GlobalStyles.tableHeaderText}>Nama</Text>
                  </View>
                  <View style={[GlobalStyles.tableHeaderCell, LayoutStyles.w100]}>
                    <Text style={GlobalStyles.tableHeaderText}>Gender</Text>
                  </View>
                  <View style={[GlobalStyles.tableHeaderCell, LayoutStyles.w150]}>
                    <Text style={GlobalStyles.tableHeaderText}>Layanan</Text>
                  </View>
                  <View style={[GlobalStyles.tableHeaderCell, LayoutStyles.w250]}>
                    <Text style={GlobalStyles.tableHeaderText}>Status Kunjungan</Text>
                  </View>
                  <View style={[GlobalStyles.tableHeaderCell, LayoutStyles.w180, { borderRightWidth: 0 }]}>
                    <Text style={GlobalStyles.tableHeaderText}>Aksi</Text>
                  </View>
                </View>

                <FlatList
                  data={filteredData}
                  keyExtractor={(item) => item.id_record.toString()}
                  refreshing={refreshing}
                  scrollEnabled={false}
                  onRefresh={() => {
                    setRefreshing(true);
                    fetchRecords();
                  }}
                  renderItem={({ item, index }) => {
                    const isLast = index === filteredData.length - 1;
                    const statusStyle = getStatusStyle(item.status);
                    
                    return (
                      <View style={[
                        GlobalStyles.tableRow,
                        isLast && GlobalStyles.tableRowLast
                      ]}>
                        <View style={[GlobalStyles.tableCell, LayoutStyles.w220, { alignItems: 'flex-start', paddingHorizontal: 15 }]}>
                          <Text style={GlobalStyles.tableRowText} numberOfLines={1}>{item.tb_pasien?.nama_pasien}</Text>
                        </View>
                        <View style={[GlobalStyles.tableCell, LayoutStyles.w100]}>
                          <Text style={GlobalStyles.tableRowText}>{item.tb_pasien?.jk}</Text>
                        </View>
                        <View style={[GlobalStyles.tableCell, LayoutStyles.w150]}>
                          <Text style={GlobalStyles.tableRowText}>{item.layanan}</Text>
                        </View>
                        
                        
                        <View style={[GlobalStyles.tableCell, LayoutStyles.w250, { paddingHorizontal: 15 }]}>
                          <TouchableOpacity 
                            style={[GlobalStyles.statusPill, { backgroundColor: statusStyle.bg }]}
                            onPress={() => {
                                setActiveRecordId(item.id_record);
                                setStatusModalVisible(true);
                            }}
                          >
                            <Text style={[GlobalStyles.statusPillText, { color: statusStyle.text }]}>{item.status}</Text>
                            <MaterialCommunityIcons name="chevron-down" size={16} color={statusStyle.text} />
                          </TouchableOpacity>
                        </View>

                        <View style={[GlobalStyles.tableCell, LayoutStyles.w180, { borderRightWidth: 0 }]}>
                          <TouchableOpacity
                            style={[GlobalStyles.btnActionUpdate, LayoutStyles.w140, { height: 35, marginLeft: 0 }]}
                            onPress={() => navigation.navigate('CreateRecordAdmin', { editItem: item })}
                          >
                            <Text style={[GlobalStyles.historyResetText, { color: 'white' }]}>Edit Data</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={GlobalStyles.emptyContent}>
                      <Text style={GlobalStyles.emptyText}>Tidak ada record kunjungan hari ini</Text>
                    </View>
                  }
                />
              </View>
            </ScrollView>
          </View>

          
          <Modal
            visible={statusModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setStatusModalVisible(false)}
          >
            <TouchableOpacity 
                style={GlobalStyles.selectionModalOverlay} 
                activeOpacity={1} 
                onPress={() => setStatusModalVisible(false)}
            >
                <View style={[GlobalStyles.selectionModalContent, LayoutStyles.w300]}>
                    <Text style={[GlobalStyles.selectionModalTitle, LayoutStyles.mb15]}>Ubah Status</Text>
                    
                    {['Menunggu', 'Diproses', 'Selesai', 'Batal'].map((opt) => (
                        <TouchableOpacity 
                            key={opt}
                            style={GlobalStyles.selectionOptionItem}
                            onPress={() => activeRecordId && updateStatus(activeRecordId, opt)}
                        >
                            <Text style={GlobalStyles.tableRowText}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
          </Modal>
        </View>
      )}
    </AdminLayout>
  );
}
