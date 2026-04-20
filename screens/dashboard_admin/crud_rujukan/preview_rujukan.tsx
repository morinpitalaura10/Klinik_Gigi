import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { GlobalStyles, LayoutStyles, Colors } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function PreviewRujukan() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { item } = route.params as { item: any };
  const [isExporting, setIsExporting] = React.useState(false);

  const isOrto = item.isOrto;


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const logoUri = Image.resolveAssetSource(require('../../../assets/icon.png')).uri;

      const headerContent = `
        <div class="title-umum">PRAKTEK DOKTER GIGI SPESIALIS</div>
        <div class="doctor-name">drg. INDRA RAFISUKMAWAN, Sp.Ort</div>
        <div class="sip-text">SIP : 500.16.7/054-DPMPTSP/SIPTM/Drgs.2/IV/2025</div>
        <div class="address-text">Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</div>
      `;

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
                font-family: 'Times New Roman', serif;
                margin: 0;
              }
              .doctor-name {
                font-size: 22px;
                font-weight: 900;
                margin: 5px 0;
                font-family: 'Times New Roman', serif;
              }
              .sip-text {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 4px;
                font-family: 'Times New Roman', serif;
              }
              .address-text {
                font-size: 14px;
                margin: 0;
                font-family: 'Times New Roman', serif;
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
              
              
              .content-body {
                  font-family: 'Times New Roman', serif;
                  font-size: 14px;
                  line-height: 1.7;
              }
              .bold { font-weight: bold; }
              .mb-20 { margin-bottom: 20px; }
              .indent { display: inline-block; width: 100px; font-weight: bold; }
              
              .info-row {
                display: flex;
                margin-bottom: 10px;
              }
              .label {
                width: 150px;
                font-size: 14px;
                font-family: 'Times New Roman', serif;
                font-weight: normal;
              }
              .colon {
                width: 20px;
                font-size: 14px;
                font-family: 'Times New Roman', serif;
                font-weight: normal;
              }
              .value {
                flex: 1;
                font-size: 14px;
                font-family: 'Times New Roman', serif;
                font-weight: bold;
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
                font-family: 'Times New Roman', serif;
              }
              .sign-space {
                  height: 70px;
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header-container" style="justify-content: flex-start; align-items: center; gap: 20px;">
                <div>
                   <img src="${logoUri}" style="width: 110px; height: 110px; border-radius: 55px; object-fit: cover; border: 3px solid #C62828;" />
                </div>
                <div class="header-text-container" style="flex: 1; text-align: center;">
                  ${headerContent}
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
                <div>Kepada Yth.</div>
                <div class="bold">${item.ditujukan || ''}</div>
                <div>Di tempat</div>
                <br/>
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
                    <div class="label">Keluhan</div><div class="colon">:</div><div class="value">${item.detail_medis?.keluhan_rujukan || ''}</div>
                </div>
                <div class="info-row">
                    <div class="label">Diagnosa Sementara</div><div class="colon">:</div><div class="value">${item.detail_medis?.diagnosa || ''}</div>
                </div>
                
                <div style="margin-top: 50px; font-weight: bold; text-align: justify;">
                    Demikian agar pasien tersebut mendapatkan perawatan kesehatan selanjutnya.<br/>Terimakasih.
                </div>
              </div>

              <div class="footer">
                  <div class="admin-sign">
                    <div class="date-info" style="text-align: center; margin-bottom: 5px;">Cirebon, ${item.tgl ? formatDate(item.tgl) : '....................20..'}</div>
                    <div class="date-info bold" style="text-align: center;">Hormat Kami</div>
                    <div class="sign-space"></div>
                    <div class="date-info bold" style="text-align: center;">${item.penandatangan || item.user_klinik || ''}</div>
                  </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        width: 794,
        height: 1123
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
      <ScrollView contentContainerStyle={[LayoutStyles.scrollContent, LayoutStyles.alignCenter]}>

        
        <View style={GlobalStyles.receiptContainer}>

          <View style={[GlobalStyles.receiptHeaderContainer, { justifyContent: 'flex-start', alignItems: 'center' }]}>
            <Image
              source={require('../../../assets/icon.png')}
              style={{ width: 110, height: 110, borderRadius: 55, marginRight: 15, borderWidth: 2, borderColor: '#C62828' }}
              resizeMode="cover"
            />
            <View style={[GlobalStyles.receiptHeaderTextContainer, { flex: 1, alignItems: 'center' }]}>
              <Text style={[GlobalStyles.receiptTitleUmum, { fontFamily: 'serif' }]}>PRAKTEK DOKTER GIGI SPESIALIS</Text>
              <Text style={[GlobalStyles.receiptDoctorName, { fontFamily: 'serif' }]}>drg. INDRA RAFISUKMAWAN, Sp.Ort</Text>
              <Text style={[GlobalStyles.receiptSipText, { fontFamily: 'serif' }]}>SIP : 500.16.7/054-DPMPTSP/SIPTM/Drgs.2/IV/2025</Text>
              <Text style={[GlobalStyles.receiptAddressText, { fontFamily: 'serif' }]}>Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</Text>
            </View>
          </View>

          <View style={[GlobalStyles.receiptDoubleLineContainer, LayoutStyles.mt10, LayoutStyles.mb5]}>
            <View style={GlobalStyles.receiptLineThick} />
            <View style={GlobalStyles.receiptLineThin} />
          </View>

          <View style={[LayoutStyles.alignCenter, LayoutStyles.mt15, LayoutStyles.mb25]}>
            <Text style={GlobalStyles.receiptTitle}>SURAT RUJUKAN</Text>
          </View>

          
          <View style={LayoutStyles.mt10}>
            <Text style={{ fontFamily: 'serif', fontSize: 14, color: Colors.black }}>Kepada Yth.</Text>
            <Text style={[GlobalStyles.rujukanBoldText, { fontFamily: 'serif' }]}>{item.ditujukan || ''}</Text>
            <Text style={{ fontFamily: 'serif', fontSize: 14, color: Colors.black }}>Di tempat</Text>
            <View style={{ height: 12 }} />
            <Text style={[GlobalStyles.rujukanBoldText, LayoutStyles.mb15, { fontFamily: 'serif' }]}>Dengan ini kami rujuk pasien dengan identitas sebagai berikut :</Text>

            <View style={GlobalStyles.receiptInfoRow}>
              <Text style={{ width: 150, fontSize: 14, fontFamily: 'serif' }}>Nama</Text>
              <Text style={[GlobalStyles.receiptColon, { fontFamily: 'serif' }]}>:</Text>
              <View style={GlobalStyles.rujukanValueRowWrapper}>
                <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 14, fontFamily: 'serif' }}>{item.detail_pasien?.nama_pasien}</Text>
                <Text style={[GlobalStyles.rujukanGenderTextRight, { fontWeight: 'bold', fontFamily: 'serif' }]}>{item.detail_pasien?.jenis_kelamin}</Text>
              </View>
            </View>

            <View style={GlobalStyles.receiptInfoRow}>
              <Text style={{ width: 150, fontSize: 14, fontFamily: 'serif' }}>Umur</Text>
              <Text style={[GlobalStyles.receiptColon, { fontFamily: 'serif' }]}>:</Text>
              <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 14, fontFamily: 'serif' }}>{item.detail_pasien?.umur}</Text>
            </View>

            <View style={GlobalStyles.receiptInfoRow}>
              <Text style={{ width: 150, fontSize: 14, fontFamily: 'serif' }}>Alamat</Text>
              <Text style={[GlobalStyles.receiptColon, { fontFamily: 'serif' }]}>:</Text>
              <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 14, fontFamily: 'serif' }}>{item.detail_pasien?.alamat}</Text>
            </View>

            <Text style={[GlobalStyles.rujukanBoldText, LayoutStyles.mt20, LayoutStyles.mb15, { fontFamily: 'serif' }]}>Berdasarkan hasil pemeriksaan kami :</Text>

            <View style={GlobalStyles.receiptInfoRow}>
              <Text style={{ width: 150, fontSize: 14, fontFamily: 'serif' }}>Keluhan</Text>
              <Text style={[GlobalStyles.receiptColon, { fontFamily: 'serif' }]}>:</Text>
              <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 14, fontFamily: 'serif' }}>{item.detail_medis?.keluhan_rujukan || '-'}</Text>
            </View>

            <View style={GlobalStyles.receiptInfoRow}>
              <Text style={{ width: 150, fontSize: 14, fontFamily: 'serif' }}>Diagnosa Sementara</Text>
              <Text style={[GlobalStyles.receiptColon, { fontFamily: 'serif' }]}>:</Text>
              <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 14, fontFamily: 'serif' }}>{item.detail_medis?.diagnosa || '-'}</Text>
            </View>

            <Text style={[GlobalStyles.rujukanBoldText, LayoutStyles.mt30, LayoutStyles.textJustify, LayoutStyles.lineHeight22]}>
              Demikian agar pasien tersebut mendapatkan perawatan kesehatan selanjutnya. Terimakasih.
            </Text>
          </View>

          
          <View style={[LayoutStyles.mt20, LayoutStyles.justifyEnd, LayoutStyles.flexRow]}>
            <View style={GlobalStyles.rujukanAdminSign}>
              <Text style={GlobalStyles.receiptDateInfo}>Cirebon, {item.tgl ? formatDate(item.tgl) : '....................20..'}</Text>
              <Text style={GlobalStyles.rujukanDateInfoBold}>Hormat Kami</Text>
              <View style={GlobalStyles.receiptSignSpace} />
              <Text style={[GlobalStyles.receiptDateInfo, { fontWeight: 'bold', textAlign: 'center' }]}>{item.penandatangan || item.user_klinik || ''}</Text>
            </View>
          </View>
        </View>

        
        <View style={[LayoutStyles.rowBetween, LayoutStyles.mt20, { width: '90%' }]}>
          <TouchableOpacity
            style={[GlobalStyles.btnBatal, LayoutStyles.flex1, LayoutStyles.mr10]}
            onPress={() => navigation.goBack()}
          >
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
