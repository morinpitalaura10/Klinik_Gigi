import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  TouchableWithoutFeedback 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, GlobalStyles } from '../../styles/GlobalStyles';
import TextLabel from '../atoms/TextLabel';

interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export default function DropdownInput({ label, options, selectedValue, onValueChange, placeholder = "Pilih..." }: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(opt => opt.value === selectedValue);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View style={GlobalStyles.inputWrapper}>
      <TextLabel style={GlobalStyles.inputLabel}>{label}</TextLabel>
      
      <TouchableOpacity 
        style={GlobalStyles.pickerButton} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[GlobalStyles.pickerText, !selectedOption && { color: '#A0A0A0' }]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={24} color={Colors.primary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={GlobalStyles.selectionModalOverlay}>
            <View style={GlobalStyles.selectionModalContent}>
              <View style={GlobalStyles.selectionModalHeader}>
                <Text style={GlobalStyles.selectionModalTitle}>{label}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={Colors.black} />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      GlobalStyles.selectionOptionItem, 
                      selectedValue === item.value && GlobalStyles.selectionOptionItemActive
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text style={[
                      GlobalStyles.selectionOptionText, 
                      selectedValue === item.value && GlobalStyles.selectionOptionTextActive
                    ]}>
                      {item.label}
                    </Text>
                    {selectedValue === item.value && (
                      <MaterialCommunityIcons name="check" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
