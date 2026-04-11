import React from 'react';
import { Text, TextProps } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles';

export default function TextLabel({ style, children, ...props }: TextProps) {
  return (
    <Text style={[GlobalStyles.label, style]} {...props}>
      {children}
    </Text>
  );
}
