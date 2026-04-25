import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../../../utils/supabase';
import { GlobalStyles, LayoutStyles, Colors } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlert } from '../../../context/AlertContext';

export function TampilRujukan() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  
  const calculateUmur = (tglLahir: string) => {
    if (!tglLahir) return '';
    try {
      const today = new Date();
      const birthDate = new Date(tglLahir);
      if (isNaN(birthDate.getTime())) return '';
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age.toString() + ' Tahun';
    } catch (e) {
      return '';
    }
  };


  useFocusEffect(
    React.useCallback(() => {
      fetchRecords();
    }, [])
  );

  const fetchRecords = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('tb_rujukan')
        .select(`
          *,
          tb_pasien (nama_pasien, jk, tgl_lahir, alamat),
          tb_rekam_medis (layanan, gigi, diagnosa, tanggal)
        `)
        .order('tgl', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[GlobalStyles.rujukanCard, LayoutStyles.shadowCard]}>
      <View style={LayoutStyles.flex1}>
        <Text style={GlobalStyles.rujukanCardTitle}>{item.tb_pasien?.nama_pasien || 'Pasien'}</Text>
        <Text style={GlobalStyles.rujukanCardSubtitle}>Tgl Rujukan: {item.tgl}</Text>
        <Text style={GlobalStyles.rujukanCardSubtitle}>Tujuan: {item.ditujukan}</Text>
      </View>
      <TouchableOpacity
        style={[GlobalStyles.rujukanActionBtn, { backgroundColor: '#2E50D4' }]}
        onPress={() => {

          const previewItem = {
            ...item,
            detail_pasien: {
              nama_pasien: item.tb_pasien?.nama_pasien,
              jenis_kelamin: item.tb_pasien?.jk,
              umur: calculateUmur(item.tb_pasien?.tgl_lahir),
              alamat: item.tb_pasien?.alamat
            },
            detail_medis: {
              keluhan_rujukan: item.keluhan_rujukan || item.keluhan,
              diagnosa: item.tb_rekam_medis?.diagnosa
            },
            isOrto: item.tb_rekam_medis?.layanan === 'Ortodental'
          };
          navigation.navigate('PreviewRujukan', { item: previewItem });
        }}
      >
        <MaterialCommunityIcons name="printer-eye" size={24} color="white" />
        <Text style={GlobalStyles.rujukanActionBtnText}>Lihat/Cetak</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <AdminLayout noScroll={true} customRightTitle="Arsip Rujukan">
      <ScrollView 
        style={[LayoutStyles.flex1, LayoutStyles.ph20, LayoutStyles.pt10]}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={true}
      >
        <View style={[LayoutStyles.rowBetween, LayoutStyles.mb15]}>
          <Text style={GlobalStyles.formSectionTitle}>ARSIP RUJUKAN</Text>
          <TouchableOpacity
            style={[GlobalStyles.listAddButton, { height: 45, paddingHorizontal: 15 }]}
            onPress={() => navigation.navigate('CreateRujukan')}
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={20} color="white" />
            <Text style={GlobalStyles.listAddButtonText}>Tambah Rujukan</Text>
          </TouchableOpacity>
        </View>

        <Text style={[LayoutStyles.mb10, LayoutStyles.italicText]}>
          Berikut adalah daftar surat rujukan yang telah dibuat sebelumnya.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={LayoutStyles.mt20} />
        ) : records.length === 0 ? (
          <View style={GlobalStyles.emptyContent}>
            <Text style={GlobalStyles.emptyText}>Belum ada histori rujukan.</Text>
          </View>
        ) : (
          <View>
            {records.map((item) => (
              <View key={item.id_rujukan.toString()}>
                 {renderItem({ item })}
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </AdminLayout>
  );
}


