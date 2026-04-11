import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import TextLabel from '../atoms/TextLabel';
import InputText, { InputTextProps } from '../atoms/InputText';

interface Props extends InputTextProps {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function LabeledInput({ label, containerStyle, variant = 'form', ...props }: Props) {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextLabel style={styles.label}>{label}</TextLabel>
      <InputText variant={variant} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    marginLeft: 6,
    fontWeight: 'bold', // Di desain form, labelnya cetak tebal
  },
});
