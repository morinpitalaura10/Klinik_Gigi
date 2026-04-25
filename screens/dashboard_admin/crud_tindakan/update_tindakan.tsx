import React, { useState } from 'react';
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
import { Colors, GlobalStyles, LayoutStyles, CreateRecordStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import LabeledInput from '../../../components/molecules/LabeledInput';
import DropdownInput from '../../../components/molecules/DropdownInput';
import PrimaryButton from '../../../components/atoms/PrimaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';

export function UpdateTindakan() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { editItem } = route.params as { editItem: any };

  const [namaTindakan, setNamaTindakan] = useState(editItem?.nama_tindakan || '');
  const [layanan, setLayanan] = useState(editItem?.layanan || '');
  const [loading, setLoading] = useState(false);

  const layananOptions = [
    { label: 'Umum', value: 'Umum' },
    { label: 'Ortodental', value: 'Ortodental' },
  ];

  const handleUpdate = async () => {
    if (!namaTindakan || !layanan) {
      Alert.alert('Peringatan', 'Harap isi nama tindakan dan pilih kategori!');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('tb_tindakan')
        .update({
          nama_tindakan: namaTindakan,
          layanan: layanan
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
    <AdminLayout noScroll={true} customRightTitle="Manajemen Tindakan">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={LayoutStyles.flex1}>
        <ScrollView contentContainerStyle={CreateRecordStyles.mainContainer} showsVerticalScrollIndicator={false}>
          
          <View style={CreateRecordStyles.card}>
            <Text style={CreateRecordStyles.cardTitle}>UBAH INFORMASI TINDAKAN</Text>
            <View style={CreateRecordStyles.divider} />

            <View style={{ flexDirection: 'row', gap: 20 }}>
                <View style={{ flex: 1 }}>
                    <Text style={CreateRecordStyles.fieldLabel}>Nama Tindakan</Text>
                    <LabeledInput
                        label=""
                        placeholder="Masukkan nama tindakan"
                        value={namaTindakan}
                        onChangeText={setNamaTindakan}
                        hideLabel={true}
                        style={CreateRecordStyles.inputDropdown}
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={CreateRecordStyles.fieldLabel}>Kategori Perawatan</Text>
                    <DropdownInput
                        label=""
                        placeholder="Pilih kategori..."
                        options={layananOptions}
                        selectedValue={layanan}
                        onValueChange={setLayanan}
                        hideLabel={true}
                        buttonStyle={CreateRecordStyles.inputDropdown}
                    />
                </View>
            </View>
          </View>

          <View style={[LayoutStyles.rowEnd, { marginTop: 15 }]}>
            <PrimaryButton
                title={loading ? "Memperbarui..." : "Simpan"}
                onPress={handleUpdate}
                style={[GlobalStyles.btnSimpan, { paddingHorizontal: 30 }]}
                disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AdminLayout>
  );
}
