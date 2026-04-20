import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { supabase } from '../../../utils/supabase';
import { GlobalStyles } from '../../../styles/GlobalStyles';
import { useNavigation, useRoute } from '@react-navigation/native';

export function DeleteUser() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id, name } = route.params;

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {

      const { data: user, error: userFetchError } = await supabase
        .from('tb_users')
        .select('role')
        .eq('id_users', id)
        .single();
      
      if (userFetchError) throw userFetchError;


      if (user?.role.toLowerCase() === 'dokter') {
        await supabase.from('tb_dokter').delete().eq('user_id', id);
      }


      const { error } = await supabase
        .from('tb_users')
        .delete()
        .eq('id_users', id);

      if (error) throw error;


      navigation.goBack();


    } catch (error: any) {
      Alert.alert('Gagal Hapus', error.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={GlobalStyles.modalBackdrop}>
      <View style={GlobalStyles.modalBox}>
        <Text style={GlobalStyles.modalText}>
          Apakah anda yakin ingin menghapus{"\n"}data "{name}" ini?
        </Text>

        <View style={GlobalStyles.modalActionRow}>
          <TouchableOpacity 
            style={GlobalStyles.btnModalBatal}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={GlobalStyles.btnModalText}>Batal</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={GlobalStyles.btnModalHapus}
            onPress={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={GlobalStyles.btnModalText}>Hapus</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
