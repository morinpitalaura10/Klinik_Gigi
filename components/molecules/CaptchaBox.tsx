import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../styles/GlobalStyles';

interface Props {
  isChecked: boolean;
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function CaptchaBox({ isChecked, onPress, containerStyle }: Props) {
  return (
    <View style={[styles.section, containerStyle]}>
      <TouchableOpacity
        style={styles.box}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={isChecked ? "checkbox-marked" : "checkbox-blank-outline"}
          size={24}
          color={isChecked ? Colors.primary : "gray"}
        />
        <Text style={styles.text}>Saya bukan robot</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>
        *Centang captcha di atas untuk melengkapi validasi
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 10,
    marginBottom: 35,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#888888',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  text: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333333',
  },
  hint: {
    fontSize: 10,
    color: Colors.primary,
    marginTop: 8,
    fontStyle: 'italic',
    marginLeft: 4,
  },
});
