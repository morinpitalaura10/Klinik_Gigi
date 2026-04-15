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
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>
        )}
        
        <View style={GlobalStyles.topBarLogoBadge}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={{ width: 45, height: 45, borderRadius: 22.5 }} 
            resizeMode="cover"
          />
        </View>
        <View>
          <Text style={LayoutStyles.clinicName}>Galeri Ortodental</Text>
          <Text style={LayoutStyles.clinicAddress}>Cipto Park Jl. Dr. Cipto Mangunkusumo No. 54 Cirebon</Text>
        </View>
      </View>

      <View style={[GlobalStyles.alignEnd, { flexDirection: 'row', alignItems: 'center' }]}>
        <View style={{ alignItems: 'flex-end', marginRight: onLogout ? 15 : 0 }}>
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
                style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: 8,
                    borderRadius: 10
                }}
            >
                <MaterialCommunityIcons name="logout" size={20} color={Colors.white} />
            </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
