import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, StyleProp, TextInputProps, TextInput } from 'react-native';
import TextLabel from '../atoms/TextLabel';
import { Feather } from '@expo/vector-icons';
import { GlobalStyles } from '../../styles/GlobalStyles';

interface Props extends TextInputProps {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function PasswordInput({ label, containerStyle, ...props }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextLabel style={styles.label}>{label}</TextLabel>
      <View style={GlobalStyles.pillInput}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholderTextColor="#A0A0A0"
            secureTextEntry={!isVisible}
            autoCapitalize="none"
            {...props}
          />
          <TouchableOpacity
            onPress={() => setIsVisible(!isVisible)}
            style={styles.eyeIcon}
          >
            <Feather
              name={isVisible ? 'eye' : 'eye-off'}
              size={20}
              color="black"
            />
          </TouchableOpacity>
        </View>
      </View>
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
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  input: {
    flex: 1,
    paddingHorizontal: 20,
    height: '100%',
    fontSize: 14,
    color: '#000',
  },
  eyeIcon: {
    paddingHorizontal: 15,
    height: '100%',
    justifyContent: 'center',
  },
});
