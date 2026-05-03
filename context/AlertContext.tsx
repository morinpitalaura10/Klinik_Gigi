import React, { createContext, useState, ReactNode, useContext } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalStyles, Colors, AlertStyles, LayoutStyles } from '../styles/GlobalStyles';

type AlertType = 'success' | 'error' | 'info' | 'warning' | 'confirm';

interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface AlertContextProps {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions | null>(null);

  const showAlert = (newOptions: AlertOptions) => {
    setOptions(newOptions);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
  };

  const handleConfirm = () => {
    if (options?.onConfirm) {
      options.onConfirm();
    }
    hideAlert();
  };

  const handleCancel = () => {
    if (options?.onCancel) {
      options.onCancel();
    }
    hideAlert();
  };

  const getIcon = () => {
    switch (options?.type) {
      case 'success': return { name: 'check-circle', color: '#4CAF50' };
      case 'error': return { name: 'close-circle', color: '#F44336' };
      case 'warning': return { name: 'alert-circle', color: '#FF9800' };
      case 'confirm': return { name: 'help-circle', color: Colors.primary };
      default: return { name: 'information-variant', color: '#2196F3' };
    }
  };

  const icon = getIcon();

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <View style={GlobalStyles.modalBackdrop}>
          <View style={[GlobalStyles.modalBox, LayoutStyles.pb20]}>
            <MaterialCommunityIcons 
              name={icon.name as any} 
              size={60} 
              color={icon.color} 
              style={AlertStyles.icon} 
            />
            
            <Text style={GlobalStyles.modalText}>{options?.title}</Text>
            <Text style={[GlobalStyles.modalText, AlertStyles.message]}>
              {options?.message}
            </Text>

            <View style={GlobalStyles.modalActionRow}>
              {options?.type === 'confirm' && (
                <TouchableOpacity 
                   style={[GlobalStyles.btnModalBatal, AlertStyles.btnConfirm]} 
                   onPress={handleCancel}
                >
                  <Text style={GlobalStyles.btnModalText}>{options.cancelText || 'Batal'}</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[
                  GlobalStyles.btnModalHapus, 
                  AlertStyles.btnConfirm,
                  { 
                    backgroundColor: options?.type === 'error' ? '#F44336' : (options?.type === 'success' ? '#4CAF50' : Colors.primary),
                  },
                  options?.type === 'confirm' && AlertStyles.btnWithMargin
                ]} 
                onPress={handleConfirm}
              >
                <Text style={GlobalStyles.btnModalText}>{options?.confirmText || 'OK'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};
