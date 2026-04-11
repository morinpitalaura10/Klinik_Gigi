import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles';

export interface InputTextProps extends TextInputProps {
  variant?: 'login' | 'form';
}

export default function InputText({ style, variant = 'form', ...props }: InputTextProps) {
  // Gunakan pillInput (border hitam/putih) jika variant 'login',
  // Gunakan formInput (border merah/bg pink) jika variant 'form'.
  const inputStyle = variant === 'login' ? GlobalStyles.pillInput : GlobalStyles.formInput;

  return (
    <TextInput
      style={[inputStyle, style]}
      placeholderTextColor="#A0A0A0"
      {...props}
    />
  );
}
