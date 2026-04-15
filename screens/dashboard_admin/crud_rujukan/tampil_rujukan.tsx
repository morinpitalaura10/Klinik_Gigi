import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../../../utils/supabase';
import { GlobalStyles, LayoutStyles, Colors } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function TampilRujukan() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useFocusEffect(
    React.useCallback(() => {
        fetchRecords();
    }, [])
  );

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // Fetch rekam medis yang sudah Selesai (siap dicetak rujukannya)
      const { data, error } = await supabase
        .from('tb_rekam_medis')
        .select(`
          id_record,
          tanggal,
          diagnosa,
          keluhan,
          keterangan,
          layanan,
          id_tindakan,
          id_pasien,
          tb_pasien (
            id_pasien,
            nama_pasien,
            alamat,
            tgl_lahir,
            jk,
            nope
          ),
          tb_tindakan (
            nama_tindakan
          )
        `)
        .eq('status', 'Selesai')
        .order('tanggal', { ascending: false });

      if (error) {
        throw error;
      }

      setRecords(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.tb_pasien?.nama_pasien || 'Nama tidak tersedia'}</Text>
        <Text style={styles.cardSubtitle}>Tanggal: {item.tanggal}</Text>
        <Text style={styles.cardSubtitle}>Perawatan: {item.tb_tindakan?.nama_tindakan || item.layanan}</Text>
      </View>
      <TouchableOpacity 
        style={styles.actionBtn}
        onPress={() => navigation.navigate('CreateRujukan', { record: item })}
      >
        <MaterialCommunityIcons name="file-export" size={24} color="white" />
        <Text style={styles.actionBtnText}>Buat Rujukan</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <AdminLayout noScroll={true} customRightTitle="Antrian Rujukan">
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={[GlobalStyles.formSectionTitle, LayoutStyles.mb20]}>DAFTAR ANTRIAN RUJUKAN</Text>
        <Text style={{marginBottom: 10, fontStyle: 'italic', color: '#555'}}>
            Pilih record pasien di bawah ini untuk membuat Surat Rujukan.
        </Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={LayoutStyles.mt20} />
        ) : records.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Tidak ada data rekam medis selesai.</Text>
        ) : (
          <FlatList
            data={records}
            keyExtractor={(item) => item.id_record.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}

      </View>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  actionBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  }
});
