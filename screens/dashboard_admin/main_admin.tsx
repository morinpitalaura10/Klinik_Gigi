import React, { useContext } from 'react';
import { View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DashboardCard from '../../components/molecules/DashboardCard';
import AdminLayout from '../../components/templates/AdminLayout';
import { Colors, LayoutStyles } from '../../styles/GlobalStyles';

export default function MainAdmin({ navigation }: any) {
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <AdminLayout showBackButton={false}>
      <View style={LayoutStyles.gridContainer}>

        {/* BARIS 1: 1 Besar (Kiri) + 3 Kecil (Kanan) */}
        <View style={LayoutStyles.topRow}>
          {/* Besar: Dental Record */}
          <DashboardCard
            title="Dental Record"
            icon={<MaterialCommunityIcons name="account-details" size={110} color={Colors.white} />}
            style={LayoutStyles.dashboardCardLeft}
            textStyle={LayoutStyles.textMedium}
            onPress={() => navigation.navigate('TampilRecordAdmin')}
          />

          {/* Kolom Kanan: 3 Tombol Stacked Vertikal */}
          <View style={LayoutStyles.rightColumn}>
            <DashboardCard
              title="Cetak Kwitansi"
              icon={<MaterialCommunityIcons name="file-export-outline" size={35} color={Colors.white} />}
              style={LayoutStyles.flex1}
              textStyle={LayoutStyles.textSmall}
              orientation="horizontal"
              onPress={() => navigation.navigate('TampilKwitansi')}
            />

            <DashboardCard
              title="Cetak Rujukan"
              icon={<MaterialCommunityIcons name="file-export-outline" size={35} color={Colors.white} />}
              style={[LayoutStyles.flex1, LayoutStyles.mv10]}
              textStyle={LayoutStyles.textSmall}
              orientation="horizontal"
              onPress={() => navigation.navigate('TampilRujukan')}
            />

            <DashboardCard
              title="Data Pasien"
              icon={<MaterialCommunityIcons name="clipboard-text-outline" size={35} color={Colors.white} />}
              style={LayoutStyles.flex1}
              textStyle={LayoutStyles.textSmall}
              orientation="horizontal"
              onPress={() => navigation.navigate('TampilPasien')}
            />
          </View>
        </View>

        {/* BARIS GRID 2: Aktifitas (Kiri) + Manajemen User (Kanan) */}
        <View style={[LayoutStyles.rowBetween, LayoutStyles.mt15]}>
            <DashboardCard
                title="Aktifitas"
                icon={<MaterialCommunityIcons name="history" size={35} color={Colors.white} />}
                orientation="horizontal"
                style={[LayoutStyles.flex1, LayoutStyles.mr10, { height: 80 }]}
                textStyle={LayoutStyles.textSmall}
                onPress={() => navigation.navigate('TampilHistori')}
            />

            <DashboardCard
                title="Manajemen User"
                icon={<MaterialCommunityIcons name="account-group-outline" size={35} color={Colors.white} />}
                orientation="horizontal"
                style={[LayoutStyles.flex1, LayoutStyles.ml10, { height: 80 }]}
                textStyle={LayoutStyles.textSmall}
                onPress={() => navigation.navigate('TampilUsers')}
            />
        </View>

        {/* BARIS GRID 3: Manajemen Perawatan (Kiri) + Logout (Kanan) */}
        <View style={[LayoutStyles.rowBetween, LayoutStyles.mt15]}>
            <DashboardCard
                title="Manajemen Perawatan"
                icon={<MaterialCommunityIcons name="briefcase-check-outline" size={30} color={Colors.white} />}
                orientation="horizontal"
                style={[LayoutStyles.flex1, LayoutStyles.mr10, { height: 80 }]}
                textStyle={LayoutStyles.textSmall}
                onPress={() => navigation.navigate('TampilTindakan')}
            />

            <DashboardCard
                title="Logout"
                icon={<MaterialCommunityIcons name="logout" size={35} color={Colors.white} />}
                orientation="horizontal"
                style={[LayoutStyles.flex1, LayoutStyles.ml10, LayoutStyles.bgPrimary, { height: 80 }]}
                textStyle={LayoutStyles.textMedium}
                onPress={handleLogout}
            />
        </View>

      </View>
    </AdminLayout>
  );
}
