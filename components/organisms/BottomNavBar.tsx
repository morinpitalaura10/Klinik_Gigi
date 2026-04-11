import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { Colors, GlobalStyles } from '../../styles/GlobalStyles';
import NavButton from '../atoms/NavButton'; // Komponen Atom baru kita!

export type TabName = 'beranda' | 'profil' | 'keluar';

interface Props {
  activeTab?: TabName;
  onTabPress: (tab: TabName) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function BottomNavBar({ activeTab = 'beranda', onTabPress, containerStyle }: Props) {
  return (
    <View style={[GlobalStyles.bottomNavContainer, containerStyle]}>
      
      {/* 🟢 Menu Beranda */}
      <NavButton 
        label="Beranda"
        isActive={activeTab === 'beranda'}
        onPress={() => onTabPress('beranda')}
        icon={
          <MaterialCommunityIcons 
            name={activeTab === 'beranda' ? 'home' : 'home-outline'} 
            size={28} color={Colors.white} 
          />
        }
      />

      {/* 🟢 Menu Profil */}
      <NavButton 
        label="Profil"
        isActive={activeTab === 'profil'}
        onPress={() => onTabPress('profil')}
        icon={
          <Ionicons 
            name={activeTab === 'profil' ? 'person-circle' : 'person-circle-outline'} 
            size={28} color={Colors.white} 
          />
        }
      />

      {/* 🔴 Menu Keluar */}
      <NavButton 
        label="Keluar"
        onPress={() => onTabPress('keluar')}
        icon={
          <Feather 
            name="log-out" 
            size={26} color={Colors.white} 
            style={{ marginBottom: 2 }} 
          />
        }
      />
      
    </View>
  );
}
