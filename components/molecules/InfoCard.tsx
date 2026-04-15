import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CardBody from '../atoms/CardBody';
import { Colors, GlobalStyles } from '../../styles/GlobalStyles';

interface Props {
  label: string;
  value: string | number;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
  color?: string;
}

export default function InfoCard({ label, value, iconName, style, color = Colors.primary }: Props) {
  return (
    <CardBody style={[GlobalStyles.infoCardContainer, style]}>
      <View style={[GlobalStyles.infoCardIconContainer, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={iconName} size={24} color={color} />
      </View>
      <View style={GlobalStyles.infoCardTextContainer}>
        <Text style={GlobalStyles.infoCardLabel}>{label}</Text>
        <Text style={[GlobalStyles.infoCardValue, { color: color }]}>{value}</Text>
      </View>
    </CardBody>
  );
}
