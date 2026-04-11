import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
// Tidak memanggil halaman Login lagi, tapi memanggil jembatan Navigator
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <AppNavigator />
        <StatusBar style="light" />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B1D1D', // Supaya saat transisi ke login tidak putih kedip
  },
});
