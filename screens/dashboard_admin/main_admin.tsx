import React, { useState, useCallback, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminLayout from '../../components/templates/AdminLayout';
import { Colors, LayoutStyles, AdminDashboardStyles } from '../../styles/GlobalStyles';
import { supabase } from '../../utils/supabase';
import { useAlert } from '../../context/AlertContext';

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
  const { showAlert } = useAlert();
  const [todayActivities, setTodayActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getDateTimeParts = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dayName = days[currentTime.getDay()];
    const date = currentTime.getDate();
    const month = months[currentTime.getMonth()];
    const year = currentTime.getFullYear();
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');
    return {
      day: dayName,
      date: `${date} ${month} ${year}`,
      time: `${hours}:${minutes}:${seconds}`
    };
  };

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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Menunggu': return { bg: '#F0F0F0', text: '#666' };
      case 'Diproses': return { bg: '#FFF9E6', text: '#D4A017' };
      case 'Selesai': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'Batal': return { bg: '#FFEBEE', text: '#C62828' };
      default: return { bg: '#FFF', text: '#000' };
    }
  };

  const handleLogout = () => {
    showAlert({
      title: 'Logout Admin',
      message: 'Apakah Anda yakin ingin keluar dari sistem?',
      type: 'confirm',
      onConfirm: logout
    });
  };

  return (
    <AdminLayout showBackButton={false} noScroll={true}>
      <View style={[LayoutStyles.flex1, AdminDashboardStyles.mainContainer]}>
        
        {/* Kolom Kiri: Menu Operasional */}
        <View style={AdminDashboardStyles.leftColumn}>
          <ScrollView showsVerticalScrollIndicator={false} style={LayoutStyles.flex1}>
            
            <Text style={[AdminDashboardStyles.menuSectionTitle, AdminDashboardStyles.menuSectionTitleTop]}>LAYANAN OPERASIONAL</Text>
            <View style={AdminDashboardStyles.menuGridContainer}>
              <MenuIcon title={"Dental\nRecord"} icon="account-details" onPress={() => navigation.navigate('TampilRecordAdmin')} />
              <MenuIcon title={"Cetak\nRujukan"} icon="file-export-outline" onPress={() => navigation.navigate('TampilRujukan')} />
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
            <TouchableOpacity style={AdminDashboardStyles.logoutButton} onPress={handleLogout}>
               <Text style={AdminDashboardStyles.logoutButtonText}>Logout</Text>
               <MaterialCommunityIcons name="logout" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Kolom Kanan: Aktifitas Hari Ini */}
        <View style={{ flex: 2 }}>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primary }}>Hari : </Text>
               <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>{getDateTimeParts().day}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primary }}>Tanggal : </Text>
               <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>{getDateTimeParts().date}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primary }}>Jam : </Text>
               <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>{getDateTimeParts().time}</Text>
            </View>
          </View>

          <View style={[AdminDashboardStyles.rightColumn, { flex: 1 }]}>
            <View style={AdminDashboardStyles.tableHeader}>
            <Text style={AdminDashboardStyles.thName}>Nama</Text>
            <Text style={[AdminDashboardStyles.thCenter, AdminDashboardStyles.flex1_5]}>Gender</Text>
            <Text style={[AdminDashboardStyles.thCenter, AdminDashboardStyles.flex2]}>Status Layanan</Text>
            <Text style={[AdminDashboardStyles.thCenter, AdminDashboardStyles.flex1_5]}>Status</Text>
          </View>

          <ScrollView style={LayoutStyles.flex1} showsVerticalScrollIndicator={false}>
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
                    <View style={[AdminDashboardStyles.badgeContainer, { backgroundColor: getStatusStyle(item.status).bg, borderWidth: 1, borderColor: getStatusStyle(item.status).text }]}>
                      <Text style={[AdminDashboardStyles.badgeText, { color: getStatusStyle(item.status).text }]}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          </View>
        </View>

      </View>
    </AdminLayout>
  );
}
