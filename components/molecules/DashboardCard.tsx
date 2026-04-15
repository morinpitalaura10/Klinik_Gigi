import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles';

interface Props extends TouchableOpacityProps {
  title: string;
  icon: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  orientation?: 'vertical' | 'horizontal';
}

export default function DashboardCard({ title, icon, style, textStyle, orientation = 'vertical', ...props }: Props) {
  return (
    <TouchableOpacity 
      style={[
        GlobalStyles.cardWrapper, 
        orientation === 'horizontal' ? GlobalStyles.cardHorizontal : GlobalStyles.cardVertical,
        style
      ]} 
      activeOpacity={0.8}
      {...props}
    >
      {icon}
      <Text style={[
        GlobalStyles.cardText, 
        textStyle, 
        orientation === 'horizontal' && GlobalStyles.cardTextHorizontal
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
