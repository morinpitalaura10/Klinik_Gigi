import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, LayoutStyles, GlobalStyles } from '../../styles/GlobalStyles';
import { useNavigation } from '@react-navigation/native';

interface Props {
  title: string;
  role: string;
  customLeftTitle?: string;
  customRightTitle?: string;
  showBackButton?: boolean;
  onLogout?: () => void;
}

export default function TopBarAdmin({ title, role, customLeftTitle, customRightTitle, showBackButton = true, onLogout }: Props) {
  const navigation = useNavigation();

  return (
    <View style={GlobalStyles.topBarContainer}>
      <View style={GlobalStyles.topBarLeft}>
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
        <View>
          <Text style={LayoutStyles.clinicName}>Galeri Ortodental</Text>
          <Text style={LayoutStyles.clinicAddress}>Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</Text>
        </View>
      </View>

      <View style={[GlobalStyles.topBarRightContent, GlobalStyles.alignEnd]}>
        <View style={[GlobalStyles.topBarRightTextWrapper, { marginRight: onLogout ? 15 : 0 }]}>
            {customRightTitle && (
            <Text style={GlobalStyles.topBarTextRightBold}>
                {customRightTitle}
            </Text>
            )}
            <Text style={GlobalStyles.topBarTextRight}>
            {title}
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
