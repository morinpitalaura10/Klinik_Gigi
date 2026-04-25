import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { GlobalStyles, LayoutStyles, Colors, PatientDetailStyles, PatientTableStyles } from '../../../styles/GlobalStyles';
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
  const [tindakanList, setTindakanList] = useState<any[]>([]);

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


      const { data: actions } = await supabase.from('tb_tindakan').select('*');
      if (actions) setTindakanList(actions);

      const { data: history, error: historyError } = await supabase
        .from('tb_rekam_medis')
        .select(`
            id_record,
            tanggal,
            layanan,
            gigi,
            diagnosa,
            keterangan,
            id_tindakan
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
        const logoUri = (Image as any).resolveAssetSource(require('../../../assets/icon.png')).uri;
        const itemsToExport = filteredRecords;
        
        const trs = itemsToExport.map(r => `
            <tr>
                <td>${formatTanggal(r.tanggal)}</td>
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

        const headerDetailed = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; position: relative;">
                <img src="${logoUri}" style="width: 65px; height: 65px; border-radius: 32px; border: 2.5px solid #801919;" />
                <div style="text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; font-family: sans-serif; letter-spacing: 0.5px;">PRAKTEK DOKTER GIGI SPESIALIS</div>
                    <div style="font-size: 22px; font-weight: 900; margin: 2px 0; font-family: serif;">drg. INDRA RAFISUKMAWAN, Sp.Ort</div>
                    <div style="font-size: 11px; font-weight: bold; margin-bottom: 2px;">SIP : 500.16.7/054-DPMPTSP/SIPTM/Drgs.2/IV/2025</div>
                    <div style="font-size: 11px;">Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</div>
                </div>
            </div>
        `;

        const headerSimple = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
                <img src="${logoUri}" style="width: 60px; height: 60px; border-radius: 30px; border: 2px solid #801919;" />
                <div style="text-align: center;">
                    <div style="font-size: 22px; font-weight: bold; font-family: sans-serif;">GALERI ORTODENTAL</div>
                    <div style="font-size: 12px; margin-top: 4px;">Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</div>
                </div>
            </div>
        `;

        let activeHeader = (filterLayanan === 'Umum') ? headerSimple : headerDetailed;

        const htmlContent = `
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                    <style>
                        @page { margin: 0 !important; size: 16.5cm 21.5cm; }
                        html, body { 
                            margin: 0 !important; 
                            padding: 0 !important; 
                            font-family: 'Times New Roman', serif; 
                            background-color: white; 
                            width: 16.5cm;
                            height: 21.5cm;
                            overflow: hidden;
                        }
                        .container {
                            margin: 0 !important;
                            padding: 5px 5px 15px 5px; /* Tiny padding just to not touch the physical edge too much */
                            box-sizing: border-box;
                            width: 100%;
                        }
                        .double-line { border-bottom: 3px solid #000; border-top: 1px solid #000; height: 2px; margin: 10px 0; }
                        .doc-title { text-align: center; font-size: 18px; font-weight: bold; margin: 10px 0; text-transform: uppercase; }
                        
                        .patient-grid { 
                            display: grid; 
                            grid-template-columns: 1fr 1fr; 
                            gap: 15px; 
                            margin: 15px 0; 
                            font-size: 13px;
                            border-bottom: 1px solid #ddd;
                            padding-bottom: 15px;
                        }
                        .p-row { display: flex; margin-bottom: 5px; }
                        .p-label { width: 80px; font-weight: normal; color: #555; }
                        .p-value { font-weight: bold; flex: 1; }
                        
                        .section-title { font-size: 14px; color: #801919; font-weight: bold; margin-bottom: 10px; margin-top: 5px; text-transform: uppercase; }
                        
                        table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                        th { background-color: #801919; color: white; padding: 10px 5px; font-size: 11px; font-weight: bold; text-align: center; border: 1px solid #601010; }
                        td { padding: 8px 5px; border: 1px solid #ddd; text-align: center; font-size: 11px; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        ${activeHeader}
                        <div class="double-line"></div>
                        
                        <div class="doc-title">DENTAL RECORD</div>
                        
                        <div class="patient-grid">
                            <div>
                                <div class="p-row"><div class="p-label">Nama</div><div class="p-value">${data.nama_pasien}</div></div>
                                <div class="p-row"><div class="p-label">Tgl Lahir</div><div class="p-value">${formatTanggalFull(data.tgl_lahir)}</div></div>
                                <div class="p-row"><div class="p-label">Alamat</div><div class="p-value">${data.alamat}</div></div>
                            </div>
                            <div>
                                <div class="p-row"><div class="p-label">Pekerjaan</div><div class="p-value">${data.pekerjaan || '-'}</div></div>
                                <div class="p-row"><div class="p-label">No. Hp</div><div class="p-value">${data.nope}</div></div>
                                <div class="p-row"><div class="p-label">Alergi Obat</div><div class="p-value">${data.alergi_obat || '-'}</div></div>
                            </div>
                        </div>

                        <div class="section-title">Riwayat Perawatan</div>

                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 60px;">Tanggal</th>
                                    <th>Layanan</th>
                                    <th>Gigi</th>
                                    <th>Keluhan/Diagnosa</th>
                                    <th>Perawatan</th>
                                    <th>Ket</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${trs.length > 0 ? trs : '<tr><td colspan="6">Data riwayat tidak ditemukan</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ 
            html: htmlContent,
            width: 624, // 16.5cm
            height: 813 // 21.5cm
        });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Ekspor Riwayat Pasien' });
    } catch (e: any) {
        showAlert({ title: 'Gagal Ekspor', message: e.message, type: 'error' });
    } finally {
        setIsExporting(false);
    }
  };

  const formatTanggalFull = (tgl: string) => {
    if (!tgl) return '-';
    const d = new Date(tgl);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
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
    <AdminLayout customRightTitle="Admin" noScroll={false}>
            <View style={PatientDetailStyles.container}>
            
            <View style={PatientDetailStyles.infoCard}>
                <View style={PatientDetailStyles.infoTitleBar}>
                    <MaterialCommunityIcons name="account-outline" size={20} color="#FFF" />
                    <Text style={PatientDetailStyles.infoTitleText}>INFORMASI PRIBADI</Text>
                </View>

                <View style={PatientDetailStyles.gridRow}>
                    <View style={PatientDetailStyles.gridCell}>
                        <Text style={PatientDetailStyles.infoLabel}>Nama Lengkap</Text>
                        <Text style={PatientDetailStyles.infoValue}>{data?.nama_pasien || '-'}</Text>
                    </View>
                    <View style={[PatientDetailStyles.gridCell, PatientDetailStyles.gridCellLast]}>
                        <Text style={PatientDetailStyles.infoLabel}>Pekerjaan</Text>
                        <Text style={PatientDetailStyles.infoValue}>{data?.pekerjaan || '-'}</Text>
                    </View>
                </View>

                <View style={PatientDetailStyles.gridRow}>
                    <View style={PatientDetailStyles.gridCell}>
                        <Text style={PatientDetailStyles.infoLabel}>Tanggal Lahir</Text>
                        <Text style={PatientDetailStyles.infoValue}>{formatTanggalFull(data?.tgl_lahir)}</Text>
                    </View>
                    <View style={[PatientDetailStyles.gridCell, PatientDetailStyles.gridCellLast]}>
                        <Text style={PatientDetailStyles.infoLabel}>Nomor Handphone</Text>
                        <Text style={PatientDetailStyles.infoValue}>{data?.nope || '-'}</Text>
                    </View>
                </View>

                <View style={PatientDetailStyles.gridRow}>
                    <View style={PatientDetailStyles.gridCell}>
                        <Text style={PatientDetailStyles.infoLabel}>Jenis Kelamin</Text>
                        <View style={[PatientDetailStyles.genderPill, data?.jk === 'Perempuan' ? PatientDetailStyles.genderPillPR : PatientDetailStyles.genderPillLK]}>
                            <Text style={[PatientDetailStyles.genderPillText, { color: data?.jk === 'Perempuan' ? '#801919' : '#194580' }]}>
                                {data?.jk || '-'}
                            </Text>
                        </View>
                    </View>
                    <View style={[PatientDetailStyles.gridCell, PatientDetailStyles.gridCellLast]}>
                        <Text style={PatientDetailStyles.infoLabel}>Alergi Obat</Text>
                        <Text style={PatientDetailStyles.infoValue}>{data?.alergi_obat || '-'}</Text>
                    </View>
                </View>

                <View style={[PatientDetailStyles.gridRow, { borderBottomWidth: 0 }]}>
                    <View style={[PatientDetailStyles.gridCell, PatientDetailStyles.gridCellLast]}>
                        <Text style={PatientDetailStyles.infoLabel}>Alamat</Text>
                        <Text style={PatientDetailStyles.infoValue}>{data?.alamat || '-'}</Text>
                    </View>
                </View>
            </View>

            
            <View style={PatientDetailStyles.historyTitleRow}>
                <Text style={PatientDetailStyles.historySectionTitle}>RIWAYAT PERAWATAN</Text>
                <View style={PatientDetailStyles.filterAndExport}>
                    <View style={PatientDetailStyles.dropdownWrapper}>
                        <DropdownInput
                            label=""
                            options={[
                                { label: 'Semua', value: '' },
                                { label: 'Umum', value: 'Umum' },
                                { label: 'Ortodental', value: 'Ortodental' }
                            ]}
                            selectedValue={filterLayanan}
                            onValueChange={(v) => setFilterLayanan(v)}
                            placeholder="Semua"
                            hideLabel={true}
                            buttonStyle={PatientDetailStyles.dropdownButton}
                        />
                    </View>
                    <TouchableOpacity 
                        style={PatientDetailStyles.btnExport}
                        onPress={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={PatientDetailStyles.btnExportText}>Export File Riwayat</Text>}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[PatientTableStyles.tableWrapper, { marginHorizontal: 0 }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    <View style={{ width: 1000 }}>
                        <View style={PatientTableStyles.tableHeader}>
                            <View style={[PatientTableStyles.thCell, { width: 100 }]}><Text style={PatientTableStyles.thText}>Tgl</Text></View>
                            <View style={[PatientTableStyles.thCell, { width: 120 }]}><Text style={PatientTableStyles.thText}>Layanan</Text></View>
                            <View style={[PatientTableStyles.thCell, { width: 80 }]}><Text style={PatientTableStyles.thText}>Gigi</Text></View>
                            <View style={[PatientTableStyles.thCell, { width: 300 }]}><Text style={PatientTableStyles.thText}>Keluhan/Diagnosa</Text></View>
                            <View style={[PatientTableStyles.thCell, { width: 180 }]}><Text style={PatientTableStyles.thText}>Perawatan</Text></View>
                            <View style={[PatientTableStyles.thCell, { width: 200, borderRightWidth: 0 }]}><Text style={PatientTableStyles.thText}>Keterangan</Text></View>
                        </View>
                        
                        <View style={PatientTableStyles.tableBody}>
                            {filteredRecords.length > 0 ? filteredRecords.map((item, index) => (
                                <View key={item.id_record || index} style={PatientTableStyles.tableRow}>
                                    <View style={[PatientTableStyles.tdCell, { width: 100 }]}><Text style={PatientTableStyles.tdText}>{formatTanggal(item.tanggal)}</Text></View>
                                    <View style={[PatientTableStyles.tdCell, { width: 120 }]}>
                                        <View style={[PatientTableStyles.badgeContainer, { backgroundColor: item.layanan === 'Umum' ? '#E9D6D6' : '#D6E0E9' }]}>
                                            <Text style={[PatientTableStyles.badgeText, { color: item.layanan === 'Umum' ? '#801919' : '#194580' }]}>{item.layanan || '-'}</Text>
                                        </View>
                                    </View>
                                    <View style={[PatientTableStyles.tdCell, { width: 80 }]}><Text style={PatientTableStyles.tdText}>{item.gigi || '-'}</Text></View>
                                    <View style={[PatientTableStyles.tdCell, { width: 300 }]}><Text style={PatientTableStyles.tdText} numberOfLines={2}>{item.diagnosa || '-'}</Text></View>
                                    <View style={[PatientTableStyles.tdCell, { width: 180 }]}>
                                        <Text style={PatientTableStyles.tdText} numberOfLines={2}>
                                            {item.id_tindakan ? item.id_tindakan.toString().split(',').map((id: string) => {
                                                const t = tindakanList.find(x => x.id_tindakan.toString() === id.trim());
                                                return t ? t.nama_tindakan : '';
                                            }).filter(Boolean).join(', ') : '-'}
                                        </Text>
                                    </View>
                                    <View style={[PatientTableStyles.tdCell, { width: 200, borderRightWidth: 0 }]}><Text style={PatientTableStyles.tdText} numberOfLines={2}>{item.keterangan || '-'}</Text></View>
                                </View>
                            )) : (
                                <View style={{ width: 1000, height: 100, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={GlobalStyles.emptyText}>Data riwayat tidak ditemukan</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    </AdminLayout>
);
}
