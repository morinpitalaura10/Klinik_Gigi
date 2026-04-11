import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles';

interface Props extends TouchableOpacityProps {
  label: string;
  isActive?: boolean;
  icon: React.ReactNode;
}

export default function NavButton({ label, isActive, icon, ...props }: Props) {
  return (
    <TouchableOpacity 
      style={GlobalStyles.bottomNavItem} 
      activeOpacity={0.7}
      {...props}
    >
      {/* Menggambar icon secara dinamis dari atas */}
      {icon}
      
      {/* Jika isActive bernilai true, maka style bold (activeText) akan otomatis tersambung */}
      <Text style={[GlobalStyles.bottomNavText, isActive && GlobalStyles.bottomNavActiveText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
