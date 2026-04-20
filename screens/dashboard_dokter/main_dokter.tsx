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
import { useAlert } from '../../context/AlertContext';

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

export default function MainDokter() {
  const navigation = useNavigation<any>();
  const { user, logout } = useContext(AuthContext); 
  const { showAlert } = useAlert();
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

      if (user?.role === 'dokter' && user?.spesialisasi) {
          const spec = user.spesialisasi.toLowerCase();
          if (spec.includes('orto')) {
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
      showAlert({ title: 'Error', message: error.message, type: 'error' });
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

  const formatTanggalValue = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const handleLogout = () => {
    showAlert({ 
      title: 'Logout', 
      message: 'Apakah Anda yakin ingin keluar?', 
      type: 'confirm',
      onConfirm: logout
    });
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
          <View style={[LayoutStyles.ph20, LayoutStyles.pt10, LayoutStyles.mb20]}>
            <View>
                <Text style={LayoutStyles.textGray}>Selamat Bekerja,</Text>
                <Text style={[LayoutStyles.textBoldHuge, LayoutStyles.textDark]}>
                    drg. {user?.nama || 'Dokter'}
                </Text>
                <Text style={LayoutStyles.textSmallPrimary}>
                    Spesialisasi: {user?.spesialisasi || 'Belum Terdeteksi (Silakan Re-login)'}
                </Text>
                <Text style={[LayoutStyles.textGrayDark, LayoutStyles.mt10]}>
                    Antrean Pasien - {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
            </View>
          </View>

          <View style={[GlobalStyles.tableContainer, LayoutStyles.mh20]}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
              <View style={[GlobalStyles.tableContentWrapper, { width: 900, borderLeftWidth: 1, borderRightWidth: 1, borderTopWidth: 1, borderTopColor: Colors.black }]}>
                <View style={[GlobalStyles.tableRowAtomic, { backgroundColor: Colors.white, minHeight: 50 }]}>
                    <View style={[GlobalStyles.tableCellAtomic, GlobalStyles.tableCellFirst, { width: 130 }]}><Text style={GlobalStyles.tableThText}>Tanggal</Text></View>
                    <View style={[GlobalStyles.tableCellAtomic, { width: 190 }]}><Text style={GlobalStyles.tableThText}>Nama Pasien</Text></View>
                    <View style={[GlobalStyles.tableCellAtomic, { width: 110 }]}><Text style={GlobalStyles.tableThText}>JK</Text></View>
                    <View style={[GlobalStyles.tableCellAtomic, { width: 140 }]}><Text style={GlobalStyles.tableThText}>Layanan</Text></View>
                    <View style={[GlobalStyles.tableCellAtomic, { width: 190 }]}><Text style={GlobalStyles.tableThText}>Nomor Gigi</Text></View>
                    <View style={[GlobalStyles.tableCellAtomic, { width: 140, borderRightWidth: 0 }]}><Text style={GlobalStyles.tableThText}>Aksi</Text></View>
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
                      <View style={[GlobalStyles.tableRowAtomic, isLast && { borderBottomWidth: 0 }]}>
                        <View style={[GlobalStyles.tableCellAtomic, GlobalStyles.tableCellFirst, { width: 130 }]}><Text style={GlobalStyles.tableTdText}>{formatTanggalValue(item.tanggal)}</Text></View>
                        <View style={[GlobalStyles.tableCellAtomic, { width: 190 }]}><Text style={GlobalStyles.tableTdText} numberOfLines={2}>{item.tb_pasien?.nama_pasien}</Text></View>
                        <View style={[GlobalStyles.tableCellAtomic, { width: 110 }]}><Text style={GlobalStyles.tableTdText}>{item.tb_pasien?.jk}</Text></View>
                        <View style={[GlobalStyles.tableCellAtomic, { width: 140 }]}><Text style={GlobalStyles.tableTdText} numberOfLines={2}>{item.layanan}</Text></View>
                        <View style={[GlobalStyles.tableCellAtomic, { width: 190 }]}><Text style={GlobalStyles.tableTdText} numberOfLines={2}>{item.gigi}</Text></View>
                        <View style={[GlobalStyles.tableCellAtomic, { width: 140, borderRightWidth: 0 }]}>
                          <TouchableOpacity
                            style={[GlobalStyles.btnActionUpdate, LayoutStyles.h35, { width: 110, paddingVertical: 0, borderRadius: 8, marginLeft: 0 }]}
                            onPress={() => navigation.navigate('IsiRekamMedis', { record: item })}
                          >
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>Edit Data</Text>
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

