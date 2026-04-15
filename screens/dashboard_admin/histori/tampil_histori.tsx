import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Alert,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { supabase } from '../../../utils/supabase';
import { Colors, LayoutStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const BULAN_OPTIONS = [
    { label: 'Semua Bulan', value: '' },
    { label: 'Januari', value: '01' },
    { label: 'Februari', value: '02' },
    { label: 'Maret', value: '03' },
    { label: 'April', value: '04' },
    { label: 'Mei', value: '05' },
    { label: 'Juni', value: '06' },
    { label: 'Juli', value: '07' },
    { label: 'Agustus', value: '08' },
    { label: 'September', value: '09' },
    { label: 'Oktober', value: '10' },
    { label: 'November', value: '11' },
    { label: 'Desember', value: '12' },
];

const LAYANAN_OPTIONS = [
    { label: 'Semua Pelayanan', value: '' },
    { label: 'Ortodental', value: 'Ortodental' },
    { label: 'Umum', value: 'Umum' },
];

export function TampilHistori() {
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [tindakanList, setTindakanList] = useState<any[]>([]);
    const [diagnosaList, setDiagnosaList] = useState<string[]>([]);
    const [doctorMap, setDoctorMap] = useState<Record<number, string> >({});

    // Filter states
    const [filterBulan, setFilterBulan] = useState('');
    const [filterLayanan, setFilterLayanan] = useState('');
    const [filterTindakan, setFilterTindakan] = useState('');
    const [filterDiagnosa, setFilterDiagnosa] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchAll();
            fetchDoctors();
        }, [])
    );

    const fetchDoctors = async () => {
        try {
            const { data } = await supabase
                .from('tb_users')
                .select('id_users, nama_users')
                .eq('role', 'dokter');
            if (data) {
                const map: Record<number, string> = {};
                data.forEach((d: any) => { map[d.id_users] = d.nama_users; });
                setDoctorMap(map);
            }
        } catch (_) {}
    };

    const fetchAll = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('tb_rekam_medis')
                .select(`
                    id_record,
                    tanggal,
                    keluhan,
                    diagnosa,
                    keterangan,
                    layanan,
                    status,
                    id_pasien,
                    id_tindakan,
                    doctor_id,
                    tb_pasien (
                        nama_pasien
                    ),
                    tb_tindakan (
                        nama_tindakan
                    )
                `)
                .eq('status', 'Selesai')
                .order('tanggal', { ascending: false });

            if (error) throw error;

            const allRecords = data || [];
            setRecords(allRecords);
            setFiltered(allRecords);

            // Build tindakan filter options (unique)
            const tindakanSet = new Map<string, string>();
            allRecords.forEach((r: any) => {
                if (r.id_tindakan && r.tb_tindakan?.nama_tindakan) {
                    tindakanSet.set(r.id_tindakan.toString(), r.tb_tindakan.nama_tindakan);
                }
            });
            setTindakanList(Array.from(tindakanSet.entries()).map(([val, label]) => ({ label, value: val })));

            // Build diagnosa filter options (unique)
            const diagnosaSet = new Set<string>();
            allRecords.forEach((r: any) => {
                if (r.diagnosa) diagnosaSet.add(r.diagnosa);
            });
            setDiagnosaList(Array.from(diagnosaSet));

        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (bulan: string, layanan: string, tindakan: string, diagnosa: string) => {
        let result = [...records];

        if (bulan) {
            result = result.filter(r => {
                if (!r.tanggal) return false;
                const month = r.tanggal.split('-')[1];
                return month === bulan;
            });
        }
        if (layanan) {
            result = result.filter(r => r.layanan === layanan);
        }
        if (tindakan) {
            result = result.filter(r => r.id_tindakan?.toString() === tindakan);
        }
        if (diagnosa) {
            result = result.filter(r => r.diagnosa === diagnosa);
        }

        setFiltered(result);
    };

    const onFilterChange = (key: 'bulan' | 'layanan' | 'tindakan' | 'diagnosa', val: string) => {
        const newBulan = key === 'bulan' ? val : filterBulan;
        const newLayanan = key === 'layanan' ? val : filterLayanan;
        const newTindakan = key === 'tindakan' ? val : filterTindakan;
        const newDiagnosa = key === 'diagnosa' ? val : filterDiagnosa;

        if (key === 'bulan') setFilterBulan(val);
        if (key === 'layanan') setFilterLayanan(val);
        if (key === 'tindakan') setFilterTindakan(val);
        if (key === 'diagnosa') setFilterDiagnosa(val);

        applyFilters(newBulan, newLayanan, newTindakan, newDiagnosa);
    };

    const formatTanggal = (tgl: string) => {
        if (!tgl) return '-';
        const d = new Date(tgl);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    return (
        <AdminLayout noScroll={true} customRightTitle="Histori">
            <View style={{ flex: 1 }}>

                {/* Filter Section */}
                <View style={styles.filterCard}>
                    <View style={styles.filterRow}>
                        {/* Bulan */}
                        <View style={styles.filterItem}>
                            <Text style={styles.filterLabel}>Bulan :</Text>
                            <View style={styles.pickerBox}>
                                <Picker
                                    selectedValue={filterBulan}
                                    onValueChange={(val) => onFilterChange('bulan', val)}
                                    style={styles.picker}
                                    dropdownIconColor={Colors.primary}
                                    mode="dropdown"
                                >
                                    {BULAN_OPTIONS.map(o => (
                                        <Picker.Item key={o.value} label={o.label} value={o.value} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Perawatan */}
                        <View style={styles.filterItem}>
                            <Text style={styles.filterLabel}>Perawatan :</Text>
                            <View style={styles.pickerBox}>
                                <Picker
                                    selectedValue={filterTindakan}
                                    onValueChange={(val) => onFilterChange('tindakan', val)}
                                    style={styles.picker}
                                    dropdownIconColor={Colors.primary}
                                    mode="dropdown"
                                >
                                    <Picker.Item label="Semua Perawatan" value="" />
                                    {tindakanList.map(o => (
                                        <Picker.Item key={o.value} label={o.label} value={o.value} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>

                    <View style={styles.filterRow}>
                        {/* Pelayanan */}
                        <View style={styles.filterItem}>
                            <Text style={styles.filterLabel}>Pelayanan :</Text>
                            <View style={styles.pickerBox}>
                                <Picker
                                    selectedValue={filterLayanan}
                                    onValueChange={(val) => onFilterChange('layanan', val)}
                                    style={styles.picker}
                                    dropdownIconColor={Colors.primary}
                                    mode="dropdown"
                                >
                                    {LAYANAN_OPTIONS.map(o => (
                                        <Picker.Item key={o.value} label={o.label} value={o.value} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Diagnosa */}
                        <View style={styles.filterItem}>
                            <Text style={styles.filterLabel}>Diagnosa :</Text>
                            <View style={styles.pickerBox}>
                                <Picker
                                    selectedValue={filterDiagnosa}
                                    onValueChange={(val) => onFilterChange('diagnosa', val)}
                                    style={styles.picker}
                                    dropdownIconColor={Colors.primary}
                                    mode="dropdown"
                                >
                                    <Picker.Item label="Semua Diagnosa" value="" />
                                    {diagnosaList.map(d => (
                                        <Picker.Item key={d} label={d} value={d} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Table */}
                {loading ? (
                    <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 30 }} />
                ) : (
                    <>
                    <View style={{ marginHorizontal: 6 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View>
                            {/* Table Header */}
                            <View style={styles.tableHeader}>
                                <Text style={[styles.th, { width: 85 }]}>Tgl</Text>
                                <Text style={[styles.th, { width: 150 }]}>Nama</Text>
                                <Text style={[styles.th, { width: 150 }]}>Dokter</Text>
                                <Text style={[styles.th, { width: 100 }]}>Layanan</Text>
                                <Text style={[styles.th, { width: 160 }]}>Keluhan</Text>
                                <Text style={[styles.th, { width: 160 }]}>Diagnosa</Text>
                                <Text style={[styles.th, { width: 160 }]}>Perawatan</Text>
                                <Text style={[styles.th, { width: 150 }]}>Ket</Text>
                            </View>

                            {/* Table Rows */}
                            <ScrollView 
                                showsVerticalScrollIndicator={true}
                                nestedScrollEnabled={true}
                                style={{ maxHeight: 500 }}
                            >
                                {filtered.length === 0 ? (
                                    <View style={styles.emptyRow}>
                                        <Text style={styles.emptyText}>Tidak ada data ditemukan</Text>
                                    </View>
                                ) : (
                                    filtered.map((item, index) => (
                                        <View
                                            key={item.id_record}
                                            style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
                                        >
                                            <Text style={[styles.td, { width: 85 }]}>{formatTanggal(item.tanggal)}</Text>
                                            <Text style={[styles.td, { width: 150 }]}>{item.tb_pasien?.nama_pasien || '-'}</Text>
                                            <Text style={[styles.td, { width: 150 }]}>{item.doctor_id ? (doctorMap[item.doctor_id] || '-') : '-'}</Text>
                                            <Text style={[styles.td, { width: 100 }]}>{item.layanan || '-'}</Text>
                                            <Text style={[styles.td, { width: 160 }]} numberOfLines={2}>{item.keluhan || '-'}</Text>
                                            <Text style={[styles.td, { width: 160 }]} numberOfLines={2}>{item.diagnosa || '-'}</Text>
                                            <Text style={[styles.td, { width: 160 }]} numberOfLines={2}>{item.tb_tindakan?.nama_tindakan || '-'}</Text>
                                            <Text style={[styles.td, { width: 150 }]} numberOfLines={2}>{item.keterangan || '-'}</Text>
                                        </View>
                                    ))
                                )}
                            </ScrollView>
                        </View>
                    </ScrollView>
                    </View>
                    {/* Swipe hint */}
                    <Text style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 4, marginBottom: 2 }}>
                        {'<'} Geser untuk melihat lebih {'>'}
                    </Text>
                    </>
                )}

                {/* Footer count */}
                {!loading && (
                    <View style={styles.footerCount}>
                        <Text style={styles.footerText}>Menampilkan {filtered.length} dari {records.length} data</Text>
                        {(filterBulan || filterLayanan || filterTindakan || filterDiagnosa) && (
                            <TouchableOpacity onPress={() => {
                                setFilterBulan('');
                                setFilterLayanan('');
                                setFilterTindakan('');
                                setFilterDiagnosa('');
                                setFiltered(records);
                            }}>
                                <Text style={styles.resetText}>Reset Filter</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    clinicHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    logo: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'white',
    },
    clinicName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    clinicAddress: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 11,
        marginTop: 2,
    },

    filterCard: {
        marginHorizontal: 6,
        marginVertical: 6,
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        padding: 8,
        elevation: 2,
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    filterItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        width: 75,
    },
    pickerBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        backgroundColor: 'white',
        justifyContent: 'center',
    },
    picker: {
        color: '#000',
        fontSize: 13,
    },

    tableHeader: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    th: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.4)',
        paddingHorizontal: 4,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: 'white',
        minHeight: 45,
    },
    tableRowAlt: {
        backgroundColor: '#fdf5f5',
    },
    td: {
        fontSize: 11,
        color: '#333',
        textAlign: 'center',
        paddingHorizontal: 4,
        borderRightWidth: 1,
        borderRightColor: '#e0e0e0',
        flexWrap: 'wrap',
    },
    emptyRow: {
        padding: 30,
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
        fontStyle: 'italic',
    },
    footerCount: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f8f8f8',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    footerText: {
        fontSize: 12,
        color: '#666',
    },
    resetText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: 'bold',
    },
});
