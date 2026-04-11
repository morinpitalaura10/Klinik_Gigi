import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

// Import Layar-layar Aplikasi
import Login from '../screens/Login';
import MainAdmin from '../screens/dashboard_admin/main_admin';
import { TampilUsers } from '../screens/dashboard_admin/crud_users/tampil_users';
import { CreateUser } from '../screens/dashboard_admin/crud_users/create_users';
import { ReadUser } from '../screens/dashboard_admin/crud_users/read_users';
import { UpdateUser } from '../screens/dashboard_admin/crud_users/update_users';
import { DeleteUser } from '../screens/dashboard_admin/crud_users/delete_users';

// Tindakan Screens
import { TampilTindakan } from '../screens/dashboard_admin/crud_tindakan/tampil_tindakan';
import { CreateTindakan } from '../screens/dashboard_admin/crud_tindakan/create_tindakan';
import { UpdateTindakan } from '../screens/dashboard_admin/crud_tindakan/update_tindakan';
import { DeleteTindakan } from '../screens/dashboard_admin/crud_tindakan/delete_tindakan';

// Mendefinisikan tipe rute
export type RootStackParamList = {
  Login: undefined;
  MainAdmin: undefined;
  TampilUsers: undefined;
  CreateUser: undefined;
  UpdateUser: { editUser: any };
  ReadUser: { id: string | number };
  DeleteUser: { id: string | number, name: string };
  // Tindakan
  TampilTindakan: undefined;
  CreateTindakan: undefined;
  UpdateTindakan: { editItem: any };
  DeleteTindakan: { id: string | number, name: string };
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
          <Stack.Screen name="ReadUser" component={ReadUser} />
          <Stack.Screen name="UpdateUser" component={UpdateUser} />
          <Stack.Screen 
            name="DeleteUser" 
            component={DeleteUser} 
            options={{ 
              presentation: 'transparentModal',
              animation: 'fade',
            }}
          />

          {/* Tindakan Routes */}
          <Stack.Screen name="TampilTindakan" component={TampilTindakan} />
          <Stack.Screen name="CreateTindakan" component={CreateTindakan} />
          <Stack.Screen name="UpdateTindakan" component={UpdateTindakan} />
          <Stack.Screen 
            name="DeleteTindakan" 
            component={DeleteTindakan} 
            options={{ 
              presentation: 'transparentModal',
              animation: 'fade',
            }}
          />
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
