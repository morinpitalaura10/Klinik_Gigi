import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { GlobalStyles, LayoutStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function PreviewRujukan() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { item } = route.params as { item: any };
  const [isExporting, setIsExporting] = React.useState(false);

  const isOrto = item.isOrto;

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
        <div class="doctor-name" style="font-size: 18px; letter-spacing: 2px; margin-bottom: 2px;">KLINIK GIGI</div>
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
                size: A4 portrait;
              }
              body {
                margin: 0;
                padding: 0;
                background-color: #ffffff;
                width: 100%;
              }
              .receipt-container {
                background-color: white;
                padding: 60px 50px;
                box-sizing: border-box;
                height: 100vh;
                position: relative;
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
                margin: 20px 0 30px 0;
              }
              .receipt-title {
                font-size: 22px;
                font-weight: bold;
                font-family: serif;
                margin: 0;
              }
              
              /* Rujukan Specific Styles */
              .content-body {
                  font-family: serif;
                  font-size: 15px;
                  line-height: 1.8;
              }
              .bold { font-weight: bold; }
              .mb-20 { margin-bottom: 25px; }
              .indent { display: inline-block; width: 100px; font-weight: bold; }
              
              .info-row {
                display: flex;
                margin-bottom: 15px;
              }
              .label {
                width: 150px;
                font-size: 15px;
                font-family: serif;
                font-weight: bold;
              }
              .colon {
                width: 20px;
                font-size: 15px;
                font-family: serif;
                font-weight: bold;
              }
              .value {
                flex: 1;
                font-size: 15px;
                font-family: serif;
                border-bottom: 1px dotted #888;
                position: relative;
              }
              .gender-side {
                  position: absolute;
                  right: 5px;
                  top: 0;
                  background: white;
                  padding-left: 10px;
                  font-weight: bold;
              }
              
              .footer {
                position: absolute;
                bottom: 60px;
                right: 60px;
              }
              .admin-sign {
                text-align: center;
                width: 320px;
              }
              .date-info {
                font-size: 15px;
                font-family: serif;
              }
              .sign-space {
                  height: 100px;
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header-container" style="justify-content: center; gap: 25px;">
                <div>
                   <img src="${logoUri}" style="width: 85px; height: 85px; border-radius: 42.5px; object-fit: cover; border: 3px solid #C62828;" />
                </div>
                <div class="header-text-container" style="flex: none;">
                  ${isOrto ? headerContentOrto : headerContentUmum}
                </div>
              </div>

              <div class="double-line-container">
                <div class="line-thick"></div>
                <div class="line-thin"></div>
              </div>

              <div class="receipt-title-box">
                <div class="receipt-title">SURAT RUJUKAN</div>
              </div>
              
              <div class="content-body">
                <div class="bold">Kepada Yth.</div>
                <div class="bold" style="border-bottom: 1px dotted #555; display: inline-block; min-width: 300px;">
                    ${item.ditujukan || ''}
                </div>
                <div class="mb-20 bold"><br/>Di tempat</div>
                
                <div class="mb-20 bold">Dengan ini kami rujuk pasien dengan identitas sebagai berikut :</div>
                
                <div class="info-row">
                    <div class="label">Nama</div><div class="colon">:</div>
                    <div class="value">
                        ${item.detail_pasien?.nama_pasien || ''}
                        <span class="gender-side">${item.detail_pasien?.jenis_kelamin || ''}</span>
                    </div>
                </div>
                <div class="info-row">
                    <div class="label">Umur</div><div class="colon">:</div><div class="value">${item.detail_pasien?.umur || ''}</div>
                </div>
                <div class="info-row">
                    <div class="label">Alamat</div><div class="colon">:</div><div class="value">${item.detail_pasien?.alamat || ''}</div>
                </div>
                
                <div class="mb-20 bold" style="margin-top: 30px;">Berdasarkan hasil pemeriksaan kami :</div>
                
                <div class="info-row">
                    <div class="label" style="width: 200px;">Keluhan</div><div class="colon">:</div><div class="value">${item.detail_medis?.keluhan || ''}</div>
                </div>
                <div class="info-row">
                    <div class="label" style="width: 200px;">Diagnosa Sementara</div><div class="colon">:</div><div class="value">${item.detail_medis?.diagnosa || ''}</div>
                </div>
                
                <div style="margin-top: 50px; font-weight: bold; text-align: justify;">
                    Demikian agar pasien tersebut mendapatkan perawatan kesehatan selanjutnya.<br/>Terimakasih.
                </div>
              </div>

              <div class="footer">
                  <div class="admin-sign">
                    <div class="date-info" style="text-align: right; margin-bottom: 5px;">Cirebon, ${item.tgl ? formatDate(item.tgl) : '....................20..'}</div>
                    <div class="date-info bold" style="text-align: right; margin-right: 30px;">Hormat Kami</div>
                    <div class="sign-space"></div>
                    <div class="date-info" style="text-align: right;">( .............................................................. )</div>
                  </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ 
        html: htmlContent, 
        width: 794,  // A4 Portrait Width
        height: 1123 // A4 Portrait Height
      });
      if (uri) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Ekspor Rujukan' });
      }
    } catch (error: any) {
      Alert.alert('Gagal Mengekspor', error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminLayout noScroll={true} customRightTitle="rujukan">
      <ScrollView contentContainerStyle={[LayoutStyles.scrollContent, { alignItems: 'center' }]}>
        
        {/* Kontainer Surat Rujukan UI Preview */}
        <View style={styles.receiptContainer}>
          
          <View style={[styles.headerContainer, { justifyContent: 'center' }]}>
            <Image 
                source={require('../../../assets/icon.png')} 
                style={{ width: 65, height: 65, borderRadius: 32.5, borderWidth: 2, borderColor: '#C62828', marginRight: 15 }} 
                resizeMode="contain" 
            />
            <View style={[styles.headerTextContainer, { flex: 0 }]}>
                {isOrto ? (
                    <>
                        <Text style={styles.titleUmum}>PRAKTEK DOKTER GIGI SPESIALIS</Text>
                        <Text style={styles.doctorName}>drg. INDRA RAFISUKMAWAN, Sp.Ort</Text>
                        <Text style={styles.sipText}>SIP : 500.16.7/054-DPMPTSP/SIPTM/Drgs.2/IV/2025</Text>
                        <Text style={styles.addressText}>Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</Text>
                    </>
                ) : (
                    <>
                        <Text style={[styles.doctorName, { fontSize: 13, letterSpacing: 1 }]}>KLINIK GIGI</Text>
                        <Text style={styles.titleUmumHuge}>GALERI ORTODENTAL</Text>
                        <Text style={styles.addressText}>Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</Text>
                    </>
                )}
            </View>
          </View>

          <View style={styles.doubleLineContainer}>
             <View style={styles.lineThick} />
             <View style={styles.lineThin} />
          </View>
          
          <View style={{alignItems: 'center', marginTop: 15, marginBottom: 25}}>
             <Text style={styles.receiptTitle}>SURAT RUJUKAN</Text>
          </View>

          {/* Isi Rujukan */}
          <View style={styles.body}>
            <Text style={styles.boldText}>Kepada Yth.</Text>
            <View style={styles.dotLineUnder}><Text style={styles.boldText}>{item.ditujukan}</Text></View>
            <Text style={[styles.boldText, { marginBottom: 20 }]}>Di tempat</Text>
            
            <Text style={[styles.boldText, { marginBottom: 15 }]}>Dengan ini kami rujuk pasien dengan identitas sebagai berikut :</Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Nama</Text>
              <Text style={styles.colon}>:</Text>
              <View style={styles.valueRowWrapper}>
                <Text style={styles.value}>{item.detail_pasien?.nama_pasien}</Text>
                <Text style={styles.genderTextRight}>{item.detail_pasien?.jenis_kelamin}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Umur</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.detail_pasien?.umur}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Alamat</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.detail_pasien?.alamat}</Text> 
            </View>
            
            <Text style={[styles.boldText, { marginTop: 20, marginBottom: 15 }]}>Berdasarkan hasil pemeriksaan kami :</Text>

            <View style={styles.infoRow}>
              <Text style={styles.subLabel}>Keluhan</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.detail_medis?.keluhan || '-'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.subLabel}>Diagnosa Sementara</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{item.detail_medis?.diagnosa || '-'}</Text>
            </View>

            <Text style={[styles.boldText, { marginTop: 30, textAlign: 'justify', lineHeight: 22 }]}>
                Demikian agar pasien tersebut mendapatkan perawatan kesehatan selanjutnya. Terimakasih.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
             <View style={styles.adminSign}>
                <Text style={styles.dateInfo}>Cirebon, {item.tgl ? formatDate(item.tgl) : '....................20..'}</Text>
                <Text style={styles.dateInfoBold}>Hormat Kami</Text>
                <View style={styles.signSpace} />
                <Text style={styles.dateInfo}>( .................................... )</Text>
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
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  titleUmumHuge: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4
  },
  titleUmum: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#000',
    textAlign: 'center'
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
    marginVertical: 2,
  },
  sipText: {
    fontSize: 11,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2
  },
  addressText: {
    fontSize: 12,
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
  body: {
    marginTop: 5,
  },
  boldText: {
      fontFamily: 'serif',
      fontWeight: 'bold',
      fontSize: 14,
      color: '#000',
  },
  dotLineUnder: {
      borderBottomWidth: 1,
      borderBottomColor: '#aaa',
      alignSelf: 'flex-start',
      minWidth: 200,
      marginBottom: 5
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    width: 60,
    fontSize: 14,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#000',
  },
  subLabel: {
    width: 150,
    fontSize: 14,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#000',
  },
  colon: {
    width: 20,
    fontSize: 14,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center'
  },
  valueRowWrapper: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: '#ccc'
  },
  value: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'serif',
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  genderTextRight: {
      fontFamily: 'serif',
      fontWeight: 'bold',
      fontSize: 14,
      marginLeft: 10,
  },
  footer: {
    marginTop: 40,
    alignItems: 'flex-end'
  },
  dateInfo: {
    textAlign: 'right',
    fontSize: 14,
    fontFamily: 'serif',
    color: '#000',
  },
  dateInfoBold: {
      textAlign: 'right',
      fontSize: 14,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#000',
      marginRight: 20,
      marginTop: 2
  },
  adminSign: {
    alignItems: 'flex-end',
    width: 250,
  },
  signSpace: {
    height: 70,
  }
});
