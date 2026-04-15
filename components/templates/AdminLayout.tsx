import React, { useContext } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import TopBarAdmin from '../organisms/TopBarAdmin';
import { LayoutStyles } from '../../styles/GlobalStyles';

interface Props {
  children: React.ReactNode;
  title?: string;
  noScroll?: boolean;
  customLeftTitle?: string;
  customRightTitle?: string;
  showBackButton?: boolean;
  onLogout?: () => void;
}

export default function AdminLayout({ 
  children, 
  title, 
  noScroll = false,
  customLeftTitle,
  customRightTitle,
  showBackButton = true,
  onLogout
}: Props) {
  const { user } = useContext(AuthContext);

  const displayTitle = title || user?.nama || "Dashboard";
  const displayRole = user?.role === 'admin' ? 'Administrator' : 'Pengguna';

  return (
    <SafeAreaView style={LayoutStyles.safeArea}>
      <TopBarAdmin 
        title={displayTitle} 
        role={displayRole} 
        customLeftTitle={customLeftTitle}
        customRightTitle={customRightTitle}
        showBackButton={showBackButton}
        onLogout={onLogout}
      />
      <View style={LayoutStyles.container}>
        <View style={LayoutStyles.flex1}>
          {noScroll ? (
            <View style={LayoutStyles.flex1}>
              {children}
            </View>
          ) : (
            <ScrollView contentContainerStyle={LayoutStyles.scrollContent}>
              {children}
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
