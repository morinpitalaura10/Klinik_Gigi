import React from 'react';
import { View, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { Colors, GlobalStyles } from '../../styles/GlobalStyles';

interface Props extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
}

export default function CardBody({ children, style, backgroundColor, ...props }: Props) {
  return (
    <View 
      style={[
        GlobalStyles.baseCardBody, 
        { backgroundColor: backgroundColor || Colors.white },
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}
