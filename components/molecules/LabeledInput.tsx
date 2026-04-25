import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import TextLabel from '../atoms/TextLabel';
import InputText, { InputTextProps } from '../atoms/InputText';
import { GlobalStyles } from '../../styles/GlobalStyles';

interface Props extends InputTextProps {
  label: string;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  hideLabel?: boolean;
  buttonStyle?: any;
}

export default function LabeledInput({ label, containerStyle, hideLabel = false, variant = 'form', ...props }: Props) {
  return (
    <View style={[!hideLabel && GlobalStyles.inputWrapper, containerStyle]}>
      {!hideLabel && <TextLabel style={GlobalStyles.inputLabel}>{label}</TextLabel>}
      <InputText variant={variant} {...props} />
    </View>
  );
}
