import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  TextInput,
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
  disabled?: boolean;
}

export default function DropdownInput({ 
  label, 
  options, 
  selectedValue, 
  onValueChange, 
  placeholder = "Pilih...",
  disabled = false 
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find(opt => opt.value === selectedValue);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (value: string) => {
    onValueChange(value);
    setSearchQuery('');
    setModalVisible(false);
  };

  return (
    <View style={GlobalStyles.inputWrapper}>
      <TextLabel style={GlobalStyles.inputLabel}>{label}</TextLabel>
      
      <TouchableOpacity 
        style={[GlobalStyles.pickerButton, disabled && { opacity: 0.5, backgroundColor: '#EEE' }]} 
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text 
            style={[GlobalStyles.pickerText, !selectedOption && GlobalStyles.pickerPlaceholder]}
            numberOfLines={1}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-down" size={24} color={disabled ? '#888' : Colors.primary} />
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

              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: '#F5F5F5', 
                borderRadius: 10, 
                paddingHorizontal: 10, 
                marginBottom: 15,
                borderWidth: 1,
                borderColor: '#DDD'
              }}>
                <MaterialCommunityIcons name="magnify" size={20} color="#888" />
                <TextInput 
                  style={{ flex: 1, minHeight: 40, marginLeft: 5, color: '#333', paddingVertical: 5 }}
                  placeholder="Cari..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              
              <FlatList
                data={filteredOptions}
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
