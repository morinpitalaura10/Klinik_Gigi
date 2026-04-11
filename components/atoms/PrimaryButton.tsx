import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles';

interface Props extends TouchableOpacityProps {
  title: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function PrimaryButton({ title, style, textStyle, ...props }: Props) {
  return (
    <TouchableOpacity 
      style={[GlobalStyles.primaryButton, style]} 
      activeOpacity={0.8} 
      {...props}
    >
      <Text style={[GlobalStyles.primaryButtonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}
