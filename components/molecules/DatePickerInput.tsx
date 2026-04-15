import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, GlobalStyles } from '../../styles/GlobalStyles';
import TextLabel from '../atoms/TextLabel';

interface Props {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
}

export default function DatePickerInput({ label, value, onChange, placeholder = "Pilih tanggal..." }: Props) {
  const [show, setShow] = useState(false);

  // Convert string YYYY-MM-DD to Date object
  const getDateObject = (dateString: string) => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios'); // Keep showing on iOS, hide on Android after pick
    
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      onChange(formattedDate);
    }
  };

  return (
    <View style={GlobalStyles.inputWrapper}>
      <TextLabel style={GlobalStyles.inputLabel}>{label}</TextLabel>
      
      <TouchableOpacity 
        style={GlobalStyles.pickerButton} 
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Text style={[GlobalStyles.pickerText, !value && GlobalStyles.pickerPlaceholder]}>
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons name="calendar" size={24} color={Colors.primary} />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={getDateObject(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()} // Prevent picking future dates for birth date
        />
      )}
    </View>
  );
}
