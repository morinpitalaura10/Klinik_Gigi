import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, LayoutStyles, GlobalStyles } from '../../styles/GlobalStyles';

interface Props {
  title: string;
  role: string;
  customLeftTitle?: string;
  customRightTitle?: string;
}

export default function TopBarAdmin({ title, role, customLeftTitle, customRightTitle }: Props) {
  return (
    <View style={GlobalStyles.topBarContainer}>
      {/* BAGIAN KIRI: LOGO + NAMA KLINIK + ALAMAT (SELALU MUNCUL) */}
      <View style={GlobalStyles.topBarLeft}>
        <View style={GlobalStyles.topBarLogoBadge}>
          <MaterialCommunityIcons name="tooth-outline" size={32} color={Colors.black} />
        </View>
        <View>
          <Text style={LayoutStyles.clinicName}>Galeri Ortodental</Text>
          <Text style={LayoutStyles.clinicAddress}>Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</Text>
        </View>
      </View>

      {/* BAGIAN KANAN: JUDUL HALAMAN + NAMA USER */}
      <View style={{ alignItems: 'flex-end' }}>
        {customRightTitle && (
          <Text style={[GlobalStyles.topBarTextRight, { fontSize: 16, marginBottom: 2, fontWeight: 'bold' }]}>
            {customRightTitle}
          </Text>
        )}
        <Text style={[GlobalStyles.topBarTextRight, { fontSize: 15, fontWeight: '500' }]}>
          {title}
        </Text>
      </View>
    </View>
  );
}
