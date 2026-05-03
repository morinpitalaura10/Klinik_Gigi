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
import { Colors, GlobalStyles, LayoutStyles, DentalRecordStyles, ManagementStyles } from '../../../styles/GlobalStyles';
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
          style={LayoutStyles.flex1}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={ManagementStyles.container}>
            <View style={ManagementStyles.headerRow}>
              <View>
                <Text style={ManagementStyles.title}>Data Pasien</Text>
                <Text style={ManagementStyles.subtitle}>Kelola informasi pasien klinik</Text>
              </View>
              <TouchableOpacity
                style={ManagementStyles.btnBlue}
                onPress={() => navigation.navigate('CreatePasien')}
              >
                <Text style={ManagementStyles.btnBlueText}>Pasien Baru</Text>
              </TouchableOpacity>
            </View>

            <View style={ManagementStyles.searchBar}>
              <Feather name="search" size={20} color="#94A3B8" />
              <TextInput
                style={ManagementStyles.searchInput}
                placeholder="Cari nama pasien..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={ManagementStyles.tableContainer}>
            <View style={{ width: '100%' }}>
              <View style={ManagementStyles.tableHeaderMaron}>
                <View style={[ManagementStyles.colCenter, { flex: 1.5, paddingHorizontal: 15 }]}>
                  <Text style={ManagementStyles.thText}>Nama</Text>
                </View>
                <View style={[ManagementStyles.colCenter, { flex: 1.2, paddingHorizontal: 15 }]}>
                  <Text style={ManagementStyles.thText}>Tgl Lahir</Text>
                </View>
                <View style={[ManagementStyles.colCenter, { flex: 0.8, paddingHorizontal: 15 }]}>
                  <Text style={ManagementStyles.thText}>Gen</Text>
                </View>
                <View style={[ManagementStyles.colCenter, { flex: 1.5, paddingHorizontal: 15 }]}>
                  <Text style={ManagementStyles.thText}>Alamat</Text>
                </View>
                <View style={[ManagementStyles.colCenter, { flex: 1, paddingHorizontal: 15 }]}>
                  <Text style={ManagementStyles.thText}>Pekerjaan</Text>
                </View>
                <View style={[ManagementStyles.colCenter, { flex: 1, paddingHorizontal: 15 }]}>
                  <Text style={ManagementStyles.thText}>No. HP</Text>
                </View>
                <View style={[ManagementStyles.colCenter, { flex: 1, paddingHorizontal: 15 }]}>
                  <Text style={ManagementStyles.thText}>Alergi</Text>
                </View>
                <View style={[ManagementStyles.colCenter, { flex: 1.2, paddingHorizontal: 15 }]}>
                  <Text style={ManagementStyles.thText}>Aksi</Text>
                </View>
              </View>

              <View>
                {filteredData.length === 0 ? (
                  <View style={{ width: '100%', paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={[ManagementStyles.tdTextSmall, { textAlign: 'center' }]}>Data pasien tidak ditemukan</Text>
                  </View>
                ) : (
                  filteredData.map((item, index) => {
                    const isLast = index === filteredData.length - 1;
                    return (
                      <View key={item.id_pasien.toString()} style={[ManagementStyles.tableRow, { borderBottomWidth: isLast ? 0 : 1 }]}>
                        <View style={[{ flex: 1.5, paddingHorizontal: 15, justifyContent: 'center' }]}>
                          <Text style={[ManagementStyles.tdText, { textAlign: 'left' }]} numberOfLines={1}>{item.nama_pasien}</Text>
                        </View>
                        <View style={[ManagementStyles.colCenter, { flex: 1.2, paddingHorizontal: 15 }]}>
                          <Text style={ManagementStyles.tdTextSmall}>{item.tgl_lahir}</Text>
                        </View>
                        <View style={[ManagementStyles.colCenter, { flex: 0.8, paddingHorizontal: 15 }]}>
                          <View style={[ManagementStyles.roleBadge, { backgroundColor: item.jk === 'Laki-laki' ? '#D6E0E9' : '#E9D6D6' }]}>
                            <Text style={[ManagementStyles.roleBadgeText, { color: item.jk === 'Laki-laki' ? '#194580' : '#801919' }]}>
                              {item.jk === 'Laki-laki' ? 'LK' : 'PR'}
                            </Text>
                          </View>
                        </View>
                        <View style={[{ flex: 1.5, paddingHorizontal: 15, justifyContent: 'center' }]}>
                          <Text style={[ManagementStyles.tdTextSmall, { textAlign: 'left' }]} numberOfLines={2}>{item.alamat}</Text>
                        </View>
                        <View style={[ManagementStyles.colCenter, { flex: 1.2, paddingHorizontal: 15 }]}>
                          <Text style={ManagementStyles.tdTextSmall} numberOfLines={1}>{item.pekerjaan}</Text>
                        </View>
                        <View style={[ManagementStyles.colCenter, { flex: 1.2, paddingHorizontal: 15 }]}>
                          <Text style={ManagementStyles.tdTextSmall}>{item.nope}</Text>
                        </View>
                        <View style={[ManagementStyles.colCenter, { flex: 1.2, paddingHorizontal: 15 }]}>
                          <Text style={ManagementStyles.tdTextSmall}>{item.alergi_obat || '-'}</Text>
                        </View>
                        <View style={[ManagementStyles.actionCell, { flex: 1.2, paddingHorizontal: 15 }]}>
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
                    );
                  })
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </AdminLayout>
  );
}


