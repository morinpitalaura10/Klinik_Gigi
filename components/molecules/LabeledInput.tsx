import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import TextLabel from '../atoms/TextLabel';
import InputText, { InputTextProps } from '../atoms/InputText';
import { GlobalStyles } from '../../styles/GlobalStyles';

interface Props extends InputTextProps {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function LabeledInput({ label, containerStyle, variant = 'form', ...props }: Props) {
  return (
    <View style={[GlobalStyles.inputWrapper, containerStyle]}>
      <TextLabel style={GlobalStyles.inputLabel}>{label}</TextLabel>
      <InputText variant={variant} {...props} />
    </View>
  );
}
