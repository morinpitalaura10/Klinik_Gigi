import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { supabase } from '../../../utils/supabase';
import { Colors, GlobalStyles, LayoutStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import LabeledInput from '../../../components/molecules/LabeledInput';
import PrimaryButton from '../../../components/atoms/PrimaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';

export function UpdateTindakan() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { editItem } = route.params as { editItem: any };

  const [namaTindakan, setNamaTindakan] = useState(editItem?.nama_tindakan || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!namaTindakan) {
      Alert.alert('Peringatan', 'Harap isi nama tindakan!');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('tb_tindakan')
        .update({
          nama_tindakan: namaTindakan
        })
        .eq('id_tindakan', editItem.id_tindakan);

      if (error) throw error;

      Alert.alert('Berhasil', 'Data tindakan berhasil diperbarui.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Gagal Memperbarui', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      activeTab="beranda"
      noScroll={true}
      customRightTitle="Manajemen Tindakan"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={LayoutStyles.scrollContent}>
          <View style={GlobalStyles.formCard}>
            <Text style={GlobalStyles.formSectionTitle}>UBAH INFORMASI TINDAKAN</Text>
            <View style={GlobalStyles.formDivider} />

            <LabeledInput
              label="Nama Tindakan"
              placeholder="Masukkan nama tindakan"
              value={namaTindakan}
              onChangeText={setNamaTindakan}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
              <TouchableOpacity
                style={GlobalStyles.btnBatal}
                onPress={() => navigation.goBack()}
              >
                <Text style={GlobalStyles.btnBatalText}>Batal</Text>
              </TouchableOpacity>

              <PrimaryButton
                title={loading ? "Memperbarui..." : "Simpan"}
                onPress={handleUpdate}
                style={GlobalStyles.btnSimpan}
                disabled={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AdminLayout>
  );
}
