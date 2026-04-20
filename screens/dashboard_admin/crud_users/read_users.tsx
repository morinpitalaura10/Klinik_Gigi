import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../../utils/supabase';
import AdminLayout from '../../../components/templates/AdminLayout';
import { Colors, GlobalStyles, LayoutStyles } from '../../../styles/GlobalStyles';
import { useNavigation, useRoute } from '@react-navigation/native';

export function ReadUser() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string | number };

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [doctorData, setDoctorData] = useState<any>(null);

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
        
        if (doctor) setDoctorData(doctor);
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
      <View style={GlobalStyles.formCard}>
        
        <View style={GlobalStyles.detailRow}>
          <View style={GlobalStyles.detailItem}>
            <Text style={GlobalStyles.detailLabel}>Nama Lengkap</Text>
            <Text style={GlobalStyles.detailValue}>{userData?.nama_users || '-'}</Text>
          </View>
          <View style={GlobalStyles.detailItem}>
            <Text style={GlobalStyles.detailLabel}>Username</Text>
            <Text style={GlobalStyles.detailValue}>{userData?.us || '-'}</Text>
          </View>
        </View>

        
        <View style={GlobalStyles.detailRow}>
          <View style={GlobalStyles.detailItem}>
            <Text style={GlobalStyles.detailLabel}>Email Pengguna</Text>
            <Text style={GlobalStyles.detailValue}>{userData?.email_users || '-'}</Text>
          </View>
          <View style={GlobalStyles.detailItem}>
            <Text style={GlobalStyles.detailLabel}>Role / Jabatan</Text>
            <Text style={GlobalStyles.detailValue}>{userData?.role?.toUpperCase() || '-'}</Text>
          </View>
        </View>

        
        {userData?.role === 'dokter' && (
          <View style={GlobalStyles.detailRow}>
            <View style={GlobalStyles.detailItem}>
              <Text style={GlobalStyles.detailLabel}>Bidang Spesialisasi</Text>
              <Text style={GlobalStyles.detailValue}>{doctorData?.spesialisasi || 'Umum'}</Text>
            </View>
          </View>
        )}

        <View style={GlobalStyles.detailFooter}>
          <TouchableOpacity 
            style={GlobalStyles.btnBack}
            onPress={() => navigation.goBack()}
          >
            <Text style={GlobalStyles.btnBackText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AdminLayout>
  );
}
