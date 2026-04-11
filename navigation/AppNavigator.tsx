import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

// Import Layar-layar Aplikasi
import Login from '../screens/Login';
import MainAdmin from '../screens/dashboard_admin/main_admin';
import TampilUsers from '../screens/dashboard_admin/crud_users/tampil_users';
import CreateUser from '../screens/dashboard_admin/crud_users/create_users';

// Mendefinisikan tipe rute (Strict Type aman untuk TypeScript) - optional now since we split stacks, but good to have
export type RootStackParamList = {
  Login: undefined;
  MainAdmin: undefined;
  TampilUsers: undefined;
  CreateUser: { editUser?: any } | undefined;
  // Tambahkan layar dokter/umum nanti di sini
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {!user ? (
        // STACK TAMU / BELUM LOGIN
        <Stack.Navigator 
          id={undefined}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
      ) : user.role === 'admin' ? (
        // STACK ADMIN
        <Stack.Navigator 
          id={undefined}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="MainAdmin" component={MainAdmin} />
          <Stack.Screen name="TampilUsers" component={TampilUsers} />
          <Stack.Screen name="CreateUser" component={CreateUser} />
        </Stack.Navigator>
      ) : (
        // BISA DITAMBAHKAN UNTUK DOKTER ATAU ROLE LAIN NANTINYA
        <Stack.Navigator 
          id={undefined}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
