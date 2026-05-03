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
import { Colors, GlobalStyles, LayoutStyles, PatientTableStyles, ManagementStyles } from '../../../styles/GlobalStyles';
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

          <View style={ManagementStyles.tableContainer}>
            <View style={LayoutStyles.w100p}>
              <View style={ManagementStyles.tableHeaderPrimary}>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex04]}><Text style={ManagementStyles.thText}>No</Text></View>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex1]}><Text style={ManagementStyles.thText}>Nama</Text></View>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex1]}><Text style={ManagementStyles.thText}>Username</Text></View>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex1]}><Text style={ManagementStyles.thText}>Email</Text></View>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex07]}><Text style={ManagementStyles.thText}>Role</Text></View>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex1]}><Text style={ManagementStyles.thText}>Spesialisasi</Text></View>
                <View style={[ManagementStyles.colCenter, ManagementStyles.flex08]}><Text style={ManagementStyles.thText}>Aksi</Text></View>
              </View>

              <View style={PatientTableStyles.tableBody}>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((item, index) => (
                    <View key={item.id_users.toString()} style={ManagementStyles.tableRow}>
                      <View style={[ManagementStyles.colCenter, ManagementStyles.flex04]}>
                        <Text style={ManagementStyles.tdText}>{index + 1}</Text>
                      </View>
                      <View style={[ManagementStyles.colCenter, ManagementStyles.paddingH6, ManagementStyles.flex1]}>
                        <Text style={ManagementStyles.tdText} numberOfLines={1}>{item.nama_users}</Text>
                      </View>
                      <View style={[ManagementStyles.colCenter, ManagementStyles.paddingH6, ManagementStyles.flex1]}>
                        <Text style={ManagementStyles.tdTextSmall} numberOfLines={1}>@{item.us}</Text>
                      </View>
                      <View style={[ManagementStyles.colCenter, ManagementStyles.paddingH6, ManagementStyles.flex1]}>
                        <Text style={[ManagementStyles.tdTextSmall, ManagementStyles.tdEmail]} numberOfLines={1}>{item.email_users || '-'}</Text>
                      </View>
                      <View style={[ManagementStyles.colCenter, ManagementStyles.flex07]}>
                        <View style={[ManagementStyles.roleBadge, item.role === 'admin' ? ManagementStyles.badgeAdmin : ManagementStyles.badgeDokter]}>
                          <Text style={[ManagementStyles.roleBadgeText, item.role === 'admin' ? ManagementStyles.badgeAdminText : ManagementStyles.badgeDokterText]}>
                            {item.role === 'admin' ? 'ADMIN' : 'DOKTER'}
                          </Text>
                        </View>
                      </View>
                      <View style={[ManagementStyles.colCenter, ManagementStyles.paddingH6, ManagementStyles.flex1]}>
                        <Text style={ManagementStyles.tdText} numberOfLines={1}>
                          {item.role === 'dokter' 
                            ? (((item.tb_dokter && item.tb_dokter[0]?.spesialisasi) || 'umum').charAt(0).toUpperCase() + ((item.tb_dokter && item.tb_dokter[0]?.spesialisasi) || 'umum').slice(1)) 
                            : '-'}
                        </Text>
                      </View>
                      <View style={[ManagementStyles.actionCell, ManagementStyles.flex08]}>
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
                  <View style={ManagementStyles.emptyUsersContainer}>
                    <Text style={[GlobalStyles.emptyText, LayoutStyles.centerText]}>Data pengguna tidak ditemukan</Text>
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
