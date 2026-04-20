import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <View style={styles.container}>
          <AppNavigator />
          <StatusBar style="light" />
        </View>
      </AlertProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B1D1D',
  },
});
