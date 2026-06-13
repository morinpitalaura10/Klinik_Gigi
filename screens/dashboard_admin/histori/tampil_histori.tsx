import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    StyleSheet,
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
import { getBase64Logo } from '../../../utils/imageUtils';

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

const HARI_OPTIONS = [
    { label: 'Semua Hari', value: '' },
    { label: 'Hari Ini', value: 'hari_ini' },
];

export function TampilHistori() {
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [tindakanList, setTindakanList] = useState<any[]>([]);
    const [doctorMap, setDoctorMap] = useState<Record<number, string>>({});
    const [isExporting, setIsExporting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;


    const [doctorList, setDoctorList] = useState<any[]>([]);
    const [yearList, setYearList] = useState<string[]>([]);
    const [filterBulan, setFilterBulan] = useState('');
    const [filterLayanan, setFilterLayanan] = useState('');
    const [filterTindakan, setFilterTindakan] = useState('');
    const [filterDoctor, setFilterDoctor] = useState('');
    const [filterHari, setFilterHari] = useState('');
    const [filterTahun, setFilterTahun] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchAll();
            fetchDoctors();
            fetchMasterData();
        }, [])
    );

    const fetchMasterData = async () => {
        try {
            const { data: actions } = await supabase.from('tb_tindakan').select('*');
            if (actions) setTindakanList(actions);
        } catch (_) { }
    };

    const fetchDoctors = async () => {
        try {
            const { data } = await supabase
                .from('tb_users')
                .select('id_users, nama_users')
                .eq('role', 'dokter');
            if (data) {
                setDoctorList(data);
                const map: Record<number, string> = {};
                data.forEach((d: any) => { map[d.id_users] = d.nama_users; });
                setDoctorMap(map);
            }
        } catch (_) { }
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
                    )
                `)
                .eq('status', 'Selesai')
                .order('tanggal', { ascending: false })
                .order('id_record', { ascending: false });

            if (error) throw error;

            const allRecords = data || [];
            setRecords(allRecords);
            setFiltered(allRecords);

            // Extract unique years
            const years = new Set<string>();
            allRecords.forEach((r: any) => {
                if (r.tanggal) {
                    const year = r.tanggal.split('-')[0];
                    if (year && year.length === 4) {
                        years.add(year);
                    }
                }
            });
            setYearList(Array.from(years).sort((a, b) => b.localeCompare(a)));

        } catch (e: any) {
            showAlert({ title: 'Error', message: e.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (
        bulan: string,
        layanan: string,
        tindakan: string,
        dokter: string,
        hari: string,
        tahun: string
    ) => {
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
        if (dokter) {
            result = result.filter(r => r.doctor_id?.toString() === dokter);
        }
        if (hari === 'hari_ini') {
            const todayStr = new Date().toLocaleDateString('en-CA');
            result = result.filter(r => r.tanggal === todayStr);
        }
        if (tahun) {
            result = result.filter(r => {
                if (!r.tanggal) return false;
                const year = r.tanggal.split('-')[0];
                return year === tahun;
            });
        }

        setFiltered(result);
        setCurrentPage(1); // Reset to first page when filtering
    };

    const onFilterChange = (
        key: 'bulan' | 'layanan' | 'tindakan' | 'dokter' | 'hari' | 'tahun',
        val: string
    ) => {
        const newBulan = key === 'bulan' ? val : filterBulan;
        const newLayanan = key === 'layanan' ? val : filterLayanan;
        const newTindakan = key === 'tindakan' ? val : filterTindakan;
        const newDoctor = key === 'dokter' ? val : filterDoctor;
        const newHari = key === 'hari' ? val : filterHari;
        const newTahun = key === 'tahun' ? val : filterTahun;

        if (key === 'bulan') setFilterBulan(val);
        if (key === 'layanan') setFilterLayanan(val);
        if (key === 'tindakan') setFilterTindakan(val);
        if (key === 'dokter') setFilterDoctor(val);
        if (key === 'hari') setFilterHari(val);
        if (key === 'tahun') setFilterTahun(val);

        applyFilters(newBulan, newLayanan, newTindakan, newDoctor, newHari, newTahun);
    };

    const formatTanggal = (tgl: string) => {
        if (!tgl) return '-';
        try {
            const datePart = tgl.split('T')[0];
            const parts = datePart.split('-');
            if (parts.length === 3) {
                if (parts[0].length === 4) {
                    return `${parts[2]}/${parts[1]}/${parts[0]}`; // YYYY-MM-DD -> DD/MM/YYYY
                } else {
                    return `${parts[0]}/${parts[1]}/${parts[2]}`; // DD-MM-YYYY -> DD/MM/YYYY
                }
            }
            return tgl;
        } catch (e) {
            return tgl;
        }
    };

    const handleExport = async () => {
        if (isExporting || filtered.length === 0) return;
        setIsExporting(true);
        try {
            const logoUri = await getBase64Logo();

            const monthLabel = filterBulan ? BULAN_OPTIONS.find(o => o.value === filterBulan)?.label : 'Semua';
            const pelayananLabel = filterLayanan || 'Semua';
            const layananLabel = filterTindakan ? tindakanList.find(t => t.id_tindakan.toString() === filterTindakan)?.nama_tindakan : 'Semua';

            const trs = filtered.map((r, index) => `
                <tr>
                    <td>${formatTanggal(r.tanggal)}</td>
                    <td>${r.tb_pasien?.nama_pasien || '-'}</td>
                    <td>${r.doctor_id ? doctorMap[r.doctor_id] || '-' : '-'}</td>
                    <td>${r.layanan || '-'}</td>
                    <td>${r.gigi || '-'}</td>
                    <td>${r.diagnosa || '-'}</td>
                    <td>${r.id_tindakan ? r.id_tindakan.toString().split(',').map((id: string) => {
                const t = tindakanList.find(x => x.id_tindakan.toString() === id.trim());
                return t ? t.nama_tindakan : '';
            }).filter(Boolean).join(', ') : '-'}</td>
                    <td>${r.keterangan || '-'}</td>
                </tr>
            `).join('');

            const currentYear = new Date().getFullYear();

            const htmlContent = `
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                        <style>
                            * {
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                            @page { 
                                margin: 0px !important;
                                padding: 0px !important;
                                size: A4 portrait; 
                            }
                            html, body { 
                                margin: 0 !important; 
                                padding: 0 !important;
                                font-family: 'Times New Roman', serif; 
                                background-color: white; 
                                width: 100%;
                                height: 100%;
                                box-sizing: border-box;
                            }
                            .container {
                                padding: 0px 20px 20px 20px;
                                margin: 0 !important;
                                width: 100%;
                                box-sizing: border-box;
                            }
                            .header-detailed {
                                display: flex; align-items: center; justify-content: space-between; margin-top: 5px;
                            }
                            .logo-aligner { width: 150px; text-align: center; }
                            .logo-circle { width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
                            .header-text-container { flex: 1; text-align: center; color: #000; }
                            
                            .double-line { border-bottom: 3px solid #000; border-top: 1px solid #000; height: 2px; margin: 20px 0; }
                            
                            .intro-text { font-size: 14px; font-weight: bold; margin: 20px 0; font-family: serif; }
                            
                            .filter-grid { 
                                display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0 20px 0; font-size: 14px;
                                padding: 0; background: transparent; border: none; font-family: serif;
                                page-break-inside: avoid;
                            }
                            .f-row { display: flex; margin-bottom: 15px; }
                            .f-label { width: 100px; font-weight: bold; color: #000; }
                            .f-value { font-weight: normal; flex: 1; }

                            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                            thead { display: table-header-group; }
                            tr { page-break-inside: avoid; }
                            th { background-color: #801919; color: white; padding: 12px 5px; font-size: 11px; font-weight: bold; text-align: center; border: 1px solid #601010; }
                            td { padding: 12px 5px; border: 1px solid #000; text-align: center; font-size: 11px; vertical-align: middle; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header-detailed">
                                <div class="logo-aligner">
                                    <div class="logo-circle">
                                        <img src="${logoUri}" style="width: 120px; height: 120px; border-radius: 60px;" />
                                    </div>
                                </div>
                                <div class="header-text-container">
                                    <div style="font-size: 32px; font-weight: bold; font-family: 'Times New Roman', serif; margin-bottom: 5px;">PRAKTEK DOKTER GIGI SPESIALIS</div>
                                    <div style="font-size: 28px; font-weight: 900; margin: 2px 0; font-family: 'Times New Roman', serif;">drg. INDRA RAFISUKMAWAN, Sp.Ort</div>
                                    <div style="font-size: 17px; font-weight: bold; margin-bottom: 2px; font-family: 'Times New Roman', serif;">SIP : 500.16.7/054-DPMPTSP/SIPTM/Drgs.2/IV/2025</div>
                                    <div style="font-size: 17px; margin: 0; font-family: 'Times New Roman', serif;">Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</div>
                                </div>
                            </div>
                            
                            <div class="double-line"></div>
                            
                            <div class="intro-text">Berikut adalah laporan aktivitas Klinik Galeri Ortodental tahun ${currentYear}, sebagai berikut :</div>

                            <div class="filter-grid">
                                <div>
                                    <div class="f-row"><div class="f-label">Bulan</div><div class="f-value">: ${monthLabel}</div></div>
                                    <div class="f-row"><div class="f-label">Pelayanan</div><div class="f-value">: ${pelayananLabel}</div></div>
                                </div>
                                <div>
                                    <div class="f-row"><div class="f-label">Layanan</div><div class="f-value">: ${layananLabel}</div></div>
                                </div>
                            </div>

                            <table>
                                <thead>
                                    <tr>
                                        <th style="width: 50px;">Tgl</th>
                                        <th>Pasien</th>
                                        <th>Dokter</th>
                                        <th>Lyn</th>
                                        <th>Gigi</th>
                                        <th>Kel/Diagnosa</th>
                                        <th>Perawatan</th>
                                        <th>Ket</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${trs}
                                </tbody>
                            </table>
                        </div>
                    </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                width: 794,
                height: 1123
            });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Ekspor Riwayat Medis' });
        } catch (e: any) {
            showAlert({ title: 'Gagal Ekspor', message: e.message, type: 'error' });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <AdminLayout title="Aktifitas / Histori Admin">
            <View style={GlobalStyles.historyContainer}>


                <View style={styles.filterCard}>
                    <View style={styles.filterHeader}>
                        <View style={styles.filterHeaderIcon}>
                            <MaterialCommunityIcons name="filter-variant" size={18} color="white" />
                        </View>
                        <Text style={styles.filterHeaderTitle}>Filter Pencarian</Text>
                    </View>

                    {/* Row 1: Bulan, Pelayanan */}
                    <View style={styles.filterGrid2}>
                        <View style={styles.filterItem}>
                            <Text style={styles.filterLabel}>Bulan</Text>
                            <DropdownInput
                                label="Bulan"
                                options={BULAN_OPTIONS}
                                selectedValue={filterBulan}
                                onValueChange={(val) => onFilterChange('bulan', val)}
                                hideLabel={true}
                                containerStyle={styles.dropdownContainer}
                                buttonStyle={styles.dropdownBtn}
                                isActive={!!filterBulan}
                            />
                        </View>
                        <View style={styles.filterItem}>
                            <Text style={styles.filterLabel}>Pelayanan</Text>
                            <DropdownInput
                                label="Pelayanan"
                                options={LAYANAN_OPTIONS}
                                selectedValue={filterLayanan}
                                onValueChange={(val) => onFilterChange('layanan', val)}
                                hideLabel={true}
                                containerStyle={styles.dropdownContainer}
                                buttonStyle={styles.dropdownBtn}
                                isActive={!!filterLayanan}
                            />
                        </View>
                    </View>

                    {/* Row 2: Layanan, Nama Dokter */}
                    <View style={styles.filterGrid2}>
                        <View style={styles.filterItem}>
                            <Text style={styles.filterLabel}>Layanan</Text>
                            <DropdownInput
                                label="Layanan"
                                options={[
                                    { label: 'Semua Layanan', value: '' },
                                    ...tindakanList.map(t => ({ label: t.nama_tindakan, value: t.id_tindakan.toString() }))
                                ]}
                                selectedValue={filterTindakan}
                                onValueChange={(val) => onFilterChange('tindakan', val)}
                                hideLabel={true}
                                containerStyle={styles.dropdownContainer}
                                buttonStyle={styles.dropdownBtn}
                                isActive={!!filterTindakan}
                            />
                        </View>
                        <View style={styles.filterItem}>
                            <Text style={styles.filterLabel}>Nama Dokter</Text>
                            <DropdownInput
                                label="Dokter"
                                options={[
                                    { label: 'Semua Dokter', value: '' },
                                    ...doctorList.map(d => ({ label: d.nama_users, value: d.id_users.toString() }))
                                ]}
                                selectedValue={filterDoctor}
                                onValueChange={(val) => onFilterChange('dokter', val)}
                                hideLabel={true}
                                containerStyle={styles.dropdownContainer}
                                buttonStyle={styles.dropdownBtn}
                                isActive={!!filterDoctor}
                            />
                        </View>
                    </View>

                    {/* Row 3: Hari, Tahun */}
                    <View style={styles.filterGrid2}>
                        <View style={styles.filterItem}>
                            <Text style={styles.filterLabel}>Hari</Text>
                            <DropdownInput
                                label="Hari"
                                options={HARI_OPTIONS}
                                selectedValue={filterHari}
                                onValueChange={(val) => onFilterChange('hari', val)}
                                hideLabel={true}
                                containerStyle={styles.dropdownContainer}
                                buttonStyle={styles.dropdownBtn}
                                isActive={!!filterHari}
                            />
                        </View>
                        <View style={styles.filterItem}>
                            <Text style={styles.filterLabel}>Tahun</Text>
                            <DropdownInput
                                label="Tahun"
                                options={[
                                    { label: 'Semua Tahun', value: '' },
                                    ...yearList.map(y => ({ label: y, value: y }))
                                ]}
                                selectedValue={filterTahun}
                                onValueChange={(val) => onFilterChange('tahun', val)}
                                hideLabel={true}
                                containerStyle={styles.dropdownContainer}
                                buttonStyle={styles.dropdownBtn}
                                isActive={!!filterTahun}
                            />
                        </View>
                    </View>
                </View>

                <View style={GlobalStyles.historyExportWrapper}>
                    <TouchableOpacity
                        style={GlobalStyles.historyExportBtnContainer}
                        onPress={handleExport}
                        disabled={isExporting}
                    >
                        <View style={LayoutStyles.flexRow}>
                            {isExporting ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <MaterialCommunityIcons name="file-document-outline" size={20} color="white" />
                            )}
                            <Text style={[GlobalStyles.primaryButtonText, { fontSize: 14, marginLeft: 8 }]}>
                                {isExporting ? 'Mengekspor...' : 'Export File'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>


                {loading ? (
                    <ActivityIndicator size="large" color={Colors.primary} style={LayoutStyles.mt50} />
                ) : (
                    <>
                        <>
                            <View style={styles.tableContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                                    <View style={{ width: 1260 }}>
                                        {/* Table Header */}
                                        <View style={styles.tableHeaderRow}>
                                            <View style={[styles.tableHeaderCell, styles.colTgl]}><Text style={styles.thText}>Tgl</Text></View>
                                            <View style={[styles.tableHeaderCell, styles.colNama]}><Text style={styles.thText}>Nama</Text></View>
                                            <View style={[styles.tableHeaderCell, styles.colDokter]}><Text style={styles.thText}>Dokter</Text></View>
                                            <View style={[styles.tableHeaderCell, styles.colLayanan]}><Text style={styles.thText}>Pelayanan</Text></View>
                                            <View style={[styles.tableHeaderCell, styles.colGigi]}><Text style={[styles.thText, { textAlign: 'center' }]}>Gigi</Text></View>
                                            <View style={[styles.tableHeaderCell, styles.colDiagnosa]}><Text style={styles.thText}>Diagnosa</Text></View>
                                            <View style={[styles.tableHeaderCell, styles.colPerawatan]}><Text style={styles.thText}>Perawatan</Text></View>
                                            <View style={[styles.tableHeaderCell, styles.colKeterangan]}><Text style={styles.thText}>Keterangan</Text></View>
                                        </View>

                                        {/* Table Body */}
                                        <View>
                                            {filtered.length === 0 ? (
                                                <View style={GlobalStyles.emptyContent}>
                                                    <Text style={GlobalStyles.emptyText}>Tidak ada data ditemukan</Text>
                                                </View>
                                            ) : (
                                                filtered
                                                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                                                    .map((item, index) => {
                                                        const treatments = item.id_tindakan ? (
                                                            item.id_tindakan.toString().split(',').map((id: string) => {
                                                                const t = tindakanList.find(x => x.id_tindakan.toString() === id.trim());
                                                                return t ? t.nama_tindakan : '';
                                                            }).filter(Boolean)
                                                        ) : [];

                                                        return (
                                                            <View key={item.id_record} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
                                                                <View style={[styles.tableCell, styles.colTgl]}><Text style={styles.tdText}>{formatTanggal(item.tanggal)}</Text></View>
                                                                <View style={[styles.tableCell, styles.colNama]}><Text style={[styles.tdText, styles.tdTextBold]}>{item.tb_pasien?.nama_pasien || '-'}</Text></View>
                                                                <View style={[styles.tableCell, styles.colDokter]}><Text style={styles.tdText}>{item.doctor_id ? (doctorMap[item.doctor_id] || '-') : '-'}</Text></View>
                                                                <View style={[styles.tableCell, styles.colLayanan]}>
                                                                    <View style={[
                                                                        styles.serviceBadge,
                                                                        item.layanan === 'Umum' ? styles.badgeUmum : styles.badgeOrto
                                                                    ]}>
                                                                        <Text style={[
                                                                            styles.serviceBadgeText,
                                                                            item.layanan === 'Umum' ? styles.badgeUmumText : styles.badgeOrtoText
                                                                        ]}>
                                                                            {item.layanan || 'Umum'}
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                                <View style={[styles.tableCell, styles.colGigi]}><Text style={[styles.tdText, { textAlign: 'center', fontWeight: '600' }]}>{item.gigi || '-'}</Text></View>
                                                                <View style={[styles.tableCell, styles.colDiagnosa]}><Text style={styles.tdText} numberOfLines={2}>{item.diagnosa || '-'}</Text></View>
                                                                <View style={[styles.tableCell, styles.colPerawatan]}>
                                                                    <View style={styles.badgeWrapperInline}>
                                                                        {treatments.map((tName: string, idx: number) => (
                                                                            <View key={idx} style={styles.treatmentBadgeInline}>
                                                                                <Text style={styles.treatmentBadgeTextInline} numberOfLines={1}>{tName}</Text>
                                                                            </View>
                                                                        ))}
                                                                        {treatments.length === 0 && <Text style={styles.tdText}>-</Text>}
                                                                    </View>
                                                                </View>
                                                                <View style={[styles.tableCell, styles.colKeterangan]}><Text style={[styles.tdText, styles.tdTextItalic]} numberOfLines={2}>{item.keterangan || '-'}</Text></View>
                                                            </View>
                                                        );
                                                    })
                                            )}
                                        </View>
                                    </View>
                                </ScrollView>
                            </View>

                            {/* Pagination Controls */}
                            {filtered.length > ITEMS_PER_PAGE && (
                                <View style={styles.paginationContainer}>
                                    <TouchableOpacity
                                        style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                                        onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <MaterialCommunityIcons name="chevron-left" size={24} color={currentPage === 1 ? "#CCC" : "#801919"} />
                                    </TouchableOpacity>

                                    <View style={styles.pageIndicator}>
                                        <Text style={styles.pageText}>Halaman</Text>
                                        <View style={styles.pageNumberBadge}>
                                            <Text style={styles.pageNumberText}>{currentPage}</Text>
                                        </View>
                                        <Text style={styles.pageText}>dari {Math.ceil(filtered.length / ITEMS_PER_PAGE)}</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.pageButton, currentPage === Math.ceil(filtered.length / ITEMS_PER_PAGE) && styles.pageButtonDisabled]}
                                        onPress={() => setCurrentPage(prev => Math.min(Math.ceil(filtered.length / ITEMS_PER_PAGE), prev + 1))}
                                        disabled={currentPage === Math.ceil(filtered.length / ITEMS_PER_PAGE)}
                                    >
                                        <MaterialCommunityIcons name="chevron-right" size={24} color={currentPage === Math.ceil(filtered.length / ITEMS_PER_PAGE) ? "#CCC" : "#801919"} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    </>
                )}


                {!loading && (
                    <View style={GlobalStyles.historyFooterCount}>
                        <Text style={GlobalStyles.historyFooterText}>Menampilkan {Math.min(filtered.length, ITEMS_PER_PAGE)} dari {filtered.length} data</Text>
                        {(filterBulan || filterLayanan || filterTindakan || filterDoctor || filterHari || filterTahun) && (
                            <TouchableOpacity onPress={() => {
                                setFilterBulan('');
                                setFilterLayanan('');
                                setFilterTindakan('');
                                setFilterDoctor('');
                                setFilterHari('');
                                setFilterTahun('');
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

const styles = StyleSheet.create({
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
        gap: 20,
    },
    pageButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    pageButtonDisabled: {
        backgroundColor: '#F5F5F5',
        elevation: 0,
    },
    pageIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pageText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    pageNumberBadge: {
        backgroundColor: '#801919',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pageNumberText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    filterCard: {
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 18,
        paddingBottom: 10,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#801919',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#F1E6E6',
    },
    filterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1E6E6',
        paddingBottom: 12,
    },
    filterHeaderIcon: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: '#801919',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterHeaderTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        letterSpacing: 0.2,
    },
    filterGrid2: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    filterItem: {
        flex: 1,
    },
    filterLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dropdownContainer: {
        marginBottom: 0,
    },
    dropdownBtn: {
        backgroundColor: '#FAFAFA',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 8,
        height: 44,
        paddingHorizontal: 10,
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
        marginTop: 10,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#801919',
        borderBottomWidth: 2,
        borderBottomColor: '#601010',
        paddingVertical: 18,
    },
    tableHeaderCell: {
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    thText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '700',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingVertical: 18,
        alignItems: 'center',
    },
    tableRowAlt: {
        backgroundColor: '#F8FAFC',
    },
    tableCell: {
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    tdText: {
        color: '#334155',
        fontSize: 13,
    },
    tdTextBold: {
        fontWeight: '600',
        color: '#1E293B',
    },
    tdTextItalic: {
        fontStyle: 'italic',
        color: '#64748B',
    },
    serviceBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    serviceBadgeText: {},
    badgeUmum: {
        backgroundColor: '#FFEBEB',
    },
    badgeUmumText: {
        color: '#801919',
        fontSize: 11,
        fontWeight: 'bold',
    },
    badgeOrto: {
        backgroundColor: '#E0F2FE',
    },
    badgeOrtoText: {
        color: '#0369A1',
        fontSize: 11,
        fontWeight: 'bold',
    },
    badgeWrapperInline: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    treatmentBadgeInline: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        maxWidth: 100,
    },
    treatmentBadgeTextInline: {
        fontSize: 11,
        color: '#334155',
        fontWeight: '500',
    },
    colTgl: { width: 100 },
    colNama: { width: 180 },
    colDokter: { width: 160 },
    colLayanan: { width: 120 },
    colGigi: { width: 80 },
    colDiagnosa: { width: 200 },
    colPerawatan: { width: 220 },
    colKeterangan: { width: 200 },
});
