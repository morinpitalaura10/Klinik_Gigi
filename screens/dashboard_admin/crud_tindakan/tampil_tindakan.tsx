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
import { Colors, GlobalStyles, LayoutStyles } from '../../../styles/GlobalStyles';
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
          <View style={[LayoutStyles.pt10, LayoutStyles.ph20, { paddingBottom: 10 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 4 }}>Manajemen Perawatan</Text>
                <Text style={{ fontSize: 13, color: '#555' }}>Kelola daftar tindakan & perawatan klinik</Text>
              </View>
              <TouchableOpacity
                style={{ backgroundColor: '#2D5DD1', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 }}
                onPress={() => navigation.navigate('CreateTindakan')}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>+Tindakan Baru</Text>
              </TouchableOpacity>
            </View>

            <View style={{
                flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
                borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, height: 45,
                shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1
            }}>
              <Feather name="search" size={20} color="#94A3B8" />
              <TextInput
                style={{ flex: 1, marginLeft: 10, fontSize: 14, color: '#333' }}
                placeholder="Cari nama tindakan..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={[LayoutStyles.mh20, { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 }]}>
            <View style={{ width: '100%' }}>
              <View style={{ flexDirection: 'row', backgroundColor: '#801919', paddingVertical: 14 }}>
                <View style={[{ flex: 0.5, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>No</Text>
                </View>
                <View style={[{ flex: 1.2, paddingHorizontal: 15 }]}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>Dokter</Text>
                </View>
                <View style={[{ flex: 2, paddingHorizontal: 15 }]}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>Nama Tindakan</Text>
                </View>
                <View style={[{ flex: 0.8, paddingHorizontal: 15, alignItems: 'center' }]}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>Aksi</Text>
                </View>
              </View>

              <View>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => {
                      const isLast = index === filteredData.length - 1;
                      return (
                        <View key={item.id_tindakan.toString()} style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingVertical: 14, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: '#E2E8F0' }]}>
                          <View style={[{ flex: 0.5, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ fontSize: 14, color: '#000', fontWeight: '500' }}>{index + 1}</Text>
                          </View>
                          <View style={[{ flex: 1.2, paddingHorizontal: 15 }]}>
                            <View style={{ alignSelf: 'flex-start', backgroundColor: '#EADCDA', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, borderWidth: 1, borderColor: '#C8A2A0' }}>
                                <Text style={{ color: '#801919', fontSize: 12, fontWeight: 'bold' }}>{item.layanan || '-'}</Text>
                            </View>
                          </View>
                          <View style={[{ flex: 2, paddingHorizontal: 15 }]}>
                            <Text style={{ fontSize: 13, color: '#000', fontWeight: 'bold' }}>{item.nama_tindakan}</Text>
                          </View>
                          <View style={[{ flex: 0.8, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'center', gap: 15 }]}>
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
                    <View style={{ padding: 30, alignItems: 'center' }}>
                      <Text style={{ color: '#888', fontSize: 14 }}>Data tidak ditemukan</Text>
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
