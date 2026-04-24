import React, { useState, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminLayout from '../../components/templates/AdminLayout';
import { Colors, LayoutStyles, AdminDashboardStyles } from '../../styles/GlobalStyles';
import { supabase } from '../../utils/supabase';

const MenuIcon = ({ title, icon, onPress }: { title: string, icon: string, onPress: () => void }) => (
  <TouchableOpacity style={AdminDashboardStyles.menuIconTouchable} onPress={onPress}>
     <View style={AdminDashboardStyles.menuIconOuterBox}>
        <View style={AdminDashboardStyles.menuIconInnerBox}>
          <MaterialCommunityIcons name={icon as any} size={24} color="#FFFFFF" />
        </View>
     </View>
     <Text style={AdminDashboardStyles.menuIconText}>{title}</Text>
  </TouchableOpacity>
);

export default function MainAdmin({ navigation }: any) {
  const { user, logout } = useContext(AuthContext);
  const [todayActivities, setTodayActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayActivities = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const { data, error } = await supabase
        .from('tb_rekam_medis')
        .select(`
          id_record,
          layanan,
          status,
          tb_pasien (
            nama_pasien,
            jk
          )
        `)
        .eq('tanggal', dateString)
        .order('id_record', { ascending: false });

      if (error) {
        console.error("Error fetching today activities:", error);
      } else {
        setTodayActivities(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTodayActivities();
    }, [])
  );

  return (
    <AdminLayout showBackButton={false} noScroll={true}>
      <View style={[LayoutStyles.flex1, AdminDashboardStyles.mainContainer]}>
        
        {/* Kolom Kiri: Menu Operasional */}
        <View style={AdminDashboardStyles.leftColumn}>
          <ScrollView showsVerticalScrollIndicator={false}>
            
            <Text style={[AdminDashboardStyles.menuSectionTitle, AdminDashboardStyles.menuSectionTitleTop]}>LAYANAN OPERASIONAL</Text>
            <View style={AdminDashboardStyles.menuGridContainer}>
              <MenuIcon title={"Dental\nRecord"} icon="account-details" onPress={() => navigation.navigate('TampilRecordAdmin')} />
              <MenuIcon title={"Cetak\nRujukan"} icon="file-export-outline" onPress={() => navigation.navigate('CreateRujukan')} />
              <MenuIcon title={"Cetak\nKwitansi"} icon="receipt" onPress={() => navigation.navigate('TampilKwitansi')} />
              <MenuIcon title={"Seluruh\nAktifitas"} icon="history" onPress={() => navigation.navigate('TampilHistori')} />
            </View>

            <Text style={[AdminDashboardStyles.menuSectionTitle, AdminDashboardStyles.menuSectionTitleBottom]}>MANAJEMEN KLINIK</Text>
            <View style={AdminDashboardStyles.menuGridContainer}>
              <MenuIcon title={"Data\nPasien"} icon="clipboard-account-outline" onPress={() => navigation.navigate('TampilPasien')} />
              <MenuIcon title={"Manajemen\nUser"} icon="account-group-outline" onPress={() => navigation.navigate('TampilUsers')} />
              <MenuIcon title={"Manajemen\nPerawatan"} icon="briefcase-check-outline" onPress={() => navigation.navigate('TampilTindakan')} />
            </View>
            
          </ScrollView>

          {/* User Info & Logout di bawah */}
          <View style={AdminDashboardStyles.userInfoContainer}>
            <View>
              <Text style={AdminDashboardStyles.userRoleText}>Admin</Text>
              <Text style={AdminDashboardStyles.userNameText}>{user?.nama || 'Pengguna'}</Text>
            </View>
            <TouchableOpacity style={AdminDashboardStyles.logoutButton} onPress={logout}>
               <Text style={AdminDashboardStyles.logoutButtonText}>Logout</Text>
               <MaterialCommunityIcons name="logout" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Kolom Kanan: Aktifitas Hari Ini */}
        <View style={AdminDashboardStyles.rightColumn}>
          
          <View style={AdminDashboardStyles.tableHeader}>
            <Text style={AdminDashboardStyles.thName}>Nama</Text>
            <Text style={[AdminDashboardStyles.thCenter, AdminDashboardStyles.flex1_5]}>Gender</Text>
            <Text style={[AdminDashboardStyles.thCenter, AdminDashboardStyles.flex2]}>Status Layanan</Text>
            <Text style={[AdminDashboardStyles.thCenter, AdminDashboardStyles.flex1_5]}>Status</Text>
          </View>

          <ScrollView style={LayoutStyles.flex1}>
            {loading ? (
              <ActivityIndicator style={LayoutStyles.mt50} size="large" color={Colors.primary} />
            ) : todayActivities.length === 0 ? (
              <Text style={AdminDashboardStyles.emptyStateText}>Belum ada aktifitas hari ini.</Text>
            ) : (
              todayActivities.map((item, idx) => (
                <View key={item.id_record} style={[AdminDashboardStyles.tableRow, idx % 2 === 0 ? AdminDashboardStyles.tableRowEven : AdminDashboardStyles.tableRowOdd]}>
                  <Text style={AdminDashboardStyles.tdName}>{item.tb_pasien?.nama_pasien || '-'}</Text>
                  
                  <View style={AdminDashboardStyles.tdCenterContainer}>
                    <View style={AdminDashboardStyles.badgeContainer}>
                      <Text style={AdminDashboardStyles.badgeText}>{item.tb_pasien?.jk || '-'}</Text>
                    </View>
                  </View>

                  <Text style={AdminDashboardStyles.tdLayanan}>{item.layanan || '-'}</Text>
                  
                  <View style={AdminDashboardStyles.tdCenterContainer}>
                    <View style={AdminDashboardStyles.badgeContainer}>
                      <Text style={AdminDashboardStyles.badgeText}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

        </View>

      </View>
    </AdminLayout>
  );
}
