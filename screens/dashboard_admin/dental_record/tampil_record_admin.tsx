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

            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.id_record.toString()}
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchRecords();
              }}
              renderItem={({ item }) => {
                const statusStyle = getStatusStyle(item.status);
                return (
                  <View style={DentalRecordStyles.tableRow}>
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
                        style={DentalRecordStyles.badgeContainer}
                        onPress={() => {
                          setActiveRecordId(item.id_record);
                          setStatusModalVisible(true);
                        }}
                      >
                        <Text style={[DentalRecordStyles.badgeText, { marginRight: 5 }]}>{item.status}</Text>
                        <MaterialCommunityIcons name="menu-down" size={16} color={Colors.primary} />
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
              }}
              ListEmptyComponent={
                <View style={[GlobalStyles.emptyContent, { paddingVertical: 40 }]}>
                  <Text style={GlobalStyles.emptyText}>Tidak ada record kunjungan hari ini</Text>
                </View>
              }
            />
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
                <View style={DentalRecordStyles.modalContent}>
                    <Text style={DentalRecordStyles.modalTitle}>Ubah Status</Text>
                    
                    {['Menunggu', 'Diproses', 'Selesai', 'Batal'].map((opt) => {
                        let colorStr = '#666';
                        if (opt === 'Menunggu') colorStr = '#666';
                        if (opt === 'Diproses') colorStr = '#FFD700'; // Pure bright yellow
                        if (opt === 'Selesai') colorStr = '#4CAF50';  // Green
                        if (opt === 'Batal') colorStr = Colors.primary; // Maroon

                        return (
                          <TouchableOpacity 
                              key={opt}
                              style={[DentalRecordStyles.modalOptionBtn, { borderColor: colorStr }]}
                              onPress={() => activeRecordId && updateStatus(activeRecordId, opt)}
                          >
                              <Text style={[DentalRecordStyles.modalOptionText, { color: colorStr }]}>{opt}</Text>
                          </TouchableOpacity>
                        );
                    })}
                </View>
            </TouchableOpacity>
          </Modal>
        </View>
      )}
    </AdminLayout>
  );
}
