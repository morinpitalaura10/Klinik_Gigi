import React from 'react';
import { Text, TextProps } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles';

export default function Header({ style, children, ...props }: TextProps) {
  return (
    <Text style={[GlobalStyles.title, style]} {...props}>
      {children}
    </Text>
  );
}
