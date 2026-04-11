import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, LayoutStyles } from '../../styles/GlobalStyles';

interface Props {
  title: string;
  role: string;
  customLeftTitle?: string;
  customRightTitle?: string;
}

export default function TopBarAdmin({ title, role, customLeftTitle, customRightTitle }: Props) {
  return (
    <View style={styles.container}>
      {/* BAGIAN KIRI: LOGO + NAMA KLINIK + ALAMAT */}
      <View style={styles.leftSection}>
        <View style={styles.logoBadge}>
          <MaterialCommunityIcons name="tooth-outline" size={32} color={Colors.primary} />
        </View>
        <View>
          {customLeftTitle ? (
            <Text style={LayoutStyles.clinicName}>{customLeftTitle}</Text>
          ) : (
            <>
              <Text style={LayoutStyles.clinicName}>Galeri Ortodental</Text>
              <Text style={LayoutStyles.clinicAddress}>Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</Text>
            </>
          )}
        </View>
      </View>

      {/* BAGIAN KANAN: NAMA USER */}
      <Text style={styles.role}>{customRightTitle || title}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15, // Disesuaikan sedikit
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    backgroundColor: Colors.white,
    width: 55,
    height: 55,
    borderRadius: 27.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  role: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
