import React, { useState, useContext } from 'react';
import { View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TabName } from '../../components/organisms/BottomNavBar';
import DashboardCard from '../../components/molecules/DashboardCard';
import AdminLayout from '../../components/templates/AdminLayout';
import { Colors, LayoutStyles } from '../../styles/GlobalStyles';

export default function MainAdmin({ navigation }: any) {
  const { logout } = useContext(AuthContext);

  return (
    <AdminLayout activeTab="beranda">
      <View style={LayoutStyles.gridContainer}>
        
        {/* BARIS 1: 1 Besar (Kiri) + 3 Kecil (Kanan) */}
        <View style={LayoutStyles.topRow}>
          {/* Besar: Dental Record */}
          <DashboardCard 
            title="Dental Record" 
            icon={<MaterialCommunityIcons name="account-details" size={85} color={Colors.white} />} 
            style={LayoutStyles.dashboardCardLeft} 
            textStyle={LayoutStyles.textMedium}
          />
          
          {/* Kolom Kanan: 3 Tombol Stacked Vertikal */}
          <View style={LayoutStyles.rightColumn}>
            <DashboardCard 
              title="Cetak Kwitansi" 
              icon={<MaterialCommunityIcons name="file-export-outline" size={35} color={Colors.white} />} 
              style={LayoutStyles.flex1}
              textStyle={LayoutStyles.textSmall}
              orientation="horizontal"
            />
            
            <DashboardCard 
              title="Cetak Rujukan" 
              icon={<MaterialCommunityIcons name="file-export-outline" size={35} color={Colors.white} />} 
              style={[LayoutStyles.flex1, { marginVertical: 10 }]}
              textStyle={LayoutStyles.textSmall}
              orientation="horizontal"
            />

            <DashboardCard 
              title="Data Pasien" 
              icon={<MaterialCommunityIcons name="clipboard-text-outline" size={35} color={Colors.white} />} 
              style={LayoutStyles.flex1}
              textStyle={LayoutStyles.textSmall}
              orientation="horizontal"
            />
          </View>
        </View>

        {/* BARIS 2: Manajemen User (Lebar) */}
        <DashboardCard 
          title="Manajemen User" 
          icon={<MaterialCommunityIcons name="account-group-outline" size={40} color={Colors.white} />} 
          style={LayoutStyles.dashboardCardBottom} 
          orientation="horizontal"
          textStyle={LayoutStyles.textMedium}
          onPress={() => navigation.navigate('TampilUsers')}
        />

        {/* BARIS 3: Manajemen Tindakan (Lebar) */}
        <DashboardCard 
          title="Manajemen Tindakan" 
          icon={<MaterialCommunityIcons name="briefcase-check-outline" size={40} color={Colors.white} />} 
          style={LayoutStyles.dashboardCardBottom} 
          orientation="horizontal"
          textStyle={LayoutStyles.textMedium}
          onPress={() => navigation.navigate('TampilTindakan')}
        />

      </View>
    </AdminLayout>
  );
}


