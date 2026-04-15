import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { GlobalStyles, LayoutStyles, Colors } from '../../../styles/GlobalStyles';
import { supabase } from '../../../utils/supabase';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useNavigation, useRoute } from '@react-navigation/native';

export function ReadPasien() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = route.params || {};
  const { id } = params;

  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (id) {
        fetchDetail();
    } else {
        setLoading(false);
    }
  }, [id]);

  const fetchDetail = async () => {
    try {
      const { data: patient, error } = await supabase
        .from('tb_pasien')
        .select('*')
        .eq('id_pasien', id)
        .single();

      if (error) throw error;
      setData(patient);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <AdminLayout customRightTitle="Detail Pasien" noScroll={true}>
      <ScrollView contentContainerStyle={LayoutStyles.scrollContent}>
        <View style={GlobalStyles.detailMainCard}>
          <View style={LayoutStyles.row}>
            {/* Kolom Kiri */}
            <View style={LayoutStyles.flex1}>
              <View style={LayoutStyles.mb20}>
                <Text style={GlobalStyles.detailLabel}>Nama</Text>
                <Text style={GlobalStyles.detailValue}>{data.nama_pasien || 'Masukkan nama lengkap pasien'}</Text>
              </View>

              <View style={LayoutStyles.mb40}>
                <Text style={GlobalStyles.detailLabel}>Tanggal Lahir</Text>
                <Text style={GlobalStyles.detailValue}>{data.tgl_lahir || 'Masukkan tanggal lahir pasien'}</Text>
              </View>

              <View style={LayoutStyles.mb40}>
                <Text style={GlobalStyles.detailLabel}>Jenis Kelamin</Text>
                <Text style={GlobalStyles.detailValue}>{data.jk || 'Masukkan jenis kelamin pasien'}</Text>
              </View>

              <View style={LayoutStyles.mb20}>
                <Text style={GlobalStyles.detailLabel}>Alamat</Text>
                <Text style={GlobalStyles.detailValue}>{data.alamat || 'Masukkan alamat rumah pasien'}</Text>
              </View>
            </View>

            {/* Kolom Kanan */}
            <View style={LayoutStyles.flex1}>
              <View style={LayoutStyles.mb20}>
                <Text style={GlobalStyles.detailLabel}>Pekerjaan</Text>
                <Text style={GlobalStyles.detailValue}>{data.pekerjaan || 'Masukkan pekerjaan pasien'}</Text>
              </View>

              <View style={LayoutStyles.mb40}>
                <Text style={GlobalStyles.detailLabel}>Nomor Handphone</Text>
                <Text style={GlobalStyles.detailValue}>{data.nope || 'Masukkan no. hp aktif pasien'}</Text>
              </View>

              <View style={LayoutStyles.mb40}>
                <Text style={GlobalStyles.detailLabel}>Alergi Obat</Text>
                <Text style={GlobalStyles.detailValue}>{data.alergi_obat || 'Masukkan alergi obat pasien'}</Text>
              </View>
            </View>
          </View>

          <View style={[LayoutStyles.rowEnd, LayoutStyles.mt20]}>
            <TouchableOpacity 
              style={GlobalStyles.btnKembaliLink}
              onPress={() => navigation.goBack()}
            >
              <Text style={GlobalStyles.btnKembaliText}>Kembali</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </AdminLayout>
  );
}
