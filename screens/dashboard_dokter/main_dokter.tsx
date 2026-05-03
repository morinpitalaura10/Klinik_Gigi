import React, { useState, useCallback, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../utils/supabase';
import { Colors, DoctorDashboardStyles, GlobalStyles } from '../../styles/GlobalStyles';
import AdminLayout from '../../components/templates/AdminLayout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

interface DentalRecord {
  id_record: number;
  id_pasien: number;
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

export default function MainDokter() {
  const navigation = useNavigation<any>();
  const { user, logout } = useContext(AuthContext); 
  const { showAlert } = useAlert();
  const [records, setRecords] = useState<DentalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
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
        .in('status', ['Menunggu', 'Diproses']);

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

  const getFormattedDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dayName = days[currentTime.getDay()];
    const date = currentTime.getDate();
    const month = months[currentTime.getMonth()];
    const year = currentTime.getFullYear();
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');
    return `${dayName}, ${date} ${month} ${year} • ${hours}:${minutes}:${seconds}`;
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
        noScroll={true}
    >
      <ScrollView 
        style={DoctorDashboardStyles.mainContainer}
        contentContainerStyle={GlobalStyles.pb40}
        showsVerticalScrollIndicator={false}
      >
        <View style={DoctorDashboardStyles.doctorInfoContainer}>
            <Text style={DoctorDashboardStyles.doctorName}>
                drg. {user?.nama || 'Dokter'}
            </Text>
            <Text style={DoctorDashboardStyles.doctorSpec}>
                Spesialisasi : {user?.spesialisasi || '-'}
            </Text>
            <Text style={DoctorDashboardStyles.currentDate}>
                {getFormattedDate()}
            </Text>
        </View>

        <View style={DoctorDashboardStyles.tableWrapper}>
            {/* Header */}
            <View style={DoctorDashboardStyles.tableHeaderRow}>
                <View style={DoctorDashboardStyles.colName}>
                    <Text style={[DoctorDashboardStyles.thText, GlobalStyles.textAlignLeft, GlobalStyles.pl10]}>Nama</Text>
                </View>
                <View style={DoctorDashboardStyles.colGender}>
                    <Text style={[DoctorDashboardStyles.thText, GlobalStyles.textAlignCenter]}>Gender</Text>
                </View>
                <View style={DoctorDashboardStyles.colKeluhan}>
                    <Text style={[DoctorDashboardStyles.thText, GlobalStyles.textAlignCenter]}>Keluhan</Text>
                </View>
                <View style={DoctorDashboardStyles.colAksi}>
                    <Text style={[DoctorDashboardStyles.thText, GlobalStyles.textAlignCenter]}>Aksi</Text>
                </View>
            </View>

            {/* List */}
            {loading && !refreshing ? (
                <ActivityIndicator size="large" color={Colors.primary} style={GlobalStyles.mv30} />
            ) : (
                <View>
                    {records.length > 0 ? (
                        records.map((item, index) => (
                            <View key={item.id_record} style={DoctorDashboardStyles.tableRow}>
                                <View style={DoctorDashboardStyles.colName}>
                                    <Text style={[DoctorDashboardStyles.tdText, GlobalStyles.textAlignLeft, GlobalStyles.pl10]} numberOfLines={2}>
                                        {item.tb_pasien?.nama_pasien}
                                    </Text>
                                </View>

                                <View style={DoctorDashboardStyles.colGender}>
                                    <View style={DoctorDashboardStyles.badgeContainer}>
                                        <Text style={DoctorDashboardStyles.badgeText}>{item.tb_pasien?.jk}</Text>
                                    </View>
                                </View>

                                <View style={DoctorDashboardStyles.colKeluhan}>
                                    <Text style={[DoctorDashboardStyles.tdText, { textAlign: 'center' }]} numberOfLines={2}>
                                        {item.diagnosa || '-'}
                                    </Text>
                                </View>

                                <View style={DoctorDashboardStyles.colAksi}>
                                    <View style={{ gap: 8 }}>
                                        <TouchableOpacity 
                                            style={[DoctorDashboardStyles.btnEdit, { backgroundColor: '#1E88E5' }]}
                                            onPress={() => navigation.navigate('ReadPasien', { id: item.id_pasien })}
                                        >
                                            <MaterialCommunityIcons name="history" size={16} color="#FFF" />
                                            <Text style={DoctorDashboardStyles.btnEditText}>Riwayat</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity 
                                            style={DoctorDashboardStyles.btnEdit}
                                            onPress={() => navigation.navigate('IsiRekamMedis', { record: item })}
                                        >
                                            <MaterialCommunityIcons name="stethoscope" size={16} color="#FFF" />
                                            <Text style={DoctorDashboardStyles.btnEditText}>Tindakan</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={[GlobalStyles.p30, GlobalStyles.alignCenter]}>
                            <Text style={GlobalStyles.textLightGray}>Tidak ada antrean pasien hari ini</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
      </ScrollView>
    </AdminLayout>
  );
}

