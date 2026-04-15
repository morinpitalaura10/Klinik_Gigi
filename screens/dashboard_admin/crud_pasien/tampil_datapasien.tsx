import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { supabase } from '../../../utils/supabase';
import { Colors, GlobalStyles, LayoutStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

interface Pasien {
  id_pasien: number;
  nama_pasien: string;
  tgl_lahir: string;
  jk: string;
  alamat: string;
  pekerjaan: string;
  nope: string;
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
        .order('id_pasien', { ascending: false });

      if (error) throw error;
      setPasien(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
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
    item.nama_pasien.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nope.includes(searchQuery)
  );

  return (
    <AdminLayout
      noScroll={true}
      customRightTitle="Manajemen Pasien"
    >
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.black} style={LayoutStyles.mt50} />
      ) : (
        <View style={LayoutStyles.flex1}>
          <View style={LayoutStyles.pt10}>
            <View style={[GlobalStyles.searchRow, LayoutStyles.ph20]}>
              <View style={GlobalStyles.searchWrapper}>
                <View style={GlobalStyles.listSearchContainer}>
                  <Feather name="search" size={20} color="#888" style={GlobalStyles.inputIcon} />
                  <TextInput
                    style={GlobalStyles.listSearchInput}
                    placeholder="Cari nama atau nomor HP..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>

              <View style={GlobalStyles.listAddButtonContainer}>
                <TouchableOpacity
                  style={GlobalStyles.listAddButton}
                  onPress={() => navigation.navigate('CreatePasien')}
                >
                  <MaterialCommunityIcons name="plus" size={24} color="white" />
                  <Text style={GlobalStyles.listAddButtonText}>Pasien</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[GlobalStyles.listHeader, LayoutStyles.ph20, LayoutStyles.mt0, LayoutStyles.mb15]}>
              <Text style={GlobalStyles.listTitle}>Daftar Pasien</Text>
            </View>
          </View>

          <View style={[GlobalStyles.tableContainer, LayoutStyles.mh20]}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <View style={[GlobalStyles.tableContentWrapper, LayoutStyles.tableFixed1000]}>
                <View style={GlobalStyles.tableHeader}>
                  <View style={[GlobalStyles.tableHeaderCell, GlobalStyles.tableCellNo]}>
                    <Text style={GlobalStyles.tableHeaderText}>No</Text>
                  </View>
                  <View style={[GlobalStyles.tableHeaderCell, GlobalStyles.tableCellName]}>
                    <Text style={GlobalStyles.tableHeaderText}>Nama Pasien</Text>
                  </View>
                  <View style={[GlobalStyles.tableHeaderCell, GlobalStyles.tableCellTglLahir]}>
                    <Text style={GlobalStyles.tableHeaderText}>Tgl Lahir</Text>
                  </View>
                  <View style={[GlobalStyles.tableHeaderCell, GlobalStyles.tableCellJK]}>
                    <Text style={GlobalStyles.tableHeaderText}>JK</Text>
                  </View>
                  <View style={[GlobalStyles.tableHeaderCell, GlobalStyles.tableCellNope]}>
                    <Text style={GlobalStyles.tableHeaderText}>Nomor HP</Text>
                  </View>
                  <View style={[GlobalStyles.tableHeaderCell, GlobalStyles.tableCellAlamat]}>
                    <Text style={GlobalStyles.tableHeaderText}>Alamat</Text>
                  </View>
                  <View style={[GlobalStyles.tableHeaderCell, GlobalStyles.tableCellAlergi]}>
                    <Text style={GlobalStyles.tableHeaderText}>Alergi</Text>
                  </View>
                  <View style={[GlobalStyles.tableHeaderCell, GlobalStyles.tableCellAction]}>
                    <Text style={GlobalStyles.tableHeaderText}>Aksi</Text>
                  </View>
                </View>

                <FlatList
                  data={filteredData}
                  keyExtractor={(item) => item.id_pasien.toString()}
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    fetchPasien();
                  }}
                  renderItem={({ item, index }) => {
                    const isLast = index === filteredData.length - 1;
                    return (
                      <View style={[
                        GlobalStyles.tableRow,
                        isLast && GlobalStyles.tableRowLast
                      ]}>
                        <View style={[GlobalStyles.tableCell, GlobalStyles.tableCellNo]}>
                          <Text style={GlobalStyles.tableRowText}>{index + 1}</Text>
                        </View>
                        <View style={[GlobalStyles.tableCell, GlobalStyles.tableCellName]}>
                          <Text style={GlobalStyles.tableRowText}>{item.nama_pasien}</Text>
                        </View>
                        <View style={[GlobalStyles.tableCell, GlobalStyles.tableCellTglLahir]}>
                          <Text style={GlobalStyles.tableRowText}>{item.tgl_lahir}</Text>
                        </View>
                        <View style={[GlobalStyles.tableCell, GlobalStyles.tableCellJK]}>
                          <Text style={GlobalStyles.tableRowText}>{item.jk}</Text>
                        </View>
                        <View style={[GlobalStyles.tableCell, GlobalStyles.tableCellNope]}>
                          <Text style={GlobalStyles.tableRowText}>{item.nope}</Text>
                        </View>
                        <View style={[GlobalStyles.tableCell, GlobalStyles.tableCellAlamat]}>
                          <Text style={GlobalStyles.tableRowText}>{item.alamat}</Text>
                        </View>
                        <View style={[GlobalStyles.tableCell, GlobalStyles.tableCellAlergi]}>
                          <Text style={GlobalStyles.tableRowText}>{item.alergi_obat || '-'}</Text>
                        </View>
                        <View style={[GlobalStyles.tableCell, GlobalStyles.tableCellAction]}>
                          <TouchableOpacity
                            style={GlobalStyles.cardActionBtn}
                            onPress={() => navigation.navigate('ReadPasien', { id: item.id_pasien })}
                          >
                            <MaterialCommunityIcons name="eye-outline" size={24} color="#4A90E2" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={GlobalStyles.cardActionBtn}
                            onPress={() => navigation.navigate('UpdatePasien', { editItem: item })}
                          >
                            <MaterialCommunityIcons name="square-edit-outline" size={24} color="#EBC112" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={GlobalStyles.cardActionBtn}
                            onPress={() => navigation.navigate('DeletePasien', { id: item.id_pasien, name: item.nama_pasien })}
                          >
                            <MaterialCommunityIcons name="trash-can-outline" size={24} color={Colors.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={GlobalStyles.emptyContent}>
                      <Text style={GlobalStyles.emptyText}>Data pasien tidak ditemukan</Text>
                    </View>
                  }
                />
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </AdminLayout>
  );
}
