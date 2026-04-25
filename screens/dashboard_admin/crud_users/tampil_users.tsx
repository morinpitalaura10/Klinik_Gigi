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
import { Colors, GlobalStyles, LayoutStyles, PatientTableStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

interface User {
  id_users: string | number;
  nama_users: string;
  us: string;
  role: string;
  email_users: string;
  tb_dokter?: {
    spesialisasi: string;
  }[];
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
        .select(`
          *,
          tb_dokter (
            spesialisasi
          )
        `)
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
    <AdminLayout noScroll={true} customRightTitle="Manajemen Pengguna">
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.black} style={LayoutStyles.mt50} />
      ) : (
        <ScrollView 
          style={LayoutStyles.flex1} 
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={true}
        >
          {/* Header Section */}
          <View style={PatientTableStyles.headerContainer}>
            <View style={PatientTableStyles.headerRow}>
              <View>
                <Text style={PatientTableStyles.headerTitle}>Manajemen User</Text>
                <Text style={PatientTableStyles.headerSubtitle}>Kelola akses pengguna sistem</Text>
              </View>
              <TouchableOpacity
                style={PatientTableStyles.btnNewPatient}
                onPress={() => navigation.navigate('CreateUser')}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                <Text style={PatientTableStyles.btnNewPatientText}>Tambah User</Text>
              </TouchableOpacity>
            </View>

            <View style={PatientTableStyles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={24} color="#888" />
              <TextInput
                style={PatientTableStyles.searchInput}
                placeholder="Cari nama atau username..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={PatientTableStyles.tableWrapper}>
            <View style={{ width: '100%' }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', backgroundColor: Colors.primary, paddingVertical: 14 }}>
                <View style={{ flex: 0.4, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>No</Text></View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>Nama</Text></View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>Username</Text></View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>Email</Text></View>
                <View style={{ flex: 0.7, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>Role</Text></View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>Spesialisasi</Text></View>
                <View style={{ flex: 0.8, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>Aksi</Text></View>
              </View>

              {/* Body */}
              <View style={PatientTableStyles.tableBody}>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((item, index) => (
                    <View key={item.id_users.toString()} style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#EBEBEB', paddingVertical: 14, alignItems: 'center', backgroundColor: '#FFF' }}>
                      <View style={{ flex: 0.4, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#222', textAlign: 'center' }}>{index + 1}</Text>
                      </View>
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#222', textAlign: 'center' }} numberOfLines={1}>{item.nama_users}</Text>
                      </View>
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 }}>
                        <Text style={{ fontSize: 12, color: '#555', textAlign: 'center' }} numberOfLines={1}>@{item.us}</Text>
                      </View>
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 }}>
                        <Text style={{ fontSize: 12, color: '#444', textAlign: 'center' }} numberOfLines={1}>{item.email_users || '-'}</Text>
                      </View>
                      <View style={{ flex: 0.7, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ backgroundColor: item.role === 'admin' ? '#E3F2FD' : '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
                          <Text style={{ fontSize: 10, fontWeight: '900', color: item.role === 'admin' ? '#1976D2' : '#2E7D32' }}>
                            {item.role === 'admin' ? 'ADMIN' : 'DOKTER'}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#222', textAlign: 'center' }} numberOfLines={1}>
                          {item.role === 'dokter' ? (item.tb_dokter && item.tb_dokter[0]?.spesialisasi) || 'Umum' : '-'}
                        </Text>
                      </View>
                      <View style={{ flex: 0.8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('UpdateUser', { editUser: item })}>
                          <MaterialCommunityIcons name="square-edit-outline" size={20} color="#EBC112" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('ReadUser', { id: item.id_users })}>
                          <MaterialCommunityIcons name="information-outline" size={20} color="#4CAF50" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('DeleteUser', { id: item.id_users, name: item.nama_users })}>
                          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#D32F2F" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={{ width: '100%', height: 100, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={[GlobalStyles.emptyText, { textAlign: 'center' }]}>Data pengguna tidak ditemukan</Text>
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
