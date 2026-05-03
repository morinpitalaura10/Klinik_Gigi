import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { supabase } from '../../../utils/supabase';
import { GlobalStyles, LayoutStyles, Colors } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAlert } from '../../../context/AlertContext';

export function TampilKwitansi() {
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getLocalDate = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  type FilterKey = 'today' | 'yesterday' | '7days' | '30days' | 'all';
  const [activeFilter, setActiveFilter] = useState<FilterKey>('today');

  const filterOptions: { key: FilterKey; label: string }[] = [
    { key: 'today', label: 'Hari Ini' },
    { key: 'yesterday', label: 'Kemarin' },
    { key: '7days', label: '7 Hari' },
    { key: '30days', label: '30 Hari' },
    { key: 'all', label: 'Semua' },
  ];

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [activeFilter])
  );

  const fetchRecords = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('tb_kwitansi')
        .select(`
          *,
          tb_rekam_medis!record_id (
            diagnosa, 
            layanan, 
            id_tindakan,
            tb_pasien!id_pasien (nama_pasien, tgl_lahir, jk, alamat)
          )
        `)
        .order('id_kwitansi', { ascending: false });

      if (activeFilter !== 'all') {
        const dateLimit = activeFilter === 'today' ? getLocalDate(0) :
                         activeFilter === 'yesterday' ? getLocalDate(1) :
                         activeFilter === '7days' ? getLocalDate(7) :
                         getLocalDate(30);
        
        if (activeFilter === 'today' || activeFilter === 'yesterday') {
            query = query.eq('tgl', dateLimit);
        } else {
            query = query.gte('tgl', dateLimit);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number, noKwitansi: string) => {
    showAlert({
      title: 'Hapus Kwitansi',
      message: `Yakin ingin menghapus kwitansi ${noKwitansi}?`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('tb_kwitansi')
            .delete()
            .eq('id_kwitansi', id);
          if (error) throw error;
          setRecords(prev => prev.filter(r => r.id_kwitansi !== id));
          showAlert({ title: 'Berhasil', message: 'Kwitansi berhasil dihapus.', type: 'success' });
        } catch (e: any) {
          showAlert({ title: 'Gagal', message: e.message, type: 'error' });
        }
      }
    });
  };

  const filteredData = records.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const patientName = item.tb_rekam_medis?.tb_pasien?.nama_pasien || '';
    const matchesName = patientName.toLowerCase().includes(searchLower);
    const matchesNo = item.no_kwitansi?.toLowerCase().includes(searchLower);
    return matchesName || matchesNo;
  });

  const renderCard = (item: any) => {
    return (
      <View key={item.id_kwitansi?.toString()} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.patientName}>{item.tb_rekam_medis?.tb_pasien?.nama_pasien || 'Pasien'}</Text>
            <Text style={styles.receiptDate}>{formatDate(item.tgl)}</Text>
          </View>
          <View style={styles.cardHeaderRight}>
            <View style={[styles.layananBadge, { backgroundColor: item.tb_rekam_medis?.layanan === 'Ortodental' ? '#E3F2FD' : '#FDECEC' }]}>
              <Text style={[styles.layananBadgeText, { color: item.tb_rekam_medis?.layanan === 'Ortodental' ? '#1E88E5' : '#8B4A4A' }]}>
                {item.tb_rekam_medis?.layanan || 'Umum'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBody}>
          <View style={styles.cardBodyLeft}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>NOMOR KWITANSI</Text>
              <Text style={[styles.infoValue, { fontWeight: 'bold' }]}>{item.no_kwitansi || '-'}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>NOMINAL</Text>
              <Text style={[styles.infoValue, { color: '#2E7D32', fontWeight: 'bold' }]}>
                Rp {item.rp?.toLocaleString('id-ID')}
              </Text>
            </View>
          </View>

          <View style={styles.cardBodyRight}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>PEMBAYARAN UNTUK</Text>
              <Text style={styles.infoValue} numberOfLines={2}>{item.tujuan_pembayaran || '-'}</Text>
            </View>

            <View style={[LayoutStyles.flexRow, LayoutStyles.gap8, LayoutStyles.alignCenter]}>
              <TouchableOpacity
                style={styles.printButton}
                onPress={() => navigation.navigate('PreviewKwitansi', { 
                  item: { ...item, tb_pasien: item.tb_rekam_medis?.tb_pasien } 
                })}
              >
                <View style={styles.printButtonContent}>
                  <MaterialCommunityIcons name="printer-eye" size={24} color="white" />
                  <View style={styles.printButtonTextWrapper}>
                    <Text style={styles.printButtonSmallText}>Lihat / Cetak</Text>
                    <Text style={styles.printButtonBoldText}>Kwitansi</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id_kwitansi, item.no_kwitansi)}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#C62828" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <AdminLayout noScroll={true} customRightTitle="Arsip Kwitansi">
      <ScrollView
        style={[LayoutStyles.flex1, { backgroundColor: '#F8F9FA' }]}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.filterContainer}>
          <View style={styles.searchWrapper}>
            <Feather name="search" size={22} color="#A0A0A0" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari pasien atau no kwitansi..."
              placeholderTextColor="#A0A0A0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('ListPendingKwitansi')}
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={22} color="white" />
            <Text style={styles.addButtonText}>Tambah Kwitansi</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chipsRow}>
          {filterOptions.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.chip, activeFilter === opt.key && styles.chipActive]}
              onPress={() => setActiveFilter(opt.key)}
            >
              <Text style={[styles.chipText, activeFilter === opt.key && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={LayoutStyles.mt50} />
        ) : filteredData.length === 0 ? (
          <View style={GlobalStyles.emptyContent}>
            <MaterialCommunityIcons name="receipt" size={60} color="#CCC" />
            <Text style={GlobalStyles.emptyText}>
              {searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada arsip kwitansi.'}
            </Text>
          </View>
        ) : (
          <View style={styles.listContent}>
            {filteredData.map((item) => renderCard(item))}
          </View>
        )}
      </ScrollView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    padding: 25,
    paddingBottom: 15,
    gap: 12,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E88E5',
    borderRadius: 15,
    height: 55,
    paddingHorizontal: 18,
    gap: 8,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    paddingBottom: 15,
    gap: 10,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#801919',
    backgroundColor: 'white',
  },
  chipActive: {
    backgroundColor: '#801919',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#801919',
  },
  chipTextActive: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 25,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#801919',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FBFBFB',
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  receiptDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  layananBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  layananBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  cardBody: {
    flexDirection: 'row',
    padding: 15,
    gap: 15,
  },
  cardBodyLeft: {
    flex: 1.2,
  },
  cardBodyRight: {
    flex: 1.5,
    alignItems: 'flex-end',
    gap: 12,
  },
  infoBlock: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    color: '#444',
  },
  printButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
    minWidth: 130,
  },
  printButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  printButtonTextWrapper: {
    flex: 1,
  },
  printButtonSmallText: {
    color: 'white',
    fontSize: 8,
    opacity: 0.9,
  },
  printButtonBoldText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C62828',
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
