import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../../utils/supabase';
import AdminLayout from '../../../components/templates/AdminLayout';
import { Colors, GlobalStyles, LayoutStyles, PatientDetailStyles } from '../../../styles/GlobalStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function ReadUser() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string | number };

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [totalPatients, setTotalPatients] = useState(0);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const { data: user, error: userError } = await supabase
        .from('tb_users')
        .select('*')
        .eq('id_users', id)
        .single();

      if (userError) throw userError;
      setUserData(user);

      if (user.role === 'dokter') {
        const { data: doctor, error: docError } = await supabase
          .from('tb_dokter')
          .select('*')
          .eq('user_id', id)
          .maybeSingle();

        if (doctor) {
          setDoctorData(doctor);
          
          const { data: recordData } = await supabase
            .from('tb_rekam_medis')
            .select('id_pasien')
            .eq('doctor_id', id);

          if (recordData) {
            const uniquePatients = new Set(recordData.map(r => r.id_pasien)).size;
            setTotalPatients(uniquePatients);
          }
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout customLeftTitle="Detail Pengguna" customRightTitle="Manajemen User">
        <View style={LayoutStyles.scrollContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      customLeftTitle="Detail Pengguna" 
      customRightTitle="Manajemen User"
    >
      <View style={[PatientDetailStyles.container, { padding: 20 }]}>
        
        <View style={PatientDetailStyles.infoCard}>
            <View style={PatientDetailStyles.infoTitleBar}>
                <MaterialCommunityIcons name="account-outline" size={20} color="#FFF" />
                <Text style={PatientDetailStyles.infoTitleText}>INFORMASI AKUN</Text>
            </View>

            <View style={PatientDetailStyles.gridRow}>
                <View style={PatientDetailStyles.gridCell}>
                    <Text style={PatientDetailStyles.infoLabel}>Nama Lengkap</Text>
                    <Text style={PatientDetailStyles.infoValue}>{userData?.nama_users || '-'}</Text>
                </View>
                <View style={[PatientDetailStyles.gridCell, PatientDetailStyles.gridCellLast]}>
                    <Text style={PatientDetailStyles.infoLabel}>Role / Jabatan</Text>
                    <Text style={[PatientDetailStyles.infoValue, { color: userData?.role === 'admin' ? '#1976D2' : '#2E7D32' }]}>
                      {userData?.role?.toUpperCase() || '-'}
                    </Text>
                </View>
            </View>

            <View style={[PatientDetailStyles.gridRow, userData?.role !== 'dokter' && { borderBottomWidth: 0 }]}>
                <View style={PatientDetailStyles.gridCell}>
                    <Text style={PatientDetailStyles.infoLabel}>Username</Text>
                    <Text style={PatientDetailStyles.infoValue}>@{userData?.us || '-'}</Text>
                </View>
                <View style={[PatientDetailStyles.gridCell, PatientDetailStyles.gridCellLast]}>
                    <Text style={PatientDetailStyles.infoLabel}>Email Pengguna</Text>
                    <Text style={PatientDetailStyles.infoValue}>{userData?.email_users || '-'}</Text>
                </View>
            </View>

            {userData?.role === 'dokter' && (
              <View style={[PatientDetailStyles.gridRow, { borderBottomWidth: 0 }]}>
                  <View style={PatientDetailStyles.gridCell}>
                      <Text style={PatientDetailStyles.infoLabel}>Spesialisasi Dokter</Text>
                      <Text style={PatientDetailStyles.infoValue}>{doctorData?.spesialisasi || 'Umum'}</Text>
                  </View>
                  <View style={[PatientDetailStyles.gridCell, PatientDetailStyles.gridCellLast]}>
                      <Text style={PatientDetailStyles.infoLabel}>Pasien Ditangani</Text>
                      <Text style={PatientDetailStyles.infoValue}>{totalPatients} Pasien</Text>
                  </View>
              </View>
            )}
        </View>

      </View>
    </AdminLayout>
  );
}
