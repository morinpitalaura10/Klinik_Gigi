import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../../utils/supabase';
import { Colors, GlobalStyles } from '../../../styles/GlobalStyles';
import { useNavigation, useRoute } from '@react-navigation/native';

export function DeleteTindakan() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { id, name } = route.params as { id: string | number; name: string };
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tb_tindakan')
        .delete()
        .eq('id_tindakan', id);

      if (error) throw error;

      Alert.alert('Berhasil', 'Data tindakan berhasil dihapus.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Gagal Menghapus', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={GlobalStyles.modalBackdrop}>
      <View style={GlobalStyles.modalBox}>
        <Text style={GlobalStyles.modalText}>
          Apakah Anda yakin ingin menghapus tindakan "{name}"?
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
            <Text style={GlobalStyles.btnModalText}>
              {loading ? 'Menghapus...' : 'Hapus'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
