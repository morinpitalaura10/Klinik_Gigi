import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, LayoutStyles, GlobalStyles } from '../../styles/GlobalStyles';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

interface Props {
  title?: string;
  role?: string;
  customLeftTitle?: string;
  customRightTitle?: string;
  showBackButton?: boolean;
  onLogout?: () => void;
}

export default function TopBarAdmin({ showBackButton = true, onLogout }: Props) {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const displayRole = user?.role === 'admin' ? 'Admin' : (user?.role === 'dokter' ? 'Dokter' : 'Pengguna');
  const displayName = user?.nama || 'Guest';

  return (
    <View style={GlobalStyles.topBarContainer}>
      <View style={[GlobalStyles.topBarLeft, { flex: 1 }]}>
        {showBackButton && (
          <TouchableOpacity 
            style={GlobalStyles.backButton} 
            onPress={() => navigation.canGoBack() && navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={Colors.white} />
          </TouchableOpacity>
        )}
        
        <View style={GlobalStyles.topBarLogoBadge}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={GlobalStyles.logoCircleSmall} 
            resizeMode="cover"
          />
        </View>
        <View style={LayoutStyles.flex1}>
          <Text style={LayoutStyles.clinicName} numberOfLines={1}>Galeri Ortodental</Text>
          <Text style={LayoutStyles.clinicAddress} numberOfLines={1}>Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</Text>
        </View>
      </View>

      <View style={[GlobalStyles.topBarRightContent, GlobalStyles.alignEnd]}>
        <View style={[GlobalStyles.topBarRightTextWrapper, { marginRight: onLogout ? 15 : 0 }]}>
            <Text style={GlobalStyles.topBarTextRightBold} numberOfLines={1}>
                {displayRole}
            </Text>
            <Text style={GlobalStyles.topBarTextRight} numberOfLines={1}>
                {displayName}
            </Text>
        </View>

        {onLogout && (
            <TouchableOpacity 
                onPress={onLogout}
                style={GlobalStyles.logoutButtonBackground}
            >
                <MaterialCommunityIcons name="logout" size={20} color={Colors.white} />
            </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
