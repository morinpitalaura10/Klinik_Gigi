import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../styles/GlobalStyles';

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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible && options?.type !== 'confirm') {
      timer = setTimeout(() => {
        handleConfirm();
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, options]);

  const getThemeConfig = () => {
    switch (options?.type) {
      case 'success': 
        return { 
          iconName: 'check-decagram', 
          iconColor: '#28A745', 
          titleColor: '#1A4D2E', 
          messageColor: '#1A4D2E', 
          barColor: '#28A745' 
        };
      case 'error': 
        return { 
          iconName: 'close-octagon', 
          iconColor: '#DC3545', 
          titleColor: '#721C24', 
          messageColor: '#721C24', 
          barColor: '#DC3545' 
        };
      case 'warning': 
        return { 
          iconName: 'alert-decagram', 
          iconColor: '#FFC107', 
          titleColor: '#856404', 
          messageColor: '#856404', 
          barColor: '#FFC107' 
        };
      case 'confirm': 
        return { 
          iconName: 'help-circle', 
          iconColor: Colors.primary, 
          titleColor: Colors.primary, 
          messageColor: '#555555', 
          barColor: Colors.primary 
        };
      default: 
        return { 
          iconName: 'information', 
          iconColor: '#17A2B8', 
          titleColor: '#0C5460', 
          messageColor: '#0C5460', 
          barColor: '#17A2B8' 
        };
    }
  };

  const theme = getThemeConfig();

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <TouchableWithoutFeedback onPress={options?.type !== 'confirm' ? handleConfirm : undefined}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.cardContainer}>
                <View style={[styles.cardContent, options?.type === 'confirm' && { paddingBottom: 20 }]}>
                  <MaterialCommunityIcons 
                    name={theme.iconName as any} 
                    size={72} 
                    color={theme.iconColor} 
                    style={styles.icon} 
                  />
                  <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: theme.titleColor }]}>
                      {options?.title}
                    </Text>
                    <Text style={[styles.message, { color: theme.messageColor }]}>
                      {options?.message}
                    </Text>
                  </View>
                </View>
                
                {options?.type === 'confirm' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={styles.btnCancel} 
                      onPress={handleCancel}
                    >
                      <Text style={styles.btnCancelText}>{options?.cancelText || 'Batal'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.btnConfirm, { backgroundColor: theme.iconColor }]} 
                      onPress={handleConfirm}
                    >
                      <Text style={styles.btnConfirmText}>{options?.confirmText || 'OK'}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={[styles.bottomBar, { backgroundColor: theme.barColor }]} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: '88%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 32,
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 28,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  btnCancelText: {
    color: '#555555',
    fontWeight: 'bold',
    fontSize: 15,
  },
  btnConfirm: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  btnConfirmText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  bottomBar: {
    width: '100%',
    height: 12,
  },
});
