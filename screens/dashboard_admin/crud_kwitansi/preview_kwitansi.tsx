import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { GlobalStyles, LayoutStyles, Colors } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function PreviewKwitansi() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { item } = route.params as { item: any };
  const [isExporting, setIsExporting] = React.useState(false);

  const todayStr = new Date().toLocaleDateString('en-CA');
  const [selectedDate] = React.useState<string>(item.tgl || todayStr);

  const isOrto = item.tb_rekam_medis?.layanan === 'Ortodental' || item.tujuan_pembayaran?.toLowerCase().includes('orto');

  const terbilang = (n: number): string => {
    const words = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    if (n < 12) return words[n];
    if (n < 20) return terbilang(n - 10) + " Belas";
    if (n < 100) return terbilang(Math.floor(n / 10)) + " Puluh " + terbilang(n % 10);
    if (n < 200) return "Seratus " + terbilang(n - 100);
    if (n < 1000) return terbilang(Math.floor(n / 100)) + " Ratus " + terbilang(n % 100);
    if (n < 2000) return "Seribu " + terbilang(n - 1000);
    if (n < 1000000) return terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
    if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);
    if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + " Miliar " + terbilang(n % 1000000000);
    return "";
  };

  const getTerbilang = (num: number) => {
    if (isNaN(num) || num === 0) return "-";
    return (terbilang(num) + " Rupiah").replace(/\s+/g, ' ').trim();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const headerContentOrto = `
        <div class="title-umum">PRAKTEK DOKTER GIGI SPESIALIS</div>
        <div class="doctor-name">drg. INDRA RAFISUKMAWAN, Sp.Ort</div>
        <div class="sip-text">SIP : 500.16.7/054-DPMPTSP/SIPTM/Drgs.2/IV/2025</div>
        <div class="address-text">Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</div>
      `;

      const headerContentUmum = `
        <div class="title-umum" style="font-size: 28px; margin-bottom: 5px;">GALERI ORTODENTAL</div>
        <div class="address-text">Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</div>
      `;

      const logoUri = Image.resolveAssetSource(require('../../../assets/icon.png')).uri;

      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              @page { 
                margin: 0; 
                size: 21cm 11cm; 
              }
              body { 
                margin: 0; 
                padding: 0; 
                background-color: #ffffff; 
                width: 21cm; 
                height: 11cm;
              }
              .receipt-container { 
                background-color: white; 
                padding: 20px 35px; 
                border: 2px solid #000; 
                box-sizing: border-box;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
            <style>
              @page { 
                margin: 0; 
                size: 21cm 11cm; 
              }
              body { 
                margin: 0; 
                padding: 0; 
                background-color: #ffffff; 
                width: 21cm; 
                height: 11cm;
              }
              .receipt-container { 
                background-color: white; 
                padding: 15px 25px; 
                border: 2px solid #000; 
                box-sizing: border-box;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
              }
              .header-container { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
              .logo-aligner { width: 70px; text-align: center; }
              .logo-circle { width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; }
              .header-text-container { flex: 1; text-align: center; color: #000; }
              .title-umum { font-size: 19px; font-weight: bold; font-family: serif; margin: 0; }
              .doctor-name { font-size: 17px; font-weight: 900; margin: 1px 0; font-family: sans-serif; }
              .sip-text { font-size: 11px; font-weight: bold; margin-bottom: 1px; font-family: sans-serif; }
              .address-text { font-size: 11px; margin: 0; font-family: sans-serif; }
              .double-line-container { margin-top: 5px; margin-bottom: 8px; }
              .line-thick { height: 3px; background-color: #000; margin-bottom: 2px; }
              .line-thin { height: 1px; background-color: #000; }
              .receipt-title-box { text-align: center; margin-bottom: 10px; display: flex; flex-direction: row; justify-content: center; align-items: baseline; gap: 30px; }
              .receipt-title { font-size: 18px; font-weight: bold; font-family: serif; text-decoration: underline; margin: 0; }
              .receipt-no { font-size: 16px; font-family: serif; margin: 0; }
              .info-section { flex: 1; display: flex; flex-direction: column; gap: 8px; margin-top: 5px; }
              .info-row { display: flex; align-items: flex-start; }
              .label { width: 150px; font-size: 15px; font-family: serif; font-style: italic; font-weight: bold; }
              .colon { width: 20px; font-size: 15px; font-family: serif; font-weight: bold; text-align: center; }
              .value { flex: 1; font-size: 15px; font-family: serif; min-height: 20px; line-height: 1.3; }
              .footer { margin-top: 10px; }
              .nominal-row { display: flex; justify-content: space-between; align-items: flex-end; }
              .nominal-box-wrapper { width: 45%; }
              .nominal-text { font-size: 18px; font-family: serif; font-weight: bold; font-style: italic; margin: 5px 10px; }
              .admin-sign { text-align: center; width: 35%; padding-bottom: 5px; }
              .date-info { font-size: 14px; font-family: serif; margin-bottom: 50px; }
              .sign-name { font-size: 14px; font-family: serif; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header-container">
                <div class="logo-aligner">
                  <div class="logo-circle">
                    <img src="${logoUri}" style="width: 60px; height: 60px; border-radius: 30px; object-fit: cover; border: 2px solid #C62828;" />
                  </div>
                </div>
                <div class="header-text-container">
                  ${isOrto ? headerContentOrto : headerContentUmum}
                </div>
                <div style="width: 70px;"></div>
              </div>
    
              <div class="double-line-container">
                <div class="line-thick"></div>
                <div class="line-thin"></div>
              </div>
    
              <div class="receipt-title-box">
                <div class="receipt-title">BUKTI PEMBAYARAN</div>
                <div class="receipt-no">No: ${item.no_kwitansi || '...........................'}</div>
              </div>
    
              <div class="info-section">
                <div class="info-row">
                  <div class="label">Telah terima dari</div><div class="colon">:</div><div class="value">${item.tb_pasien?.nama_pasien || ''}</div>
                </div>
                <div class="info-row">
                  <div class="label">Banyaknya uang</div><div class="colon">:</div><div class="value">${getTerbilang(Number(item.rp))}</div>
                </div>
                <div class="info-row">
                  <div class="label">Untuk Pembayaran</div><div class="colon">:</div><div class="value">${item.tujuan_pembayaran || ''}</div>
                </div>
                <div class="info-row">
                  <div class="label">Diagnosis</div><div class="colon">:</div><div class="value">${item.tb_rekam_medis?.diagnosa || '-'}</div>
                </div>
                <div class="info-row">
                  <div class="label">Obat</div><div class="colon">:</div><div class="value">${item.obat || '-'}</div>
                </div>
              </div>
    
              <div class="footer">
                <div class="nominal-row">
                  <div class="nominal-box-wrapper">
                    <div class="line-thick"></div><div class="line-thin"></div>
                    <div class="nominal-text">Nominal Rp. ${Number(item.rp).toLocaleString('id-ID')},-</div>
                    <div class="line-thin"></div><div class="line-thick"></div>
                  </div>
                  <div class="admin-sign">
                    <div class="date-info">Cirebon, ${formatDate(selectedDate)}</div>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ 
        html: htmlContent, 
        width: 794, // 21cm @ 96dpi
        height: 415 // 11cm @ 96dpi
      });
      if (uri) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Ekspor Kwitansi' });
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Gagal Mengekspor', error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminLayout noScroll={true} customRightTitle={isOrto ? "Kwitansi Orto" : "Kwitansi Umum"}>
      <ScrollView contentContainerStyle={[LayoutStyles.scrollContent, LayoutStyles.alignCenter]}>

        
        <View style={GlobalStyles.receiptContainer}>
          <View style={GlobalStyles.receiptHeaderContainer}>
            <View style={GlobalStyles.receiptLogoAligner}>
              <View style={GlobalStyles.receiptLogoCircle}>
                <Image source={require('../../../assets/icon.png')} style={LayoutStyles.flex1} resizeMode="contain" />
              </View>
            </View>
            <View style={GlobalStyles.receiptHeaderTextContainer}>
              {isOrto ? (
                <>
                  <Text style={GlobalStyles.receiptTitleUmum}>PRAKTEK DOKTER GIGI SPESIALIS</Text>
                  <Text style={GlobalStyles.receiptDoctorName}>drg. INDRA RAFISUKMAWAN, Sp.Ort</Text>
                  <Text style={GlobalStyles.receiptSipText}>SIP : 500.16.7/054-DPMPTSP/SIPTM/Drgs.2/IV/2025</Text>
                  <Text style={GlobalStyles.receiptAddressText}>Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</Text>
                </>
              ) : (
                <>
                  <Text style={GlobalStyles.receiptTitleUmum}>GALERI ORTODENTAL</Text>
                  <Text style={GlobalStyles.receiptAddressText}>Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</Text>
                </>
              )}
            </View>
            <View style={LayoutStyles.w90} />
          </View>

          <View style={GlobalStyles.receiptDoubleLineContainer}>
            <View style={GlobalStyles.receiptLineThick} />
            <View style={GlobalStyles.receiptLineThin} />
          </View>

          <View style={[LayoutStyles.alignCenter, LayoutStyles.mt20, LayoutStyles.mb20]}>
            <Text style={GlobalStyles.receiptTitle}>BUKTI PEMBAYARAN</Text>
            <Text style={GlobalStyles.receiptNo}>No: {item.no_kwitansi || '...........................'}</Text>
          </View>

          <View style={LayoutStyles.mt20}>
            <View style={GlobalStyles.receiptInfoRow}>
              <Text style={GlobalStyles.receiptLabel}>Telah terima dari</Text>
              <Text style={GlobalStyles.receiptColon}>:</Text>
              <Text style={GlobalStyles.receiptValue}>{item.tb_pasien?.nama_pasien}</Text>
            </View>
            <View style={GlobalStyles.receiptInfoRow}>
              <Text style={GlobalStyles.receiptLabel}>Banyaknya uang</Text>
              <Text style={GlobalStyles.receiptColon}>:</Text>
              <Text style={GlobalStyles.receiptValue}>{getTerbilang(item.rp)}</Text>
            </View>
            <View style={GlobalStyles.receiptInfoRow}>
              <Text style={GlobalStyles.receiptLabel}>Untuk Pembayaran</Text>
              <Text style={GlobalStyles.receiptColon}>:</Text>
              <Text style={GlobalStyles.receiptValue}>{item.tujuan_pembayaran}</Text>
            </View>
            <View style={GlobalStyles.receiptSubInfoRow}>
              <Text style={GlobalStyles.receiptSubLabel}>Diagnosis</Text>
              <Text style={GlobalStyles.receiptColon}>:</Text>
              <Text style={GlobalStyles.receiptValue}>{item.tb_rekam_medis?.diagnosa || '-'}</Text>
            </View>
            <View style={GlobalStyles.receiptSubInfoRow}>
              <Text style={GlobalStyles.receiptSubLabel}>Obat</Text>
              <Text style={GlobalStyles.receiptColon}>:</Text>
              <Text style={GlobalStyles.receiptValue}>{item.obat || '-'}</Text>
            </View>
          </View>

          <View style={GlobalStyles.receiptFooter}>
            <View style={GlobalStyles.receiptNominalRow}>
              <View style={GlobalStyles.receiptNominalBoxWrapper}>
                <View style={GlobalStyles.receiptDoubleLineSmall}>
                  <View style={GlobalStyles.receiptLineThick} />
                  <View style={GlobalStyles.receiptLineThin} />
                </View>
                <Text style={GlobalStyles.receiptNominalText}>Nominal Rp. {item.rp.toLocaleString('id-ID')},-</Text>
                <View style={GlobalStyles.receiptDoubleLineSmall}>
                  <View style={GlobalStyles.receiptLineThin} />
                  <View style={GlobalStyles.receiptLineThick} />
                </View>
              </View>
              <View style={GlobalStyles.receiptAdminSign}>
                <Text style={GlobalStyles.receiptDateInfo}>Cirebon, {formatDate(selectedDate)}</Text>
                <View style={GlobalStyles.receiptSignSpace} />
              </View>
            </View>
          </View>
        </View>

        
        <View style={[LayoutStyles.rowBetween, LayoutStyles.mt20, { width: '90%' }]}>
          <TouchableOpacity style={[GlobalStyles.btnBatal, LayoutStyles.flex1, LayoutStyles.mr10]} onPress={() => navigation.goBack()}>
            <Text style={GlobalStyles.btnBatalText}>Kembali</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[GlobalStyles.btnSimpan, LayoutStyles.flex1, LayoutStyles.ml10, LayoutStyles.flexRow, { opacity: isExporting ? 0.7 : 1 }]}
            onPress={handleExport}
            disabled={isExporting}
          >
            {isExporting ? <ActivityIndicator size="small" color="white" /> : <MaterialCommunityIcons name="file-pdf-box" size={24} color="white" />}
            <Text style={[GlobalStyles.primaryButtonText, LayoutStyles.ml10, { fontSize: 16 }]}>{isExporting ? 'Mengekstrak...' : 'Export File'}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </AdminLayout>
  );
}
