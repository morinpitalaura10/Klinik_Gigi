import React, { useState, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../utils/supabase';
import { Colors, GlobalStyles, LayoutStyles } from '../../styles/GlobalStyles';
import AdminLayout from '../../components/templates/AdminLayout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

interface DentalRecord {
  id_record: number;
  tanggal: string;
  layanan: string;
  status: string;
  keluhan: string;
  tb_pasien: {
    nama_pasien: string;
    jk: string;
  };
}

export default function MainDokter() {
  const navigation = useNavigation<any>();
  const { user, logout } = useContext(AuthContext); 
  const [records, setRecords] = useState<DentalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const today = new Date().toLocaleDateString('en-CA');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('tb_rekam_medis')
        .select(`
            *,
            tb_pasien (
                nama_pasien,
                jk
            )
        `)
        .eq('tanggal', today)
        .eq('status', 'Diproses');

      // Filter berdasarkan spesialisasi dokter (Sangat Fleksibel)
      if (user?.role === 'dokter' && user?.spesialisasi) {
          const spec = user.spesialisasi.toLowerCase();
          if (spec.includes('orto')) {
              // Menangkap 'Ortodental', 'Ortodonti', 'ortho', dll.
              query = query.ilike('layanan', '%orto%');
          } else if (spec.includes('umum')) {
              query = query.ilike('layanan', '%umum%');
          } else {
              query = query.ilike('layanan', `%${user.spesialisasi}%`);
          }
      }

      const { data, error } = await query.order('id_record', { ascending: true });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchQueue();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Apakah Anda yakin ingin keluar?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', onPress: logout }
    ]);
  };

  return (
    <AdminLayout 
        showBackButton={false} 
        customRightTitle="Dokter"
        onLogout={handleLogout}
    >
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.black} style={LayoutStyles.mt50} />
      ) : (
        <View style={LayoutStyles.flex1}>
          {/* Header Dashboard Dokter */}
          <View style={[LayoutStyles.ph20, LayoutStyles.pt10, LayoutStyles.mb20]}>
            <View>
                <Text style={{ fontSize: 13, color: '#888' }}>Selamat Bekerja,</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>
                    drg. {user?.nama || 'Dokter'}
                </Text>
                <Text style={{ fontSize: 12, color: Colors.primary, fontWeight: 'bold' }}>
                    Spesialisasi: {user?.spesialisasi || 'Belum Terdeteksi (Silakan Re-login)'}
                </Text>
                <Text style={{ fontSize: 13, color: '#555', marginTop: 2 }}>
                    Antrean Pasien - {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
            </View>
          </View>

          <View style={[GlobalStyles.tableContainer, LayoutStyles.mh20]}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <View style={[GlobalStyles.tableContentWrapper, { width: 700 }]}>
                <View style={GlobalStyles.tableHeader}>
                  <View style={[GlobalStyles.tableHeaderCell, { width: 200 }]}>
                    <Text style={GlobalStyles.tableHeaderText}>Nama</Text>
                  </View>
                  <View style={[GlobalStyles.tableHeaderCell, { width: 100 }]}>
                    <Text style={GlobalStyles.tableHeaderText}>Gender</Text>
                  </View>
                  <View style={[GlobalStyles.tableHeaderCell, { width: 300 }]}>
                    <Text style={GlobalStyles.tableHeaderText}>Keluhan</Text>
                  </View>
                  <View style={[GlobalStyles.tableHeaderCell, { width: 100, borderRightWidth: 0 }]}>
                    <Text style={GlobalStyles.tableHeaderText}>Aksi</Text>
                  </View>
                </View>

                <FlatList
                  data={records}
                  keyExtractor={(item) => item.id_record.toString()}
                  refreshing={refreshing}
                  scrollEnabled={false}
                  onRefresh={() => {
                    setRefreshing(true);
                    fetchQueue();
                  }}
                  renderItem={({ item, index }) => {
                    const isLast = index === records.length - 1;
                    return (
                      <View style={[
                        GlobalStyles.tableRow,
                        isLast && GlobalStyles.tableRowLast
                      ]}>
                        <View style={[GlobalStyles.tableCell, { width: 200, alignItems: 'flex-start', paddingHorizontal: 15 }]}>
                          <Text style={GlobalStyles.tableRowText} numberOfLines={1}>{item.tb_pasien?.nama_pasien}</Text>
                        </View>
                        <View style={[GlobalStyles.tableCell, { width: 100 }]}>
                          <Text style={GlobalStyles.tableRowText}>{item.tb_pasien?.jk}</Text>
                        </View>
                        <View style={[GlobalStyles.tableCell, { width: 300, alignItems: 'flex-start', paddingHorizontal: 15 }]}>
                          <Text style={GlobalStyles.tableRowText} numberOfLines={2}>{item.keluhan}</Text>
                        </View>
                        <View style={[GlobalStyles.tableCell, { width: 100, borderRightWidth: 0 }]}>
                          <TouchableOpacity
                            style={[GlobalStyles.btnSimpan, { height: 35, width: 70, paddingVertical: 0, borderRadius: 8, marginLeft: 0 }]}
                            onPress={() => navigation.navigate('IsiRekamMedis', { record: item })}
                          >
                            <MaterialCommunityIcons name="note-edit-outline" size={20} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={GlobalStyles.emptyContent}>
                      <Text style={GlobalStyles.emptyText}>Tidak ada antrean pasien untuk hari ini</Text>
                    </View>
                  }
                />
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </AdminLayout>
  );
}
