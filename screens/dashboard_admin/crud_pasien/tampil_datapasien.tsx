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
import { Colors, GlobalStyles, LayoutStyles, DentalRecordStyles, ManagementStyles, PatientTableStyles } from '../../../styles/GlobalStyles';
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
                style={PatientTableStyles.btnNewPatient}
                onPress={() => navigation.navigate('CreatePasien')}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                <Text style={PatientTableStyles.btnNewPatientText}>Pasien Baru</Text>
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
            <View style={LayoutStyles.w100p}>
              <View style={ManagementStyles.tableHeaderMaron}>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex15, ManagementStyles.ph15]}>
                  <Text style={ManagementStyles.thText}>Nama</Text>
                </View>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex12, ManagementStyles.ph15]}>
                  <Text style={ManagementStyles.thText}>Tgl Lahir</Text>
                </View>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex08, ManagementStyles.ph15]}>
                  <Text style={ManagementStyles.thText}>Gen</Text>
                </View>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex15, ManagementStyles.ph15]}>
                  <Text style={ManagementStyles.thText}>Alamat</Text>
                </View>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex1, ManagementStyles.ph15]}>
                  <Text style={ManagementStyles.thText}>Pekerjaan</Text>
                </View>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex1, ManagementStyles.ph15]}>
                  <Text style={ManagementStyles.thText}>No. HP</Text>
                </View>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex1, ManagementStyles.ph15]}>
                  <Text style={ManagementStyles.thText}>Alergi</Text>
                </View>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex12, ManagementStyles.ph15]}>
                  <Text style={ManagementStyles.thText}>Aksi</Text>
                </View>
              </View>

              <View>
                {filteredData.length === 0 ? (
                  <View style={ManagementStyles.emptyPasienContainer}>
                    <Text style={[ManagementStyles.tdTextSmall, LayoutStyles.centerText]}>Data pasien tidak ditemukan</Text>
                  </View>
                ) : (
                  filteredData.map((item, index) => {
                    const isLast = index === filteredData.length - 1;
                    return (
                      <View key={item.id_pasien.toString()} style={[ManagementStyles.tableRow, { borderBottomWidth: isLast ? 0 : 1 }]}>
                        <View style={[ManagementStyles.flex15, ManagementStyles.ph15, LayoutStyles.justifyCenter]}>
                          <Text style={[ManagementStyles.tdText, ManagementStyles.tdTextLeft]} numberOfLines={1}>{item.nama_pasien}</Text>
                        </View>
                        <View style={[ManagementStyles.colCenter, ManagementStyles.flex12, ManagementStyles.ph15]}>
                          <Text style={ManagementStyles.tdTextSmall}>{item.tgl_lahir}</Text>
                        </View>
                        <View style={[ManagementStyles.colCenter, ManagementStyles.flex08, ManagementStyles.ph15]}>
                          <View style={[ManagementStyles.roleBadge, item.jk === 'Laki-laki' ? ManagementStyles.badgeLK : ManagementStyles.badgePR]}>
                            <Text style={[ManagementStyles.roleBadgeText, item.jk === 'Laki-laki' ? ManagementStyles.badgeLKText : ManagementStyles.badgePRText]}>
                              {item.jk === 'Laki-laki' ? 'LK' : 'PR'}
                            </Text>
                          </View>
                        </View>
                        <View style={[ManagementStyles.flex15, ManagementStyles.ph15, LayoutStyles.justifyCenter]}>
                          <Text style={[ManagementStyles.tdTextSmall, ManagementStyles.tdTextLeft]} numberOfLines={2}>{item.alamat}</Text>
                        </View>
                        <View style={[ManagementStyles.colCenter, ManagementStyles.flex12, ManagementStyles.ph15]}>
                          <Text style={ManagementStyles.tdTextSmall} numberOfLines={1}>{item.pekerjaan}</Text>
                        </View>
                        <View style={[ManagementStyles.colCenter, ManagementStyles.flex12, ManagementStyles.ph15]}>
                          <Text style={ManagementStyles.tdTextSmall}>{item.nope}</Text>
                        </View>
                        <View style={[ManagementStyles.colCenter, ManagementStyles.flex12, ManagementStyles.ph15]}>
                          <Text style={ManagementStyles.tdTextSmall}>{item.alergi_obat || '-'}</Text>
                        </View>
                        <View style={[ManagementStyles.actionCell, ManagementStyles.flex12, ManagementStyles.ph15]}>
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


