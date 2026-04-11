import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { supabase } from '../../../utils/supabase';
import { Colors, GlobalStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

interface Tindakan {
  id_tindakan: number;
  nama_tindakan: string;
  created_at: string;
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
        .select('*')
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
      activeTab="beranda"
      noScroll={true}
      customRightTitle="Manajemen Tindakan"
    >
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.black} style={{ marginTop: 50 }} />
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          {/* Header & Search Tetap di Luar Tabel */}
          <View style={{ paddingTop: 10 }}>
            <View style={GlobalStyles.searchRow}>
              <View style={GlobalStyles.searchWrapper}>
                <View style={GlobalStyles.listSearchContainer}>
                  <Feather name="search" size={20} color="#888" style={{ marginRight: 10 }} />
                  <TextInput
                    style={GlobalStyles.listSearchInput}
                    placeholder="Cari nama tindakan..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>

              <View style={GlobalStyles.listAddButtonContainer}>
                <TouchableOpacity
                  style={[GlobalStyles.listAddButton, { height: 50 }]}
                  onPress={() => navigation.navigate('CreateTindakan')}
                >
                  <MaterialCommunityIcons name="plus" size={24} color="white" />
                  <Text style={GlobalStyles.listAddButtonText}>Tindakan</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[GlobalStyles.listHeader, { marginTop: 0, marginBottom: 15 }]}>
              <Text style={GlobalStyles.listTitle}>Daftar Tindakan</Text>
            </View>
          </View>

          {/* Wrapper Tabel (Sesuai Gambar) */}
          <View style={GlobalStyles.tableContainer}>
            {/* Header Tabel */}
            <View style={GlobalStyles.tableHeader}>
              <View style={[GlobalStyles.tableHeaderCell, GlobalStyles.tableCellNo]}>
                <Text style={GlobalStyles.tableHeaderText}>No</Text>
              </View>
              <View style={[GlobalStyles.tableHeaderCell, GlobalStyles.tableCellName]}>
                <Text style={GlobalStyles.tableHeaderText}>Nama Tindakan</Text>
              </View>
              <View style={[GlobalStyles.tableHeaderCell, GlobalStyles.tableCellAction]}>
                <Text style={GlobalStyles.tableHeaderText}>Aksi</Text>
              </View>
            </View>

            {/* List Data */}
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.id_tindakan.toString()}
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchTindakan();
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
                      <Text style={GlobalStyles.tableRowText}>{item.nama_tindakan}</Text>
                    </View>
                    <View style={[GlobalStyles.tableCell, GlobalStyles.tableCellAction]}>
                      <TouchableOpacity
                        style={GlobalStyles.cardActionBtn}
                        onPress={() => navigation.navigate('UpdateTindakan', { editItem: item })}
                      >
                        <MaterialCommunityIcons name="square-edit-outline" size={24} color="#EBC112" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={GlobalStyles.cardActionBtn}
                        onPress={() => navigation.navigate('DeleteTindakan', { id: item.id_tindakan, name: item.nama_tindakan })}
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={24} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={[GlobalStyles.emptyContent, { padding: 30 }]}>
                  <Text style={GlobalStyles.emptyText}>Data tidak ditemukan</Text>
                </View>
              }
            />
          </View>
        </View>
      )}
    </AdminLayout>
  );
}
