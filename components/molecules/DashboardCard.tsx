import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../styles/GlobalStyles';

interface Props extends TouchableOpacityProps {
  title: string;
  icon: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  orientation?: 'vertical' | 'horizontal';
}

export default function DashboardCard({ title, icon, style, textStyle, orientation = 'vertical', ...props }: Props) {
  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        style
      ]} 
      activeOpacity={0.8}
      {...props}
    >
      {icon}
      <Text style={[styles.text, textStyle, orientation === 'horizontal' && { marginLeft: 15, marginTop: 0 }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardRed,
    borderRadius: 15,
    padding: 15,
    // Efek shadow mirip desain asli
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#984B4B', // Garis pinggir sedikit lebih gelap
  },
  vertical: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.white,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  }
});
