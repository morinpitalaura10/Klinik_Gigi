import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  StyleSheet
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { supabase } from '../../../utils/supabase';
import { Colors, GlobalStyles, LayoutStyles, DentalRecordStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

interface Pasien {
  id_pasien: number;
  nama_pasien: string;
  nope: string;
  pekerjaan: string;
  alamat: string;
  tgl_lahir: string;
  jk: string;
  alergi_obat: string;
}

export function TampilPasien() {
  const navigation = useNavigation<any>();
  const [pasien, setPasien] = useState<Pasien[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchPasien = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tb_pasien')
        .select('*')
        .order('nama_pasien', { ascending: true });

      if (error) throw error;
      setPasien(data || []);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPasien();
    }, [])
  );

  const filteredData = pasien.filter(item =>
    item.nama_pasien.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout noScroll={true} customRightTitle="Admin">
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.primary} style={LayoutStyles.mt50} />
      ) : (
        <ScrollView
          style={{ flex: 1, backgroundColor: '#F5F5F5' }}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Top Section */}
          <View style={DentalRecordStyles.topSection}>
            <View style={DentalRecordStyles.headerRow}>
              <View>
                <Text style={DentalRecordStyles.headerTitle}>Data Pasien</Text>
                <Text style={DentalRecordStyles.headerSubtitle}>Kelola informasi pasien klinik</Text>
              </View>
              <TouchableOpacity
                style={DentalRecordStyles.btnRecordBaru}
                onPress={() => navigation.navigate('CreatePasien')}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
                <Text style={DentalRecordStyles.btnRecordBaruText}>Pasien Baru</Text>
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

          {/* Table */}
          <View style={DentalRecordStyles.tableWrapper}>
            {/* HEADER */}
            <View style={t.row}>
              <View style={[t.cell, t.headerBg]}><Text style={t.hTxt}>Nama</Text></View>
              <View style={[t.cell, t.headerBg]}><Text style={t.hTxt}>Tgl Lahir</Text></View>
              <View style={[t.cell, t.headerBg]}><Text style={t.hTxt}>Gender</Text></View>
              <View style={[t.cell, t.headerBg]}><Text style={t.hTxt}>Alamat</Text></View>
              <View style={[t.cell, t.headerBg]}><Text style={t.hTxt}>Pekerjaan</Text></View>
              <View style={[t.cell, t.headerBg]}><Text style={t.hTxt}>No. HP</Text></View>
              <View style={[t.cell, t.headerBg]}><Text style={t.hTxt}>Alergi Obat</Text></View>
              <View style={[t.cell, t.headerBg]}><Text style={t.hTxt}>Aksi</Text></View>
            </View>

            {/* BODY — no inner scroll, all rows rendered directly */}
            {filteredData.length === 0 ? (
              <View style={{ width: '100%', paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 13, color: '#999', textAlign: 'center' }}>Data pasien tidak ditemukan</Text>
              </View>
            ) : (
              filteredData.map((item) => (
                <View key={item.id_pasien.toString()} style={[t.row, t.bodyBorder]}>
                  <View style={t.cell}>
                    <Text style={t.bTxt} numberOfLines={1}>{item.nama_pasien}</Text>
                  </View>
                  <View style={t.cell}>
                    <Text style={t.bTxt}>{item.tgl_lahir}</Text>
                  </View>
                  <View style={t.cell}>
                    <View style={[t.badge, { backgroundColor: item.jk === 'Laki-laki' ? '#D6E0E9' : '#E9D6D6' }]}>
                      <Text style={{ fontSize: 11, fontWeight: '900', color: item.jk === 'Laki-laki' ? '#194580' : '#801919' }}>
                        {item.jk === 'Laki-laki' ? 'LK' : 'PR'}
                      </Text>
                    </View>
                  </View>
                  <View style={t.cell}>
                    <Text style={t.bTxt} numberOfLines={2}>{item.alamat}</Text>
                  </View>
                  <View style={t.cell}>
                    <Text style={t.bTxt} numberOfLines={1}>{item.pekerjaan}</Text>
                  </View>
                  <View style={t.cell}>
                    <Text style={t.bTxt}>{item.nope}</Text>
                  </View>
                  <View style={t.cell}>
                    <Text style={t.bTxt}>{item.alergi_obat || '-'}</Text>
                  </View>
                  <View style={[t.cell, { flexDirection: 'row', gap: 6 }]}>
                    <TouchableOpacity onPress={() => navigation.navigate('UpdatePasien', { editItem: item })}>
                      <MaterialCommunityIcons name="square-edit-outline" size={20} color="#EBC112" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('ReadPasien', { id: item.id_pasien })}>
                      <MaterialCommunityIcons name="information-outline" size={20} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('DeletePasien', { id: item.id_pasien, name: item.nama_pasien })}>
                      <MaterialCommunityIcons name="trash-can-outline" size={20} color="#D32F2F" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </AdminLayout>
  );
}

const t = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  headerBg: {
    backgroundColor: Colors.primary,
  },
  bodyBorder: {
    borderBottomWidth: 1,
    borderColor: '#EBEBEB',
    backgroundColor: '#FFF',
  },
  hTxt: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  bTxt: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },
});
