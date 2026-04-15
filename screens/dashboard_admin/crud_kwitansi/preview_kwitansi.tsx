import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Alert, Image, ActivityIndicator } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { GlobalStyles, LayoutStyles, Colors } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export function PreviewKwitansi() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { item } = route.params as { item: any };
  const [isExporting, setIsExporting] = React.useState(false);

  const isOrto = item.tb_rekam_medis?.layanan === 'Ortodental' || item.tujuan_pembayaran?.toLowerCase().includes('orto');

  // Helper date function Format: Cirebon, 15 April 2026
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
                margin: 15px;
              }
              body {
                margin: 0;
                padding: 0;
                background-color: #ffffff;
                width: 100%;
              }
              .receipt-container {
                background-color: white;
                padding: 30px;
                border: 2px solid #000;
                box-sizing: border-box;
              }
              .header-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 5px;
              }
              .logo-aligner {
                width: 80px;
                text-align: center;
              }
              .logo-circle {
                width: 80px;
                height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .logo-placeholder {
                font-size: 14px;
                color: #C62828;
                font-weight: bold;
                font-family: sans-serif;
                text-align: center;
              }
              .header-text-container {
                flex: 1;
                text-align: center;
                color: #000;
              }
              .title-umum {
                font-size: 24px;
                font-weight: bold;
                font-family: serif;
                margin: 0;
              }
              .doctor-name {
                font-size: 22px;
                font-weight: 900;
                margin: 5px 0;
                font-family: sans-serif;
              }
              .sip-text {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 4px;
                font-family: sans-serif;
              }
              .address-text {
                font-size: 14px;
                margin: 0;
                font-family: sans-serif;
              }
              .double-line-container {
                margin-top: 15px;
                margin-bottom: 20px;
              }
              .line-thick {
                height: 4px;
                background-color: #000;
                margin-bottom: 3px;
              }
              .line-thin {
                height: 1px;
                background-color: #000;
              }
              .receipt-title-box {
                text-align: center;
                margin: 20px 0;
              }
              .receipt-title {
                font-size: 22px;
                font-weight: bold;
                font-family: serif;
                margin: 0;
              }
              .receipt-no {
                font-size: 20px;
                font-family: serif;
                margin-top: 5px;
              }
              .info-row {
                display: flex;
                margin-bottom: 15px;
              }
              .sub-info-row {
                display: flex;
                margin-bottom: 15px;
                margin-left: 50px;
              }
              .label {
                width: 180px;
                font-size: 18px;
                font-family: serif;
                font-style: italic;
                font-weight: bold;
              }
              .sub-label {
                width: 130px;
                font-size: 18px;
                font-family: serif;
                font-style: italic;
                font-weight: bold;
              }
              .colon {
                width: 30px;
                font-size: 18px;
                font-family: serif;
                font-weight: bold;
                text-align: center;
              }
              .value {
                flex: 1;
                font-size: 18px;
                font-family: serif;
              }
              .footer {
                margin-top: 40px;
              }
              .nominal-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
              }
              .nominal-box-wrapper {
                width: 45%;
              }
              .nominal-text {
                font-size: 20px;
                font-family: serif;
                font-weight: bold;
                font-style: italic;
                margin: 8px 10px;
              }
              .admin-sign {
                text-align: right;
                width: 45%;
              }
              .date-info {
                font-size: 16px;
                font-family: serif;
                margin-bottom: 80px;
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header-container">
                <div class="logo-aligner">
                  <div class="logo-circle">
                    <img src="${logoUri}" style="width: 80px; height: 80px; border-radius: 40px; object-fit: cover; border: 3px solid #C62828;" />
                  </div>
                </div>
                <div class="header-text-container">
                  ${isOrto ? headerContentOrto : headerContentUmum}
                </div>
                <div style="width: 80px;"></div>
              </div>

              <div class="double-line-container">
                <div class="line-thick"></div>
                <div class="line-thin"></div>
              </div>

              <div class="receipt-title-box">
                <div class="receipt-title">BUKTI PEMBAYARAN</div>
                <div class="receipt-no">No: ${item.no_kwitansi || '...........................'}</div>
              </div>

              <div class="info-row">
                <div class="label">Telah terima dari</div><div class="colon">:</div><div class="value">${item.tb_pasien?.nama_pasien || ''}</div>
              </div>
              <div class="info-row">
                <div class="label">Banyaknya uang</div><div class="colon">:</div><div class="value">${Number(item.rp).toLocaleString('id-ID')} Rupiah</div>
              </div>
              <div class="info-row">
                <div class="label">Untuk Pembayaran</div><div class="colon">:</div><div class="value">${item.tujuan_pembayaran || ''}</div>
              </div>
              <div class="sub-info-row">
                <div class="sub-label">Diagnosis</div><div class="colon">:</div><div class="value">${item.tb_rekam_medis?.diagnosa || '-'}</div>
              </div>
              <div class="sub-info-row">
                <div class="sub-label">Obat</div><div class="colon">:</div><div class="value">${item.obat || '-'}</div>
              </div>

              <div class="footer">
                <div class="nominal-row">
                  <div class="nominal-box-wrapper">
                    <div class="line-thick"></div><div class="line-thin"></div>
                    <div class="nominal-text">Nominal Rp. ${Number(item.rp).toLocaleString('id-ID')},-</div>
                    <div class="line-thin"></div><div class="line-thick"></div>
                  </div>
                  <div class="admin-sign">
                    <div class="date-info">Cirebon, ${item.tgl ? formatDate(item.tgl) : '....................20..'}</div>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ 
        html: htmlContent,
        width: 794,  /* Landscape A4 width roughly, to ensure it's wide */
        height: 500  /* Custom receipt height (around half A4) */
      });
      if (uri) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Ekspor Kwitansi' });
      }
    } catch (error: any) {
      Alert.alert('Gagal Mengekspor', error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminLayout noScroll={true} customRightTitle={isOrto ? "Kwitansi Orto" : "Kwitansi Umum"}>
      <ScrollView contentContainerStyle={[LayoutStyles.scrollContent, { alignItems: 'center' }]}>
        
        {/* Kontainer Bukti Pembayaran */}
        <View style={styles.receiptContainer}>
          
          <View style={styles.headerContainer}>
            <View style={styles.logoAligner}>
                <View style={styles.logoCircle}>
                    <Image 
                        source={require('../../../assets/icon.png')} 
                        style={{ width: 80, height: 80, borderRadius: 40 }} 
                        resizeMode="contain" 
                    />
                </View>
            </View>

            <View style={styles.headerTextContainer}>
                {isOrto ? (
                    <>
                        <Text style={styles.titleUmum}>PRAKTEK DOKTER GIGI SPESIALIS</Text>
                        <Text style={styles.doctorName}>drg. INDRA RAFISUKMAWAN, Sp.Ort</Text>
                        <Text style={styles.sipText}>SIP : 500.16.7/054-DPMPTSP/SIPTM/Drgs.2/IV/2025</Text>
                        <Text style={styles.addressText}>Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</Text>
                    </>
                ) : (
                    <>
                        <Text style={styles.titleUmum}>GALERI ORTODENTAL</Text>
                        <Text style={styles.addressText}>Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</Text>
                    </>
                )}
            </View>
            <View style={{ width: 60 }} />

          </View>

          {/* Double Lines */}
          <View style={styles.doubleLineContainer}>
             <View style={styles.lineThick} />
             <View style={styles.lineThin} />
          </View>
          
          <View style={{alignItems: 'center', marginTop: 15, marginBottom: 15}}>
             <Text style={styles.receiptTitle}>BUKTI PEMBAYARAN</Text>
             <Text style={styles.receiptNo}>No: {item.no_kwitansi || '...........................'}</Text>
          </View>

          {/* Isi Kwitansi */}
          <View style={styles.body}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Telah terima dari</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.tb_pasien?.nama_pasien}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Banyaknya uang</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.rp.toLocaleString('id-ID')} Rupiah</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Untuk Pembayaran</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.tujuan_pembayaran}</Text>


            </View>
            
            <View style={styles.subInfoRow}>
              <Text style={styles.subLabel}>Diagnosis</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.tb_rekam_medis?.diagnosa || '-'}</Text>
            </View>

            <View style={styles.subInfoRow}>
              <Text style={styles.subLabel}>Obat</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.obat || '-'}</Text>

            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
             <View style={styles.nominalRow}>
                <View style={styles.nominalBoxWrapper}>
                  <View style={styles.doubleLineSmall}>
                    <View style={styles.lineThick} />
                    <View style={styles.lineThin} />
                  </View>
                  <Text style={styles.nominalText}>Nominal Rp. {item.rp.toLocaleString('id-ID')},-</Text>
                  <View style={styles.doubleLineSmall}>
                    <View style={styles.lineThin} />
                    <View style={styles.lineThick} />
                  </View>
                </View>
                
                <View style={styles.adminSign}>
                  <Text style={styles.dateInfo}>Cirebon, {item.tgl ? formatDate(item.tgl) : '....................20..'}</Text>
                  <View style={styles.signSpace} />
                </View>
             </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[LayoutStyles.rowBetween, LayoutStyles.mt20, { width: '90%' }]}>
            <TouchableOpacity 
                style={[GlobalStyles.btnBatal, { flex: 1, marginRight: 10 }]}
                onPress={() => navigation.goBack()}
            >
                <Text style={GlobalStyles.btnBatalText}>Kembali</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[GlobalStyles.btnSimpan, { flex: 1, marginLeft: 10, flexDirection: 'row', opacity: isExporting ? 0.7 : 1 }]}
                onPress={handleExport}
                disabled={isExporting}
            >
                {isExporting ? <ActivityIndicator size="small" color="white" /> : <MaterialCommunityIcons name="file-pdf-box" size={24} color="white" />}
                <Text style={[GlobalStyles.primaryButtonText, { marginLeft: 10, fontSize: 16 }]}>{isExporting ? 'Mengekstrak...' : 'Export File'}</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  receiptContainer: {
    width: '95%',
    backgroundColor: 'white',
    padding: 25,
    borderWidth: 1.5,
    borderColor: '#000',
    elevation: 3,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  logoAligner: {
      width: 60,
      justifyContent: 'center',
      alignItems: 'center'
  },
  logoCircle: {
      alignItems: 'center',
      justifyContent: 'center',
  },

  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  titleUmum: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#000',
    textAlign: 'center'
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
    marginVertical: 2,
  },
  sipText: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2
  },
  addressText: {
    fontSize: 13,
    color: '#000',
    textAlign: 'center'
  },
  doubleLineContainer: {
    marginTop: 10,
    marginBottom: 5,
  },
  lineThick: {
    height: 3,
    backgroundColor: '#000',
    marginBottom: 2,
  },
  lineThin: {
    height: 1,
    backgroundColor: '#000',
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#000',
    textAlign: 'center',
  },
  receiptNo: {
    fontSize: 18,
    fontFamily: 'serif',
    textAlign: 'center',
    marginTop: 2,
  },
  body: {
    marginTop: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  subInfoRow: {
      flexDirection: 'row',
      marginBottom: 10,
      marginLeft: 40, 
  },
  label: {
    width: 150,
    fontSize: 15,
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: '#000',
  },
  subLabel: {
    width: 110,
    fontSize: 15,
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: '#000',
  },
  colon: {
    width: 25,
    fontSize: 15,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center'
  },
  value: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'serif',
    color: '#000',
  },
  footer: {
    marginTop: 10,
  },
  dateInfo: {
    textAlign: 'right',
    fontSize: 14,
    fontFamily: 'serif',
    color: '#000',
  },
  nominalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  nominalBoxWrapper: {
      width: '45%'
  },
  doubleLineSmall: {
      marginVertical: 4
  },
  nominalText: {
    fontSize: 16,
    fontFamily: 'serif',
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#000',
    marginLeft: 5,
    marginVertical: 2
  },
  adminSign: {
    alignItems: 'flex-end',
    width: '45%',
  },
  signSpace: {
    height: 60,
  }
});
