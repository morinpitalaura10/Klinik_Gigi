import React, { useContext } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import TopBarAdmin from '../organisms/TopBarAdmin';
import BottomNavBar, { TabName } from '../organisms/BottomNavBar';
import { LayoutStyles } from '../../styles/GlobalStyles';

interface Props {
  children: React.ReactNode;
  activeTab: TabName;
  onTabPress?: (tab: TabName) => void; 
  title?: string;
  noScroll?: boolean;
  customLeftTitle?: string;
  customRightTitle?: string;
}

export default function AdminLayout({ 
  children, 
  activeTab, 
  onTabPress, 
  title, 
  noScroll = false,
  customLeftTitle,
  customRightTitle
}: Props) {
  const { user, logout } = useContext(AuthContext);
  const navigation = useNavigation<any>();

  const displayTitle = title || user?.nama || "Dashboard";
  const displayRole = user?.role === 'admin' ? 'Administrator' : 'Pengguna';

  // Logika Navigasi Otomatis berdasarkan Role
  const handleDefaultTabPress = (tab: TabName) => {
    if (onTabPress) {
      onTabPress(tab); 
      return;
    }

    if (tab === 'beranda') {
      if (user?.role === 'admin') {
        navigation.navigate('MainAdmin');
      } else if (user?.role === 'dokter') {
        // navigation.navigate('MainDokter'); 
      }
    } else if (tab === 'profil') {
      // navigation.navigate('Profil'); 
    } else if (tab === 'keluar') {
      logout();
    }
  };

  return (
    <SafeAreaView style={LayoutStyles.safeArea}>
      <TopBarAdmin 
        title={displayTitle} 
        role={displayRole} 
        customLeftTitle={customLeftTitle}
        customRightTitle={customRightTitle}
      />

      <View style={LayoutStyles.container}>
        {/* ISI UTAMA - Flex 1 agar memenuhi sisa layar */}
        <View style={{ flex: 1 }}>
          {noScroll ? (
            <View style={{ flex: 1 }}>
              {children}
            </View>
          ) : (
            <ScrollView contentContainerStyle={LayoutStyles.scrollContent}>
              {children}
            </ScrollView>
          )}
        </View>

        {/* KAKI OTOMATIS - Akan otomatis menempel di dasar View container (karena container space-between) */}
        <BottomNavBar activeTab={activeTab} onTabPress={handleDefaultTabPress} />
      </View>
    </SafeAreaView>
  );
}
