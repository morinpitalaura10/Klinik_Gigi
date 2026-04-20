import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { supabase } from '../../../utils/supabase';
import { Colors, GlobalStyles, LayoutStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlert } from '../../../context/AlertContext';
import DropdownInput from '../../../components/molecules/DropdownInput';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

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
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [tindakanList, setTindakanList] = useState<any[]>([]);
    const [diagnosaList, setDiagnosaList] = useState<string[]>([]);
    const [doctorMap, setDoctorMap] = useState<Record<number, string> >({});
    const [isExporting, setIsExporting] = useState(false);


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
                    gigi,
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
                        id_tindakan,
                        nama_tindakan
                    )
                `)
                .eq('status', 'Selesai')
                .order('tanggal', { ascending: false });

            if (error) throw error;

            const allRecords = data || [];
            setRecords(allRecords);
            setFiltered(allRecords);


            const tindakanMap = new Map<number, string>();
            allRecords.forEach((r: any) => {
                if (r.id_tindakan && r.tb_tindakan?.nama_tindakan) {
                    tindakanMap.set(r.id_tindakan, r.tb_tindakan.nama_tindakan);
                }
            });
            setTindakanList(Array.from(tindakanMap.entries()).map(([id_tindakan, nama_tindakan]) => ({ id_tindakan, nama_tindakan })));


            const diagnosaSet = new Set<string>();
            allRecords.forEach((r: any) => {
                if (r.diagnosa) diagnosaSet.add(r.diagnosa);
            });
            setDiagnosaList(Array.from(diagnosaSet));

        } catch (e: any) {
            showAlert({ title: 'Error', message: e.message, type: 'error' });
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
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const handleExport = async () => {
        if (isExporting || filtered.length === 0) return;
        setIsExporting(true);
        try {
            const trs = filtered.map(r => `
                <tr>
                    <td>${formatTanggal(r.tanggal)}</td>
                    <td>${r.tb_pasien?.nama_pasien || '-'}</td>
                    <td>${r.doctor_id ? doctorMap[r.doctor_id] || '-' : '-'}</td>
                    <td>${r.layanan || '-'}</td>
                    <td>${r.gigi || '-'}</td>
                    <td>${r.diagnosa || '-'}</td>
                    <td>${r.tb_tindakan?.nama_tindakan || '-'}</td>
                    <td>${r.keterangan || '-'}</td>
                </tr>
            `).join('');

            const htmlContent = `
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                        <style>
                            body { font-family: sans-serif; padding: 20px; }
                            h2 { text-align: center; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid black; padding: 8px; text-align: center; font-size: 12px; }
                            th { background-color: #f2f2f2; }
                        </style>
                    </head>
                    <body>
                        <h2>Histori Medis Keseluruhan</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Tgl</th>
                                    <th>Nama Pasien</th>
                                    <th>Dokter</th>
                                    <th>Layanan</th>
                                    <th>Gigi</th>
                                    <th>Diagnosa</th>
                                    <th>Perawatan</th>
                                    <th>Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${trs}
                            </tbody>
                        </table>
                    </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Ekspor Riwayat Medis' });
        } catch (e: any) {
            showAlert({ title: 'Gagal Ekspor', message: e.message, type: 'error' });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <AdminLayout noScroll={true} customRightTitle="Histori">
            <View style={LayoutStyles.flex1}>

                
                <View style={GlobalStyles.historyFilterCard}>
                    <View style={GlobalStyles.historyFilterRow}>
                        
                        <View style={GlobalStyles.historyFilterItem}>
                            <DropdownInput
                                label="Bulan"
                                options={[
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
                                    { label: 'Desember', value: '12' }
                                ]}
                                selectedValue={filterBulan}
                                onValueChange={(val) => onFilterChange('bulan', val)}
                            />
                        </View>
                        
                        <View style={GlobalStyles.historyFilterItem}>
                            <DropdownInput
                                label="Layanan"
                                options={[
                                    { label: 'Semua Layanan', value: '' },
                                    { label: 'Umum', value: 'Umum' },
                                    { label: 'Ortodental', value: 'Ortodental' }
                                ]}
                                selectedValue={filterLayanan}
                                onValueChange={(val) => onFilterChange('layanan', val)}
                            />
                        </View>
                    </View>
                    <View style={GlobalStyles.historyFilterRow}>
                        
                        <View style={GlobalStyles.historyFilterItem}>
                            <DropdownInput
                                label="Perawatan"
                                options={[
                                    { label: 'Semua Perawatan', value: '' },
                                    ...tindakanList.map(t => ({ label: t.nama_tindakan, value: t.id_tindakan.toString() }))
                                ]}
                                selectedValue={filterTindakan}
                                onValueChange={(val) => onFilterChange('tindakan', val)}
                            />
                        </View>
                        
                        <View style={GlobalStyles.historyFilterItem}>
                            <DropdownInput
                                label="Diagnosa"
                                options={[
                                    { label: 'Semua Diagnosa', value: '' },
                                    ...diagnosaList.map(d => ({ label: d, value: d }))
                                ]}
                                selectedValue={filterDiagnosa}
                                onValueChange={(val) => onFilterChange('diagnosa', val)}
                            />
                        </View>
                    </View>
                </View>

                <View style={[LayoutStyles.rowBetween, LayoutStyles.ph20, LayoutStyles.mb15]}>
                    <Text style={GlobalStyles.formSectionTitle}>DATA REKAM MEDIS</Text>
                    <TouchableOpacity 
                        style={[GlobalStyles.listAddButton, { height: 45, paddingHorizontal: 20 }]}
                        onPress={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <MaterialCommunityIcons name="file-export-outline" size={20} color="white" />
                        )}
                        <Text style={[GlobalStyles.exportBtnText, { fontSize: 14, marginLeft: 10 }]}>
                            {isExporting ? 'Mengekspor...' : 'Export File'}
                        </Text>
                    </TouchableOpacity>
                </View>

                
                {loading ? (
                    <ActivityIndicator size="large" color={Colors.primary} style={LayoutStyles.mt50} />
                ) : (
                    <>
                    <View style={GlobalStyles.historyTableContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View style={LayoutStyles.w1100}>
                            
                            <View style={GlobalStyles.tableHeaderAtomic}>
                                <View style={[GlobalStyles.tableCellAtomic, GlobalStyles.tableCellFirst, LayoutStyles.w90]}><Text style={GlobalStyles.tableThText}>Tgl</Text></View>
                                <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w150]}><Text style={GlobalStyles.tableThText}>Nama</Text></View>
                                <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w140]}><Text style={GlobalStyles.tableThText}>Dokter</Text></View>
                                <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w100]}><Text style={GlobalStyles.tableThText}>Layanan</Text></View>
                                <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w150]}><Text style={GlobalStyles.tableThText}>Gigi</Text></View>
                                <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w150]}><Text style={GlobalStyles.tableThText}>Diagnosa</Text></View>
                                <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w160]}><Text style={GlobalStyles.tableThText}>Perawatan</Text></View>
                                <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w160]}><Text style={GlobalStyles.tableThText}>Ket</Text></View>
                            </View>
                            
                            <View style={GlobalStyles.tableBodyWrapperAtomic}>
                                {filtered.length === 0 ? (
                                    <View style={GlobalStyles.emptyContent}>
                                        <Text style={GlobalStyles.emptyText}>Tidak ada data ditemukan</Text>
                                    </View>
                                ) : (
                                    filtered.map((item, index) => (
                                        <View key={item.id_record} style={[GlobalStyles.tableRowAtomic, index % 2 === 1 && GlobalStyles.historyTableRowAlt]}>
                                            <View style={[GlobalStyles.tableCellAtomic, GlobalStyles.tableCellFirst, LayoutStyles.w90]}><Text style={GlobalStyles.tableTdText}>{formatTanggal(item.tanggal)}</Text></View>
                                            <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w150]}><Text style={GlobalStyles.tableTdText}>{item.tb_pasien?.nama_pasien || '-'}</Text></View>
                                            <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w140]}><Text style={GlobalStyles.tableTdText}>{item.doctor_id ? (doctorMap[item.doctor_id] || '-') : '-'}</Text></View>
                                            <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w100]}><Text style={GlobalStyles.tableTdText}>{item.layanan || '-'}</Text></View>
                                            <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w150]}><Text style={GlobalStyles.tableTdText} numberOfLines={2}>{item.gigi || '-'}</Text></View>
                                            <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w150]}><Text style={GlobalStyles.tableTdText} numberOfLines={2}>{item.diagnosa || '-'}</Text></View>
                                            <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w160]}><Text style={GlobalStyles.tableTdText} numberOfLines={2}>{item.tb_tindakan?.nama_tindakan || '-'}</Text></View>
                                            <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w160]}><Text style={GlobalStyles.tableTdText} numberOfLines={2}>{item.keterangan || '-'}</Text></View>
                                        </View>
                                    ))
                                )}
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                    </>
                )}

                
                {!loading && (
                    <View style={GlobalStyles.historyFooterCount}>
                        <Text style={GlobalStyles.historyFooterText}>Menampilkan {filtered.length} dari {records.length} data</Text>
                        {(filterBulan || filterLayanan || filterTindakan || filterDiagnosa) && (
                            <TouchableOpacity onPress={() => {
                                setFilterBulan('');
                                setFilterLayanan('');
                                setFilterTindakan('');
                                setFilterDiagnosa('');
                                setFiltered(records);
                            }}>
                                <Text style={GlobalStyles.historyResetText}>Reset Filter</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </AdminLayout>
    );
}

