import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';


import Login from '../screens/Login';
import MainAdmin from '../screens/dashboard_admin/main_admin';


import { TampilUsers } from '../screens/dashboard_admin/crud_users/tampil_users';
import { CreateUser } from '../screens/dashboard_admin/crud_users/create_users';
import { ReadUser } from '../screens/dashboard_admin/crud_users/read_users';
import { UpdateUser } from '../screens/dashboard_admin/crud_users/update_users';
import { DeleteUser } from '../screens/dashboard_admin/crud_users/delete_users';


import { TampilTindakan } from '../screens/dashboard_admin/crud_tindakan/tampil_tindakan';
import { CreateTindakan } from '../screens/dashboard_admin/crud_tindakan/create_tindakan';
import { UpdateTindakan } from '../screens/dashboard_admin/crud_tindakan/update_tindakan';
import { DeleteTindakan } from '../screens/dashboard_admin/crud_tindakan/delete_tindakan';


import { TampilPasien } from '../screens/dashboard_admin/crud_pasien/tampil_datapasien';
import { CreatePasien } from '../screens/dashboard_admin/crud_pasien/create_datapasien';
import { ReadPasien } from '../screens/dashboard_admin/crud_pasien/read_datapasien';
import { UpdatePasien } from '../screens/dashboard_admin/crud_pasien/update_datapasien';
import { DeletePasien } from '../screens/dashboard_admin/crud_pasien/delete_datapasien';


import { TampilRecordAdmin } from '../screens/dashboard_admin/dental_record/tampil_record_admin';
import { CreateRecordAdmin } from '../screens/dashboard_admin/dental_record/create_record_admin';


import MainDokter from '../screens/dashboard_dokter/main_dokter';
import { IsiRekamMedis } from '../screens/dashboard_dokter/isi_rekam_medis';


import { TampilKwitansi } from '../screens/dashboard_admin/crud_kwitansi/tampil_kwitansi';
import { ListPendingKwitansi } from '../screens/dashboard_admin/crud_kwitansi/list_pending_kwitansi';
import { CreateKwitansi } from '../screens/dashboard_admin/crud_kwitansi/create_kwitansi';
import { PreviewKwitansi } from '../screens/dashboard_admin/crud_kwitansi/preview_kwitansi';


import { TampilRujukan } from '../screens/dashboard_admin/crud_rujukan/tampil_rujukan';
import { CreateRujukan } from '../screens/dashboard_admin/crud_rujukan/create_rujukan';
import { PreviewRujukan } from '../screens/dashboard_admin/crud_rujukan/preview_rujukan';


import { TampilHistori } from '../screens/dashboard_admin/histori/tampil_histori';


export type RootStackParamList = {
  Login: undefined;
  MainAdmin: undefined;
  TampilUsers: undefined;
  CreateUser: undefined;
  UpdateUser: { editUser: any };
  ReadUser: { id: string | number };
  DeleteUser: { id: string | number, name: string };

  TampilTindakan: undefined;
  CreateTindakan: undefined;
  UpdateTindakan: { editItem: any };
  DeleteTindakan: { id: string | number, name: string };

  TampilPasien: undefined;
  CreatePasien: undefined;
  ReadPasien: { id: string | number };
  UpdatePasien: { editItem: any };
  DeletePasien: { id: string | number, name: string };

  TampilRecordAdmin: undefined;
  CreateRecordAdmin: { editItem?: any };

  MainDokter: undefined;
  IsiRekamMedis: { record: any };

  TampilKwitansi: undefined;
  ListPendingKwitansi: undefined;
  CreateKwitansi: { record: any };
  PreviewKwitansi: { item: any };

  TampilRujukan: undefined;
  CreateRujukan: { record: any };
  PreviewRujukan: { item: any };

  TampilHistori: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {!user ? (

        <Stack.Navigator 
          id={undefined}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
      ) : user.role === 'admin' ? (

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

          
          <Stack.Screen name="TampilRecordAdmin" component={TampilRecordAdmin} />
          <Stack.Screen name="CreateRecordAdmin" component={CreateRecordAdmin} />

          
          <Stack.Screen name="TampilKwitansi" component={TampilKwitansi} />
          <Stack.Screen name="ListPendingKwitansi" component={ListPendingKwitansi} />
          <Stack.Screen name="CreateKwitansi" component={CreateKwitansi} />
          <Stack.Screen name="PreviewKwitansi" component={PreviewKwitansi} />

          
          <Stack.Screen name="TampilRujukan" component={TampilRujukan} />
          <Stack.Screen name="CreateRujukan" component={CreateRujukan} />
          <Stack.Screen name="PreviewRujukan" component={PreviewRujukan} />

          
          <Stack.Screen name="TampilHistori" component={TampilHistori} />
        </Stack.Navigator>
      ) : (

        <Stack.Navigator 
          id={undefined}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="MainDokter" component={MainDokter} />
          <Stack.Screen name="IsiRekamMedis" component={IsiRekamMedis} />
          <Stack.Screen name="ReadPasien" component={ReadPasien} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
