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

export function TampilRujukan() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();

  const calculateUmur = (tglLahir: string) => {
    if (!tglLahir) return '';
    try {
      const today = new Date();
      const birthDate = new Date(tglLahir);
      if (isNaN(birthDate.getTime())) return '';
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age.toString() + ' Tahun';
    } catch (e) {
      return '';
    }
  };

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
    }, [])
  );

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tb_rujukan')
        .select(`
          *,
          tb_pasien (nama_pasien, jk, tgl_lahir, alamat),
          tb_rekam_medis (layanan, gigi, diagnosa, tanggal)
        `)
        .order('tgl', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number, namaPasien: string) => {
    showAlert({
      title: 'Hapus Rujukan',
      message: `Yakin ingin menghapus surat rujukan untuk ${namaPasien}?`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('tb_rujukan')
            .delete()
            .eq('id_rujukan', id);
          if (error) throw error;
          setRecords(prev => prev.filter(r => r.id_rujukan !== id));
          showAlert({ title: 'Berhasil', message: 'Surat rujukan berhasil dihapus.', type: 'success' });
        } catch (e: any) {
          showAlert({ title: 'Gagal', message: e.message, type: 'error' });
        }
      }
    });
  };

  const filteredData = records.filter(item => {
    const matchesSearch =
      item.tb_pasien?.nama_pasien?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ditujukan?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'all') return true;

    const itemDate = item.tgl;
    if (!itemDate) return false;

    if (activeFilter === 'today') return itemDate === getLocalDate(0);
    if (activeFilter === 'yesterday') return itemDate === getLocalDate(1);
    if (activeFilter === '7days') return itemDate >= getLocalDate(7);
    if (activeFilter === '30days') return itemDate >= getLocalDate(30);
    return true;
  });

  const renderCard = (item: any) => {
    const previewItem = {
      ...item,
      detail_pasien: {
        nama_pasien: item.tb_pasien?.nama_pasien,
        jenis_kelamin: item.tb_pasien?.jk,
        umur: calculateUmur(item.tb_pasien?.tgl_lahir),
        alamat: item.tb_pasien?.alamat
      },
      detail_medis: {
        keluhan_rujukan: item.keluhan_rujukan || item.keluhan,
        diagnosa: item.tb_rekam_medis?.diagnosa
      },
      isOrto: item.tb_rekam_medis?.layanan === 'Ortodental'
    };

    return (
      <View key={item.id_rujukan?.toString()} style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.patientName}>{item.tb_pasien?.nama_pasien || 'Pasien'}</Text>
            <Text style={styles.rujukanDate}>{formatDate(item.tgl)}</Text>
          </View>
          <View style={styles.cardHeaderRight}>
            <View style={styles.layananBadge}>
              <Text style={styles.layananBadgeText}>
                {item.tb_rekam_medis?.layanan || 'Umum'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* Card Body */}
        <View style={styles.cardBody}>
          <View style={styles.cardBodyLeft}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>DITUJUKAN KEPADA</Text>
              <Text style={styles.infoValue}>{item.ditujukan || '-'}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>KELUHAN</Text>
              <Text style={styles.infoValue} numberOfLines={2}>{item.keluhan_rujukan || '-'}</Text>
            </View>
          </View>

          <View style={styles.cardBodyRight}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>PENANDATANGAN</Text>
              <Text style={styles.infoValue}>{item.user_klinik || '-'}</Text>
            </View>

            <View style={[LayoutStyles.flexRow, LayoutStyles.gap8, LayoutStyles.alignCenter]}>
              <TouchableOpacity
                style={styles.printButton}
                onPress={() => navigation.navigate('PreviewRujukan', { item: previewItem })}
              >
                <View style={styles.printButtonContent}>
                  <MaterialCommunityIcons name="printer-eye" size={28} color="white" />
                  <View style={styles.printButtonTextWrapper}>
                    <Text style={styles.printButtonSmallText}>Lihat / Cetak</Text>
                    <Text style={styles.printButtonBoldText}>Surat Rujukan</Text>
                  </View>
                  <MaterialCommunityIcons name="arrow-top-right" size={14} color="white" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id_rujukan, item.tb_pasien?.nama_pasien || 'pasien')}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={22} color="#C62828" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <AdminLayout noScroll={true} customRightTitle="Arsip Rujukan">
      <ScrollView
        style={[LayoutStyles.flex1, { backgroundColor: '#F8F9FA' }]}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Filter / Search Bar + Add Button */}
        <View style={styles.filterContainer}>
          <View style={styles.searchWrapper}>
            <Feather name="search" size={22} color="#A0A0A0" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari pasien atau tujuan..."
              placeholderTextColor="#A0A0A0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateRujukan')}
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={22} color="white" />
            <Text style={styles.addButtonText}>Tambah Rujukan</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Date Chips */}
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

        {/* List */}
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={LayoutStyles.mt50} />
        ) : filteredData.length === 0 ? (
          <View style={GlobalStyles.emptyContent}>
            <MaterialCommunityIcons name="file-document-outline" size={60} color="#CCC" />
            <Text style={GlobalStyles.emptyText}>
              {searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada histori rujukan.'}
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
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 20,
    gap: 15,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    height: 55,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#801919',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#801919',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderRight: {},
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A1C1C',
  },
  rujukanDate: {
    fontSize: 13,
    color: '#A45D5D',
    marginTop: 2,
  },
  layananBadge: {
    backgroundColor: '#F4E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#C97F7F',
  },
  layananBadgeText: {
    color: '#801919',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0E0E0',
  },
  cardBody: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    alignItems: 'flex-end',
  },
  cardBodyLeft: {
    flex: 2,
  },
  cardBodyRight: {
    flex: 1.5,
    alignItems: 'flex-end',
    gap: 12,
  },
  infoBlock: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8B4A4A',
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  printButton: {
    backgroundColor: '#2B58D1',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    elevation: 3,
    width: 185,
  },
  printButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  printButtonTextWrapper: {
    flex: 1,
    marginLeft: 10,
  },
  printButtonSmallText: {
    color: 'white',
    fontSize: 9,
    opacity: 0.9,
  },
  printButtonBoldText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C62828',
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
