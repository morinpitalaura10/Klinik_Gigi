import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../utils/supabase';
import { Colors, LayoutStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import CardBody from '../../../components/atoms/CardBody';
import { useFocusEffect } from '@react-navigation/native';

interface User {
  id_users: string | number;
  nama_users: string;
  us: string;
  role: string;
  email_users: string;
}

export default function TampilUsers({ navigation }: any) {
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

  const handleDelete = (id: string | number, name: string) => {
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus user "${name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive', 
          onPress: async () => {
            try {
              // 1. Jika dokter, hapus dulu dari tb_dokter (atau gunakan policy cascade jika ada)
              // Untuk amannya kita hapus manual jika role dokter
              const userToRemove = users.find(u => u.id_users === id);
              if (userToRemove?.role.toLowerCase() === 'dokter') {
                await supabase.from('tb_dokter').delete().eq('user_id', id);
              }

              // 2. Hapus dari tb_users
              const { error } = await supabase
                .from('tb_users')
                .delete()
                .eq('id_users', id);

              if (error) throw error;
              fetchUsers();
            } catch (error: any) {
              Alert.alert('Gagal Hapus', error.message);
            }
          }
        }
      ]
    );
  };

  const filteredUsers = users.filter(user => 
    user.nama_users.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.us.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: User }) => (
    <CardBody style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.nama_users.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.textDetails}>
          <Text style={styles.userName}>{item.nama_users}</Text>
          <Text style={styles.userRole}>{item.role.charAt(0).toUpperCase() + item.role.slice(1)}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        {/* Tombol EDIT (Kuning) */}
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => navigation.navigate('CreateUser', { editUser: item })}
        >
          <MaterialCommunityIcons name="square-edit-outline" size={28} color="#EBC112" />
        </TouchableOpacity>

        {/* Tombol INFO (Hijau) */}
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => Alert.alert('Detail User', `Nama: ${item.nama_users}\nUsername: ${item.us}\nEmail: ${item.email_users}\nRole: ${item.role}`)}
        >
          <Ionicons name="information-circle-outline" size={30} color="#28A741" />
        </TouchableOpacity>
        
        {/* Tombol DELETE (Merah) */}
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => handleDelete(item.id_users, item.nama_users)}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={28} color="#A92020" />
        </TouchableOpacity>
      </View>
    </CardBody>
  );

  return (
    <AdminLayout activeTab="beranda" noScroll={true}>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id_users.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchUsers();
          }}
          ListHeaderComponent={
            <View style={{ paddingTop: 20 }}>
              <View style={styles.header}>
                <Text style={styles.title}>Daftar Pengguna</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => navigation.navigate('CreateUser')}
                >
                  <MaterialCommunityIcons name="plus" size={24} color="white" />
                  <Text style={styles.addButtonText}>Tambah</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari nama atau username..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContent}>
              <Text style={styles.emptyText}>Tidak ada pengguna ditemukan.</Text>
            </View>
          }
        />
      )}
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#3B5998', // Warna biru sesuai desain simpan
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: Colors.primary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F2E3E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  textDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userRole: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptyContent: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});
