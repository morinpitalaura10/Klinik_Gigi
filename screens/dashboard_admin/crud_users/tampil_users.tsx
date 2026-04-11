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

interface User {
  id_users: string | number;
  nama_users: string;
  us: string;
  role: string;
  email_users: string;
}

export function TampilUsers() {
  const navigation = useNavigation<any>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tb_users')
        .select('*')
        .order('id_users', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const filteredUsers = users.filter(user => 
    user.nama_users.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.us.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout activeTab="beranda" noScroll={true}>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.black} style={{ marginTop: 50 }} />
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          {/* Header & Search */}
          <View style={{ paddingTop: 10 }}>
            <View style={GlobalStyles.searchRow}>
              <View style={GlobalStyles.searchWrapper}>
                <View style={GlobalStyles.listSearchContainer}>
                  <Feather name="search" size={20} color="#888" style={{ marginRight: 10 }} />
                  <TextInput
                    style={GlobalStyles.listSearchInput}
                    placeholder="Cari nama atau username..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>

              <View style={GlobalStyles.listAddButtonContainer}>
                <TouchableOpacity 
                   style={[GlobalStyles.listAddButton, { height: 50 }]}
                  onPress={() => navigation.navigate('CreateUser')}
                >
                  <MaterialCommunityIcons name="plus" size={24} color="white" />
                  <Text style={GlobalStyles.listAddButtonText}>Tambah</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[GlobalStyles.listHeader, { marginTop: 0, marginBottom: 15 }]}>
              <Text style={GlobalStyles.listTitle}>Daftar Pengguna</Text>
            </View>
          </View>

          {/* Wrapper Tabel */}
          <View style={GlobalStyles.tableContainer}>
            {/* Header Tabel */}
            <View style={GlobalStyles.tableHeader}>
              <View style={[GlobalStyles.tableHeaderCell, GlobalStyles.tableCellNo]}>
                <Text style={GlobalStyles.tableHeaderText}>No</Text>
              </View>
              <View style={[GlobalStyles.tableHeaderCell, GlobalStyles.tableCellName]}>
                <Text style={GlobalStyles.tableHeaderText}>Nama Pengguna</Text>
              </View>
              <View style={[GlobalStyles.tableHeaderCell, GlobalStyles.tableCellAction]}>
                <Text style={GlobalStyles.tableHeaderText}>Aksi</Text>
              </View>
            </View>

            {/* List Data */}
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id_users.toString()}
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchUsers();
              }}
              renderItem={({ item, index }) => {
                const isLast = index === filteredUsers.length - 1;
                return (
                  <View style={[
                    GlobalStyles.tableRow,
                    isLast && GlobalStyles.tableRowLast
                  ]}>
                    <View style={[GlobalStyles.tableCell, GlobalStyles.tableCellNo]}>
                      <Text style={GlobalStyles.tableRowText}>{index + 1}</Text>
                    </View>
                    <View style={[GlobalStyles.tableCell, GlobalStyles.tableCellName]}>
                      <View>
                        <Text style={GlobalStyles.tableRowText}>{item.nama_users}</Text>
                        <Text style={[GlobalStyles.userRole, { marginTop: 0 }]}>@{item.us}</Text>
                      </View>
                    </View>
                    <View style={[GlobalStyles.tableCell, GlobalStyles.tableCellAction]}>
                      <TouchableOpacity 
                        style={GlobalStyles.cardActionBtn}
                        onPress={() => navigation.navigate('UpdateUser', { editUser: item })}
                      >
                        <MaterialCommunityIcons name="square-edit-outline" size={24} color="#EBC112" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={GlobalStyles.cardActionBtn}
                        onPress={() => navigation.navigate('DeleteUser', { id: item.id_users, name: item.nama_users })}
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
