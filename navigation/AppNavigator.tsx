import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

// Import Layar-layar Aplikasi
import Login from '../screens/Login';
import MainAdmin from '../screens/dashboard_admin/main_admin';

// User Management
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

// Pasien Screens
import { TampilPasien } from '../screens/dashboard_admin/crud_pasien/tampil_datapasien';
import { CreatePasien } from '../screens/dashboard_admin/crud_pasien/create_datapasien';
import { ReadPasien } from '../screens/dashboard_admin/crud_pasien/read_datapasien';
import { UpdatePasien } from '../screens/dashboard_admin/crud_pasien/update_datapasien';
import { DeletePasien } from '../screens/dashboard_admin/crud_pasien/delete_datapasien';

// Dental Record Admin
import { TampilRecordAdmin } from '../screens/dashboard_admin/dental_record/tampil_record_admin';
import { CreateRecordAdmin } from '../screens/dashboard_admin/dental_record/create_record_admin';

// Dokter Screens
import MainDokter from '../screens/dashboard_dokter/main_dokter';
import { IsiRekamMedis } from '../screens/dashboard_dokter/isi_rekam_medis';

// Kwitansi Screens
import { TampilKwitansi } from '../screens/dashboard_admin/crud_kwitansi/tampil_kwitansi';
import { CreateKwitansi } from '../screens/dashboard_admin/crud_kwitansi/create_kwitansi';
import { PreviewKwitansi } from '../screens/dashboard_admin/crud_kwitansi/preview_kwitansi';

// Rujukan Screens
import { TampilRujukan } from '../screens/dashboard_admin/crud_rujukan/tampil_rujukan';
import { CreateRujukan } from '../screens/dashboard_admin/crud_rujukan/create_rujukan';
import { PreviewRujukan } from '../screens/dashboard_admin/crud_rujukan/preview_rujukan';

// Histori
import { TampilHistori } from '../screens/dashboard_admin/histori/tampil_histori';

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
  // Pasien
  TampilPasien: undefined;
  CreatePasien: undefined;
  ReadPasien: { id: string | number };
  UpdatePasien: { editItem: any };
  DeletePasien: { id: string | number, name: string };
  // Dental Record
  TampilRecordAdmin: undefined;
  CreateRecordAdmin: { editItem?: any };
  // Dokter
  MainDokter: undefined;
  IsiRekamMedis: { record: any };
  // Kwitansi
  TampilKwitansi: undefined;
  CreateKwitansi: undefined;
  PreviewKwitansi: { item: any };
  // Rujukan
  TampilRujukan: undefined;
  CreateRujukan: { record: any };
  PreviewRujukan: { item: any };
  // Histori
  TampilHistori: undefined;
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

          {/* Pasien Routes */}
          <Stack.Screen name="TampilPasien" component={TampilPasien} />
          <Stack.Screen name="CreatePasien" component={CreatePasien} />
          <Stack.Screen name="ReadPasien" component={ReadPasien} />
          <Stack.Screen name="UpdatePasien" component={UpdatePasien} />
          <Stack.Screen 
            name="DeletePasien" 
            component={DeletePasien} 
            options={{ 
              presentation: 'transparentModal',
              animation: 'fade',
            }}
          />

          {/* Dental Record Routes */}
          <Stack.Screen name="TampilRecordAdmin" component={TampilRecordAdmin} />
          <Stack.Screen name="CreateRecordAdmin" component={CreateRecordAdmin} />

          {/* Kwitansi Routes */}
          <Stack.Screen name="TampilKwitansi" component={TampilKwitansi} />
          <Stack.Screen name="CreateKwitansi" component={CreateKwitansi} />
          <Stack.Screen name="PreviewKwitansi" component={PreviewKwitansi} />

          {/* Rujukan Routes */}
          <Stack.Screen name="TampilRujukan" component={TampilRujukan} />
          <Stack.Screen name="CreateRujukan" component={CreateRujukan} />
          <Stack.Screen name="PreviewRujukan" component={PreviewRujukan} />

          {/* Histori Routes */}
          <Stack.Screen name="TampilHistori" component={TampilHistori} />
        </Stack.Navigator>
      ) : (
        // STACK DOKTER
        <Stack.Navigator 
          id={undefined}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="MainDokter" component={MainDokter} />
          <Stack.Screen name="IsiRekamMedis" component={IsiRekamMedis} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
