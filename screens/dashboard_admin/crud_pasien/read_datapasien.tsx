import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { GlobalStyles, LayoutStyles, Colors } from '../../../styles/GlobalStyles';
import { supabase } from '../../../utils/supabase';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAlert } from '../../../context/AlertContext';
import DropdownInput from '../../../components/molecules/DropdownInput';

export function ReadPasien() {
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  const route = useRoute<any>();
  const params = route.params || {};
  const { id } = params;

  const [data, setData] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [filterLayanan, setFilterLayanan] = useState('');

  useEffect(() => {
    if (id) {
        fetchDetailAndHistory();
    } else {
        setLoading(false);
    }
  }, [id]);

  const fetchDetailAndHistory = async () => {
    try {
      setLoading(true);

      const { data: patient, error: patientError } = await supabase
        .from('tb_pasien')
        .select('*')
        .eq('id_pasien', id)
        .single();
      
      if (patientError) throw patientError;
      setData(patient);


      const { data: history, error: historyError } = await supabase
        .from('tb_rekam_medis')
        .select(`
            id_record,
            tanggal,
            layanan,
            gigi,
            diagnosa,
            keterangan,
            tb_tindakan(nama_tindakan)
        `)
        .eq('id_pasien', id)
        .eq('status', 'Selesai')
        .order('tanggal', { ascending: false });

      if (historyError) throw historyError;
      setRecords(history || []);
    } catch (error: any) {
      console.error(error.message);
      showAlert({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = filterLayanan 
    ? records.filter(r => r.layanan === filterLayanan)
    : records;

  const handleExport = async () => {
    if (isExporting || !data) return;
    setIsExporting(true);
    try {
        const itemsToExport = filteredRecords;
        const trs = itemsToExport.map(r => `
            <tr>
                <td>${formatTanggal(r.tanggal)}</td>
                <td>${r.layanan || '-'}</td>
                <td>${r.gigi || '-'}</td>
                <td>${r.diagnosa || '-'}</td>
                <td>${r.tb_tindakan?.nama_tindakan || '-'}</td>
                <td>${r.keterangan || '-'}</td>
            </tr>
        `).join('');


        const headerOrto = `
            <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: bold; font-family: serif;">PRAKTEK DOKTER GIGI SPESIALIS</div>
                <div style="font-size: 18px; font-weight: 900; margin: 2px 0;">drg. INDRA RAFISUKMAWAN, Sp.Ort</div>
                <div style="font-size: 11px; font-weight: bold; margin-bottom: 2px;">SIP : 500.16.7/054-DPMPTSP/SIPTM/Drgs.2/IV/2025</div>
                <div style="font-size: 11px;">Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</div>
            </div>
        `;

        const headerUmum = `
            <div style="text-align: center;">
                <div style="font-size: 22px; font-weight: bold; font-family: serif;">GALERI ORTODENTAL</div>
                <div style="font-size: 11px;">Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</div>
            </div>
        `;

        const headerDefault = `
            <h2 style="text-align: center;">Riwayat Medis Pasien</h2>
        `;

        let activeHeader = headerDefault;
        if (filterLayanan === 'Ortodental') activeHeader = headerOrto;
        else if (filterLayanan === 'Umum') activeHeader = headerUmum;

        const htmlContent = `
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        .header-line { height: 3px; background-color: #000; margin: 10px 0 2px 0; border-radius: 0; }
                        .header-line-thin { height: 1px; background-color: #000; margin-bottom: 20px; }
                        .patient-info { margin-bottom: 20px; line-height: 1.5; font-size: 13px; border: 1px solid #eee; padding: 10px; background: #fafafa; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1.5px solid black; padding: 10px 5px; text-align: center; font-size: 11px; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                    </style>
                </head>
                <body>
                    ${activeHeader}
                    <div class="header-line"></div>
                    <div class="header-line-thin"></div>
                    
                    <div class="patient-info">
                        <strong>Nama:</strong> ${data.nama_pasien} &nbsp;&nbsp; | &nbsp;&nbsp; 
                        <strong>No. HP:</strong> ${data.nope} <br/>
                        <strong>Tgl Lahir:</strong> ${data.tgl_lahir} &nbsp;&nbsp; | &nbsp;&nbsp;
                        <strong>Alamat:</strong> ${data.alamat}
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Tgl</th>
                                <th>Layanan</th>
                                <th>Gigi</th>
                                <th>Diagnosa</th>
                                <th>Perawatan</th>
                                <th>Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${trs.length > 0 ? trs : '<tr><td colspan="6">Belum ada riwayat</td></tr>'}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Ekspor Riwayat Pasien' });
    } catch (e: any) {
        showAlert({ title: 'Gagal Ekspor', message: e.message, type: 'error' });
    } finally {
        setIsExporting(false);
    }
  };

  const formatTanggal = (tgl: string) => {
    if (!tgl) return '-';
    const d = new Date(tgl);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const minRows = 3;

  if (loading) return (
      <AdminLayout customRightTitle="detail pasien" noScroll={true}>
          <ActivityIndicator size="large" color={Colors.primary} style={LayoutStyles.mt50} />
      </AdminLayout>
  );

  return (
    <AdminLayout customRightTitle="Detail Pasien" noScroll={true}>
        <ScrollView contentContainerStyle={[LayoutStyles.scrollContent, LayoutStyles.alignCenter, LayoutStyles.bgWhite]}>
            
            
            <View style={GlobalStyles.detailCard}>
                <View style={[LayoutStyles.row, LayoutStyles.flexWrap]}>
                    
                    <View style={[LayoutStyles.flex1, LayoutStyles.minW250, LayoutStyles.mr10]}>
                        <View style={LayoutStyles.mb20}>
                            <Text style={GlobalStyles.detailLabel}>Nama</Text>
                            <Text style={GlobalStyles.detailValue}>{data?.nama_pasien || '-'}</Text>
                        </View>
                        <View style={LayoutStyles.mb20}>
                            <Text style={GlobalStyles.detailLabel}>Tanggal Lahir</Text>
                            <Text style={GlobalStyles.detailValue}>{data?.tgl_lahir || '-'}</Text>
                        </View>
                        <View style={LayoutStyles.mb20}>
                            <Text style={GlobalStyles.detailLabel}>Jenis Kelamin</Text>
                            <Text style={GlobalStyles.detailValue}>{data?.jk || '-'}</Text>
                        </View>
                        <View style={LayoutStyles.mb20}>
                            <Text style={GlobalStyles.detailLabel}>Alamat</Text>
                            <Text style={GlobalStyles.detailValue}>{data?.alamat || '-'}</Text>
                        </View>
                    </View>

                    
                    <View style={[LayoutStyles.flex1, LayoutStyles.minW250]}>
                        <View style={LayoutStyles.mb20}>
                            <Text style={GlobalStyles.detailLabel}>Pekerjaan</Text>
                            <Text style={GlobalStyles.detailValue}>{data?.pekerjaan || '-'}</Text>
                        </View>
                        <View style={LayoutStyles.mb20}>
                            <Text style={GlobalStyles.detailLabel}>Nomor Handphone</Text>
                            <Text style={GlobalStyles.detailValue}>{data?.nope || '-'}</Text>
                        </View>
                        <View style={LayoutStyles.mb20}>
                            <Text style={GlobalStyles.detailLabel}>Alergi Obat</Text>
                            <Text style={GlobalStyles.detailValue}>{data?.alergi_obat || '-'}</Text>
                        </View>
                    </View>
                </View>
            </View>

            
            <View style={GlobalStyles.tableCardAtomic}>
                <View style={[GlobalStyles.filterSectionAtomic, { justifyContent: 'space-between' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <MaterialCommunityIcons name="filter-menu" size={22} color={Colors.primary} style={LayoutStyles.mr10} />
                        <View style={{ flex: 1, maxWidth: 250 }}>
                            <DropdownInput
                                label=""
                                options={[
                                    { label: 'Semua Layanan', value: '' },
                                    { label: 'Umum', value: 'Umum' },
                                    { label: 'Ortodental', value: 'Ortodental' }
                                ]}
                                selectedValue={filterLayanan}
                                onValueChange={(v) => setFilterLayanan(v)}
                                placeholder="Filter Layanan"
                            />
                        </View>
                    </View>

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

                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    <View style={LayoutStyles.w900}>
                        
                        <View style={GlobalStyles.tableHeaderAtomic}>
                            <View style={[GlobalStyles.tableCellAtomic, GlobalStyles.tableCellFirst, LayoutStyles.w100]}><Text style={GlobalStyles.tableThText}>Tgl</Text></View>
                            <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w130]}><Text style={GlobalStyles.tableThText}>Layanan</Text></View>
                            <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w170]}><Text style={GlobalStyles.tableThText}>Gigi</Text></View>
                            <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w170]}><Text style={GlobalStyles.tableThText}>Diagnosa</Text></View>
                            <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w170]}><Text style={GlobalStyles.tableThText}>Perawatan</Text></View>
                            <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w160]}><Text style={GlobalStyles.tableThText}>Keterangan</Text></View>
                        </View>
                        
                        <View style={GlobalStyles.tableBodyWrapperAtomic}>
                            {filteredRecords.map((item, index) => (
                                <View key={item.id_record || index} style={GlobalStyles.tableRowAtomic}>
                                    <View style={[GlobalStyles.tableCellAtomic, GlobalStyles.tableCellFirst, LayoutStyles.w100]}><Text style={GlobalStyles.tableTdText}>{formatTanggal(item.tanggal)}</Text></View>
                                    <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w130]}><Text style={GlobalStyles.tableTdText}>{item.layanan || '-'}</Text></View>
                                    <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w170]}><Text style={GlobalStyles.tableTdText} numberOfLines={2}>{item.gigi || '-'}</Text></View>
                                    <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w170]}><Text style={GlobalStyles.tableTdText} numberOfLines={2}>{item.diagnosa || '-'}</Text></View>
                                    <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w170]}><Text style={GlobalStyles.tableTdText} numberOfLines={2}>{item.tb_tindakan?.nama_tindakan || '-'}</Text></View>
                                    <View style={[GlobalStyles.tableCellAtomic, LayoutStyles.w160]}><Text style={GlobalStyles.tableTdText} numberOfLines={2}>{item.keterangan || '-'}</Text></View>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </ScrollView>
    </AdminLayout>
);
}
