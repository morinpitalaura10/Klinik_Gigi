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
                size: 15cm 21cm; 
              }
              body {
                margin: 0;
                padding: 0.1cm;
                background-color: #ffffff;
                width: 15cm;
                height: 21cm;
                box-sizing: border-box;
                overflow: hidden;
              }
              .receipt-container {
                background-color: white;
                padding: 0.3cm 2cm 0.5cm 2cm;
                border: 1.5px solid #000;
                box-sizing: border-box;
                width: 100%;
                height: calc(21cm - 0.3cm);
                display: flex;
                flex-direction: column;
              }
              .header-container {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 2px;
              }
              .header-text-container {
                flex: 1;
                text-align: center;
                color: #000;
              }
              .title-umum {
                font-size: 18px;
                font-weight: bold;
                font-family: 'Times New Roman', serif;
                margin: 0;
              }
              .doctor-name {
                font-size: 16px;
                font-weight: 900;
                margin: 2px 0;
                font-family: 'Times New Roman', serif;
              }
              .sip-text {
                font-size: 11px;
                font-weight: bold;
                margin-bottom: 2px;
                font-family: 'Times New Roman', serif;
              }
              .address-text {
                font-size: 11px;
                margin: 0;
                font-family: 'Times New Roman', serif;
              }
              .double-line-container {
                margin-top: 5px;
                margin-bottom: 10px;
              }
              .line-thick {
                height: 3px;
                background-color: #000;
                margin-bottom: 2px;
              }
              .line-thin {
                height: 1px;
                background-color: #000;
              }
              .receipt-title-box {
                text-align: center;
                margin-bottom: 20px;
              }
              .receipt-title {
                font-size: 20px;
                font-weight: bold;
                font-family: serif;
                text-decoration: underline;
                margin: 0;
              }
              
              .content-body {
                  font-family: 'Times New Roman', serif;
                  font-size: 14px;
                  line-height: 1.6;
                  flex: 1;
              }
              .bold { font-weight: bold; }
              .mb-15 { margin-bottom: 15px; }
              
              .info-row {
                display: flex;
                margin-bottom: 8px;
                align-items: flex-start;
              }
              .label {
                width: 120px;
              }
              .colon {
                width: 20px;
                text-align: center;
              }
              .value {
                flex: 1;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: baseline;
              }
              .gender-text {
                  font-weight: bold;
                  margin-right: 20px;
              }
              
              .footer {
                margin-top: 20px;
              }
              .admin-sign {
                text-align: center;
                width: 200px;
                margin-left: auto;
              }
              .date-info {
                font-size: 14px;
                font-family: 'Times New Roman', serif;
              }
              .sign-space {
                  height: 60px;
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header-container">
                <div>
                   <img src="${logoUri}" style="width: 70px; height: 70px; border-radius: 35px; object-fit: cover; border: 2px solid #C62828;" />
                </div>
                <div class="header-text-container">
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
                <div class="mb-15">Di tempat</div>
                
                <div class="mb-15 bold">Dengan ini kami rujuk pasien dengan identitas sebagai berikut :</div>
                
                <div class="info-row">
                    <div class="label">Nama</div><div class="colon">:</div>
                    <div class="value">
                        <span>${item.detail_pasien?.nama_pasien || ''}</span>
                        <span class="gender-text">${item.detail_pasien?.jenis_kelamin || ''}</span>
                    </div>
                </div>
                <div class="info-row">
                    <div class="label">Umur</div><div class="colon">:</div><div class="value">${item.detail_pasien?.umur || ''}</div>
                </div>
                <div class="info-row">
                    <div class="label">Alamat</div><div class="colon">:</div><div class="value">${item.detail_pasien?.alamat || ''}</div>
                </div>
                
                <div class="bold" style="margin-top: 20px; margin-bottom: 10px;">Berdasarkan hasil pemeriksaan kami :</div>
                
                <div class="info-row">
                    <div class="label">Keluhan</div><div class="colon">:</div><div class="value">${item.detail_medis?.keluhan_rujukan || ''}</div>
                </div>
                <div class="info-row">
                    <div class="label">Diagnosa Sementara</div><div class="colon">:</div><div class="value">${item.detail_medis?.diagnosa || ''}</div>
                </div>
                
                <div style="margin-top: 30px; font-weight: bold; text-align: justify;">
                    Demikian agar pasien tersebut mendapatkan perawatan kesehatan selanjutnya.<br/>Terimakasih.
                </div>
              </div>
    
              <div class="footer">
                  <div class="admin-sign">
                    <div class="date-info" style="margin-bottom: 5px;">Cirebon, ${item.tgl ? formatDate(item.tgl) : ''}</div>
                    <div class="date-info bold">Hormat Kami</div>
                    <div class="sign-space"></div>
                    <div class="date-info bold">${item.penandatangan || item.user_klinik || ''}</div>
                  </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        width: 567,  /* 15cm @ 96 DPI */
        height: 794  /* 21cm @ 96 DPI */
      });
      if (uri) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Ekspor Rujukan' });
        navigation.popToTop();
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


        <View style={[GlobalStyles.receiptContainer, GlobalStyles.rujukanContainer]}>

          <View style={[GlobalStyles.receiptHeaderContainer, GlobalStyles.flexRowAlignCenter]}>
            <Image
              source={require('../../../assets/icon.png')}
              style={GlobalStyles.logoCircleLarge}
              resizeMode="cover"
            />
            <View style={[GlobalStyles.receiptHeaderTextContainer, LayoutStyles.flex1, GlobalStyles.alignCenter]}>
              <Text style={[GlobalStyles.receiptTitleUmum, GlobalStyles.fontSerif]}>PRAKTEK DOKTER GIGI SPESIALIS</Text>
              <Text style={[GlobalStyles.receiptDoctorName, GlobalStyles.fontSerif]}>drg. INDRA RAFISUKMAWAN, Sp.Ort</Text>
              <Text style={[GlobalStyles.receiptSipText, GlobalStyles.fontSerif]}>SIP : 500.16.7/054-DPMPTSP/SIPTM/Drgs.2/IV/2025</Text>
              <Text style={[GlobalStyles.receiptAddressText, GlobalStyles.fontSerif]}>Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</Text>
            </View>
          </View>

          <View style={[GlobalStyles.receiptDoubleLineContainer, LayoutStyles.mt5, LayoutStyles.mb5]}>
            <View style={GlobalStyles.receiptLineThick} />
            <View style={GlobalStyles.receiptLineThin} />
          </View>

          <View style={[LayoutStyles.alignCenter, LayoutStyles.mt10, LayoutStyles.mb15]}>
            <Text style={GlobalStyles.receiptTitle}>SURAT RUJUKAN</Text>
          </View>


          <View style={LayoutStyles.mt10}>
            <Text style={[GlobalStyles.fontSerif, GlobalStyles.fontSize14, GlobalStyles.inputBlack]}>Kepada Yth.</Text>
            <Text style={[GlobalStyles.rujukanBoldText, GlobalStyles.fontSerif]}>{item.ditujukan || ''}</Text>
            <Text style={[GlobalStyles.fontSerif, GlobalStyles.fontSize14, GlobalStyles.inputBlack]}>Di tempat</Text>
            <View style={LayoutStyles.mb10} />
            <Text style={[GlobalStyles.rujukanBoldText, LayoutStyles.mb15, GlobalStyles.fontSerif]}>Dengan ini kami rujuk pasien dengan identitas sebagai berikut :</Text>

            <View style={GlobalStyles.receiptInfoRow}>
              <Text style={[LayoutStyles.w150, GlobalStyles.fontSize14, GlobalStyles.fontSerif]}>Nama</Text>
              <Text style={[GlobalStyles.receiptColon, GlobalStyles.fontSerif]}>:</Text>
              <View style={[LayoutStyles.flex1, LayoutStyles.flexRow, LayoutStyles.alignCenter]}>
                <Text style={[LayoutStyles.flex1, LayoutStyles.textBold, GlobalStyles.fontSize14, GlobalStyles.fontSerif]}>{item.detail_pasien?.nama_pasien}</Text>
                <Text style={[GlobalStyles.rujukanGenderTextRight, LayoutStyles.textBold, GlobalStyles.fontSerif]}>{item.detail_pasien?.jenis_kelamin}</Text>
              </View>
            </View>

            <View style={GlobalStyles.receiptInfoRow}>
              <Text style={[LayoutStyles.w150, GlobalStyles.fontSize14, GlobalStyles.fontSerif]}>Umur</Text>
              <Text style={[GlobalStyles.receiptColon, GlobalStyles.fontSerif]}>:</Text>
              <Text style={[LayoutStyles.flex1, LayoutStyles.textBold, GlobalStyles.fontSize14, GlobalStyles.fontSerif]}>{item.detail_pasien?.umur}</Text>
            </View>

            <View style={GlobalStyles.receiptInfoRow}>
              <Text style={[LayoutStyles.w150, GlobalStyles.fontSize14, GlobalStyles.fontSerif]}>Alamat</Text>
              <Text style={[GlobalStyles.receiptColon, GlobalStyles.fontSerif]}>:</Text>
              <Text style={[LayoutStyles.flex1, LayoutStyles.textBold, GlobalStyles.fontSize14, GlobalStyles.fontSerif]}>{item.detail_pasien?.alamat}</Text>
            </View>

            <Text style={[GlobalStyles.rujukanBoldText, LayoutStyles.mt20, LayoutStyles.mb15, GlobalStyles.fontSerif]}>Berdasarkan hasil pemeriksaan kami :</Text>

            <View style={GlobalStyles.receiptInfoRow}>
              <Text style={[LayoutStyles.w150, GlobalStyles.fontSize14, GlobalStyles.fontSerif]}>Keluhan</Text>
              <Text style={[GlobalStyles.receiptColon, GlobalStyles.fontSerif]}>:</Text>
              <Text style={[LayoutStyles.flex1, LayoutStyles.textBold, GlobalStyles.fontSize14, GlobalStyles.fontSerif]}>{item.detail_medis?.keluhan_rujukan || '-'}</Text>
            </View>

            <View style={GlobalStyles.receiptInfoRow}>
              <Text style={[LayoutStyles.w150, GlobalStyles.fontSize14, GlobalStyles.fontSerif]}>Diagnosa Sementara</Text>
              <Text style={[GlobalStyles.receiptColon, GlobalStyles.fontSerif]}>:</Text>
              <Text style={[LayoutStyles.flex1, LayoutStyles.textBold, GlobalStyles.fontSize14, GlobalStyles.fontSerif]}>{item.detail_medis?.diagnosa || '-'}</Text>
            </View>

            <Text style={[GlobalStyles.rujukanBoldText, LayoutStyles.mt30, LayoutStyles.textJustify, LayoutStyles.lineHeight22]}>
              Demikian agar pasien tersebut mendapatkan perawatan kesehatan selanjutnya. Terimakasih.
            </Text>
          </View>


          <View style={[LayoutStyles.justifyEnd, LayoutStyles.flexRow, LayoutStyles.mt20]}>
            <View style={GlobalStyles.rujukanAdminSign}>
              <Text style={GlobalStyles.receiptDateInfo}>Cirebon, {item.tgl ? formatDate(item.tgl) : '....................20..'}</Text>
              <Text style={GlobalStyles.rujukanDateInfoBold}>Hormat Kami</Text>
              <View style={GlobalStyles.receiptSignSpace} />
              <Text style={[GlobalStyles.receiptDateInfo, LayoutStyles.textBold, GlobalStyles.textAlignCenter]}>{item.penandatangan || item.user_klinik || ''}</Text>
            </View>
          </View>
        </View>


        <View style={[LayoutStyles.rowBetween, LayoutStyles.mt20, GlobalStyles.w90p]}>
          <TouchableOpacity
            style={[GlobalStyles.btnBatal, LayoutStyles.flex1, LayoutStyles.mr10]}
            onPress={() => navigation.goBack()}
          >
            <Text style={GlobalStyles.btnBatalText}>Kembali</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[GlobalStyles.btnSimpan, LayoutStyles.flex1, LayoutStyles.ml10, LayoutStyles.flexRow, isExporting ? GlobalStyles.opacity07 : GlobalStyles.opacity1]}
            onPress={handleExport}
            disabled={isExporting}
          >
            {isExporting ? <ActivityIndicator size="small" color="white" /> : <MaterialCommunityIcons name="file-pdf-box" size={24} color="white" />}
            <Text style={[GlobalStyles.primaryButtonText, LayoutStyles.ml10, GlobalStyles.fontSize16]}>{isExporting ? 'Mengekstrak...' : 'Export File'}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </AdminLayout>
  );
}
