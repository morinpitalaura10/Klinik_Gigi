import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { supabase } from '../../../utils/supabase';
import { Colors, GlobalStyles, LayoutStyles, ManagementStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

interface Tindakan {
  id_tindakan: number;
  nama_tindakan: string;
  created_at: string;
  layanan: string;
}

export function TampilTindakan() {
  const navigation = useNavigation<any>();
  const [tindakan, setTindakan] = useState<Tindakan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTindakan = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tb_tindakan')
        .select(`*`)
        .order('id_tindakan', { ascending: false });

      if (error) throw error;
      setTindakan(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTindakan();
    }, [])
  );

  const filteredData = tindakan.filter(item =>
    item.nama_tindakan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout
      noScroll={true}
      customRightTitle="Manajemen Perawatan"
    >
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.black} style={LayoutStyles.mt50} />
      ) : (
        <ScrollView 
          style={LayoutStyles.flex1}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={true}
        >
          <View style={ManagementStyles.container}>
            <View style={ManagementStyles.headerRow}>
              <View>
                <Text style={ManagementStyles.title}>Manajemen Perawatan</Text>
                <Text style={ManagementStyles.subtitle}>Kelola daftar tindakan & perawatan klinik</Text>
              </View>
              <TouchableOpacity
                style={ManagementStyles.btnBlue}
                onPress={() => navigation.navigate('CreateTindakan')}
              >
                <Text style={ManagementStyles.btnBlueText}>+Tindakan Baru</Text>
              </TouchableOpacity>
            </View>

            <View style={ManagementStyles.searchBar}>
              <Feather name="search" size={20} color="#94A3B8" />
              <TextInput
                style={ManagementStyles.searchInput}
                placeholder="Cari nama tindakan..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={ManagementStyles.tableContainer}>
            <View style={LayoutStyles.w100p}>
              <View style={ManagementStyles.tableHeaderMaron}>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex05, ManagementStyles.ph15]}>
                  <Text style={ManagementStyles.thText14}>No</Text>
                </View>
                <View style={[ManagementStyles.flex12, ManagementStyles.ph15, LayoutStyles.justifyCenter]}>
                  <Text style={ManagementStyles.thTextLeft14}>Dokter</Text>
                </View>
                <View style={[ManagementStyles.flex2, ManagementStyles.ph15, LayoutStyles.justifyCenter]}>
                  <Text style={ManagementStyles.thTextLeft14}>Nama Tindakan</Text>
                </View>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex08, ManagementStyles.ph15]}>
                  <Text style={ManagementStyles.thText14}>Aksi</Text>
                </View>
              </View>

              <View>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => {
                      const isLast = index === filteredData.length - 1;
                      return (
                        <View key={item.id_tindakan.toString()} style={[ManagementStyles.tableRow, { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: '#E2E8F0' }]}>
                          <View style={[ManagementStyles.colCenter, ManagementStyles.flex05, ManagementStyles.ph15]}>
                            <Text style={ManagementStyles.tdNo}>{index + 1}</Text>
                          </View>
                          <View style={[ManagementStyles.flex12, ManagementStyles.ph15]}>
                            <View style={ManagementStyles.badgeLayanan}>
                                <Text style={ManagementStyles.badgeLayananText}>{item.layanan || '-'}</Text>
                            </View>
                          </View>
                          <View style={[ManagementStyles.flex2, ManagementStyles.ph15]}>
                            <Text style={ManagementStyles.tdNamaTindakan}>{item.nama_tindakan}</Text>
                          </View>
                          <View style={[ManagementStyles.actionCell, ManagementStyles.flex08, ManagementStyles.ph15, LayoutStyles.gap15]}>
                            <TouchableOpacity
                              onPress={() => navigation.navigate('UpdateTindakan', { editItem: item })}
                            >
                              <MaterialCommunityIcons name="square-edit-outline" size={24} color="#EBC112" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => navigation.navigate('DeleteTindakan', { id: item.id_tindakan, name: item.nama_tindakan })}
                            >
                              <MaterialCommunityIcons name="trash-can-outline" size={24} color="#801919" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <View style={ManagementStyles.emptyStateContainer}>
                      <Text style={ManagementStyles.emptyStateText}>Data tidak ditemukan</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
        </ScrollView>
      )}
    </AdminLayout>
  );
}
