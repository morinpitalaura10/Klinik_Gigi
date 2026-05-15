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
import { Colors, GlobalStyles, LayoutStyles, DentalRecordStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAlert } from '../../../context/AlertContext';

interface DentalRecord {
  id_record: number;
  tanggal: string;
  layanan: string;
  status: string;
  diagnosa?: string;
  gigi?: string;
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

  const activeRecordStatus = records.find(r => r.id_record === activeRecordId)?.status || '';


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
    <AdminLayout customRightTitle="Dental Record">
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.black} style={LayoutStyles.mt50} />
      ) : (
        <View style={DentalRecordStyles.mainContainer}>
          <View style={DentalRecordStyles.topSection}>
            
            <View style={DentalRecordStyles.headerRow}>
              <View>
                <Text style={DentalRecordStyles.headerTitle}>Histori Dental Record</Text>
              </View>
              <TouchableOpacity 
                style={DentalRecordStyles.btnRecordBaru}
                onPress={() => navigation.navigate('CreateRecordAdmin')}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
                <Text style={DentalRecordStyles.btnRecordBaruText}>Record Baru</Text>
              </TouchableOpacity>
            </View>

            <View style={DentalRecordStyles.searchContainer}>
              <Feather name="search" size={20} color="#AAA" />
              <TextInput
                style={DentalRecordStyles.searchInput}
                placeholder="Cari nama pasien..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#AAA"
              />
            </View>
          </View>

          <View style={DentalRecordStyles.tableWrapper}>
            <View style={DentalRecordStyles.tableHeader}>
              <Text style={[DentalRecordStyles.thText, DentalRecordStyles.colNama]}>Nama</Text>
              <Text style={[DentalRecordStyles.thText, DentalRecordStyles.thCenter, DentalRecordStyles.colGender]}>Gender</Text>
              <Text style={[DentalRecordStyles.thText, DentalRecordStyles.thCenter, DentalRecordStyles.colKeluhan]}>Keluhan/Diagnosis</Text>
              <Text style={[DentalRecordStyles.thText, DentalRecordStyles.thCenter, DentalRecordStyles.colLayanan]}>Status Layanan</Text>
              <Text style={[DentalRecordStyles.thText, DentalRecordStyles.thCenter, DentalRecordStyles.colStatus]}>Status</Text>
              <Text style={[DentalRecordStyles.thText, DentalRecordStyles.thCenter, DentalRecordStyles.colAksi]}>Aksi</Text>
            </View>

            <View>
              {filteredData.length === 0 ? (
                <View style={[GlobalStyles.emptyContent, { paddingVertical: 40 }]}>
                  <Text style={GlobalStyles.emptyText}>Tidak ada record kunjungan hari ini</Text>
                </View>
              ) : (
                filteredData.map((item) => {
                  const statusStyle = getStatusStyle(item.status);
                  return (
                    <View key={item.id_record.toString()} style={DentalRecordStyles.tableRow}>
                      <Text style={[DentalRecordStyles.tdText, DentalRecordStyles.colNama]} numberOfLines={1}>
                        {item.tb_pasien?.nama_pasien || '-'}
                      </Text>
                      
                      <View style={[DentalRecordStyles.colGender, DentalRecordStyles.badgeContainerOuter]}>
                        <View style={DentalRecordStyles.badgeContainer}>
                          <Text style={DentalRecordStyles.badgeText}>{item.tb_pasien?.jk || '-'}</Text>
                        </View>
                      </View>

                      <Text 
                        style={[DentalRecordStyles.tdCenterText, DentalRecordStyles.colKeluhan, { fontSize: 13, color: '#444' }]} 
                        numberOfLines={2}
                      >
                        {item.diagnosa || '-'}
                      </Text>

                      <Text style={[DentalRecordStyles.tdCenterText, DentalRecordStyles.colLayanan]}>
                        {item.layanan || '-'}
                      </Text>
                      
                      <View style={[DentalRecordStyles.colStatus, DentalRecordStyles.badgeContainerOuter]}>
                        <TouchableOpacity 
                          style={[DentalRecordStyles.badgeContainer, { backgroundColor: statusStyle.bg, borderWidth: 1, borderColor: statusStyle.text }]}
                          onPress={() => {
                            if (item.status === 'Menunggu' || item.status === 'Diproses') {
                              setActiveRecordId(item.id_record);
                              setStatusModalVisible(true);
                            }
                          }}
                          disabled={item.status === 'Selesai' || item.status === 'Batal'}
                        >
                          <Text style={[DentalRecordStyles.badgeText, { marginRight: 5, color: statusStyle.text }]}>{item.status}</Text>
                          {(item.status === 'Menunggu' || item.status === 'Diproses') && (
                            <MaterialCommunityIcons name="menu-down" size={16} color={statusStyle.text} />
                          )}
                        </TouchableOpacity>
                      </View>

                      <View style={[DentalRecordStyles.colAksi, { alignItems: 'center' }]}>
                        <TouchableOpacity
                          style={DentalRecordStyles.btnEditAction}
                          onPress={() => navigation.navigate('CreateRecordAdmin', { editItem: item })}
                        >
                          <Feather name="edit" size={14} color="#FFF" />
                          <Text style={DentalRecordStyles.btnEditActionText}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          <Modal
            visible={statusModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setStatusModalVisible(false)}
          >
            <TouchableOpacity 
                style={DentalRecordStyles.modalOverlay} 
                activeOpacity={1} 
                onPress={() => setStatusModalVisible(false)}
            >
                <View style={[DentalRecordStyles.modalContent, DentalRecordStyles.modalContentPremium]}>
                    <View style={LayoutStyles.rowBetweenMB25W100p}>
                        <Text style={[DentalRecordStyles.modalTitle, DentalRecordStyles.modalTitleLeft]}>Ubah Status</Text>
                        <TouchableOpacity onPress={() => setStatusModalVisible(false)} style={DentalRecordStyles.modalCloseBtn}>
                            <MaterialCommunityIcons name="close" size={22} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                    
                    {activeRecordStatus === 'Menunggu' && (
                        <TouchableOpacity 
                            style={[DentalRecordStyles.modalOptionBtn, { 
                                backgroundColor: '#D4A017',
                                borderColor: '#D4A017',
                                borderRadius: 15,
                                paddingVertical: 15,
                                width: '100%',
                                marginBottom: 10,
                            }]}
                            onPress={() => activeRecordId && updateStatus(activeRecordId, 'Diproses')}
                        >
                            <Text style={[DentalRecordStyles.modalOptionText, { color: '#FFF', fontWeight: 'bold', fontSize: 16 }]}>Kirim ke Dokter (Diproses)</Text>
                        </TouchableOpacity>
                    )}

                    {(activeRecordStatus === 'Menunggu' || activeRecordStatus === 'Diproses') && (
                        <TouchableOpacity 
                            style={[DentalRecordStyles.modalOptionBtn, { 
                                backgroundColor: Colors.primary,
                                borderColor: Colors.primary,
                                borderRadius: 15,
                                paddingVertical: 15,
                                width: '100%'
                            }]}
                            onPress={() => activeRecordId && updateStatus(activeRecordId, 'Batal')}
                        >
                            <Text style={[DentalRecordStyles.modalOptionText, { color: '#FFF', fontWeight: 'bold', fontSize: 16 }]}>Batal</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
          </Modal>
        </View>
      )}
    </AdminLayout>
  );
}
