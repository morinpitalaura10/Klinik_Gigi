import React, { useState } from 'react';
import { View, TouchableOpacity, ViewStyle, StyleProp, TextInputProps, TextInput } from 'react-native';
import TextLabel from '../atoms/TextLabel';
import { Feather } from '@expo/vector-icons';
import { GlobalStyles } from '../../styles/GlobalStyles';

interface Props extends TextInputProps {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
  variant?: 'login' | 'form';
}

export default function PasswordInput({ label, containerStyle, variant = 'form', ...props }: Props) {
  const [isVisible, setIsVisible] = useState(false);



  const containerInputStyle = variant === 'login'
    ? [GlobalStyles.pillInput, { flexDirection: 'row' as const, alignItems: 'center' as const, paddingHorizontal: 15 }]
    : GlobalStyles.inputContainer;

  return (
    <View style={[GlobalStyles.inputWrapper, containerStyle]}>
      <TextLabel style={GlobalStyles.inputLabel}>{label}</TextLabel>
      <View style={containerInputStyle}>
        <TextInput
          style={GlobalStyles.inputText}
          placeholderTextColor="#A0A0A0"
          secureTextEntry={!isVisible}
          autoCapitalize="none"
          {...props}
        />
        <TouchableOpacity
          onPress={() => setIsVisible(!isVisible)}
          style={GlobalStyles.inputRightIcon}
        >
          <Feather
            name={isVisible ? 'eye' : 'eye-off'}
            size={20}
            color="black"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
