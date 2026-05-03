import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import PasswordInput from '../../../components/molecules/PasswordInput';
import DropdownInput from '../../../components/molecules/DropdownInput';
import PrimaryButton from '../../../components/atoms/PrimaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';

export function UpdateUser() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { editUser } = route.params;


  const [namaUsers, setNamaUsers] = useState(editUser?.nama_users || '');
  const [us, setUs] = useState(editUser?.us || '');
  const [pw, setPw] = useState(editUser?.pw || '');
  const [confirmPw, setConfirmPw] = useState(editUser?.pw || '');
  const [emailUsers, setEmailUsers] = useState(editUser?.email_users || '');
  const [role, setRole] = useState(editUser?.role || '');
  const [spesialisasi, setSpesialisasi] = useState(editUser?.spesialisasi || '');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editUser?.role.toLowerCase() === 'dokter') {
      fetchDoctorInfo();
    }
  }, [editUser]);

  const fetchDoctorInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('tb_dokter')
        .select('spesialisasi')
        .eq('user_id', editUser.id_users)
        .maybeSingle();

      if (data) setSpesialisasi(data.spesialisasi);
    } catch (e) {
      console.log("Not a doctor or no doctor info found");
    }
  };

  const roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Dokter', value: 'dokter' },
  ];

  const spesialisasiOptions = [
    { label: 'Umum', value: 'Umum' },
    { label: 'Ortodental', value: 'Ortodental' },
  ];

  const handleUpdate = async () => {
    if (!namaUsers || !us || !pw || !emailUsers || !role) {
      Alert.alert('Peringatan', 'Harap isi semua kolom yang wajib!');
      return;
    }

    if (pw !== confirmPw) {
      Alert.alert('Peringatan', 'Konfirmasi password tidak cocok!');
      return;
    }

    if (role === 'dokter' && !spesialisasi) {
      Alert.alert('Peringatan', 'Harap pilih spesialisasi untuk dokter!');
      return;
    }

    setLoading(true);

    try {
       const { error: userError } = await supabase
        .from('tb_users')
        .update({
          nama_users: namaUsers,
          us: us,
          pw: pw,
          email_users: emailUsers,
          role: role
        })
        .eq('id_users', editUser.id_users);

      if (userError) throw userError;


      if (role === 'dokter') {
        const { data: existingDoc } = await supabase
          .from('tb_dokter')
          .select('user_id')
          .eq('user_id', editUser.id_users)
          .maybeSingle();

        if (existingDoc) {
          await supabase.from('tb_dokter').update({
            nama: namaUsers,
            email_users: emailUsers,
            spesialisasi: spesialisasi
          }).eq('user_id', editUser.id_users);
        } else {
          await supabase.from('tb_dokter').insert({
            user_id: editUser.id_users,
            nama: namaUsers,
            email_users: emailUsers,
            spesialisasi: spesialisasi
          });
        }
      } else if (editUser.role === 'dokter' && role !== 'dokter') {
        await supabase.from('tb_dokter').delete().eq('user_id', editUser.id_users);
      }

      Alert.alert('Berhasil', 'Data pengguna berhasil diperbarui.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Gagal Memperbarui', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      customLeftTitle="Ubah Pengguna"
      customRightTitle="Manajemen User"
      noScroll={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={LayoutStyles.flex1}
      >
        <ScrollView contentContainerStyle={CreateRecordStyles.mainContainer} showsVerticalScrollIndicator={false}>
          <View style={CreateRecordStyles.card}>
            <Text style={CreateRecordStyles.cardTitle}>UBAH INFORMASI AKUN</Text>
            <View style={CreateRecordStyles.divider} />

            <Text style={CreateRecordStyles.fieldLabel}>Nama Lengkap</Text>
            <LabeledInput
              label=""
              placeholder="Masukkan nama lengkap pengguna"
              value={namaUsers}
              onChangeText={setNamaUsers}
              hideLabel={true}
              style={CreateRecordStyles.inputDropdown}
            />

            <View style={[LayoutStyles.flexRow, LayoutStyles.gap15]}>
              <View style={LayoutStyles.flex1}>
                <Text style={CreateRecordStyles.fieldLabel}>Username</Text>
                <LabeledInput
                  label=""
                  placeholder="Contoh: dr.Budi"
                  value={us}
                  onChangeText={setUs}
                  autoCapitalize="none"
                  hideLabel={true}
                  style={CreateRecordStyles.inputDropdown}
                />
              </View>
              <View style={LayoutStyles.flex1}>
                <Text style={CreateRecordStyles.fieldLabel}>Role</Text>
                <DropdownInput
                  label=""
                  options={roleOptions}
                  selectedValue={role}
                  onValueChange={setRole}
                  placeholder="Pilih role..."
                  hideLabel={true}
                  buttonStyle={CreateRecordStyles.inputDropdown}
                />
              </View>
            </View>

            {role === 'dokter' && (
               <View>
                 <Text style={CreateRecordStyles.fieldLabel}>Spesialisasi Dokter</Text>
                 <DropdownInput
                   label=""
                   options={spesialisasiOptions}
                   selectedValue={spesialisasi}
                   onValueChange={setSpesialisasi}
                   placeholder="Pilih spesialisasi..."
                   hideLabel={true}
                   buttonStyle={CreateRecordStyles.inputDropdown}
                 />
               </View>
            )}

            <Text style={CreateRecordStyles.fieldLabel}>Password Baru (Opsional)</Text>
            <PasswordInput
              label=""
              placeholder="Masukkan password baru"
              value={pw}
              onChangeText={setPw}
              hideLabel={true}
              innerContainerStyle={CreateRecordStyles.inputDropdown}
            />

            <Text style={CreateRecordStyles.fieldLabel}>Konfirmasi Password Baru</Text>
            <PasswordInput
              label=""
              placeholder="Konfirmasi password baru"
              value={confirmPw}
              onChangeText={setConfirmPw}
              hideLabel={true}
              innerContainerStyle={CreateRecordStyles.inputDropdown}
            />

            <Text style={CreateRecordStyles.fieldLabel}>Email</Text>
            <LabeledInput
              label=""
              placeholder="Masukkan email pengguna"
              value={emailUsers}
              onChangeText={setEmailUsers}
              keyboardType="email-address"
              autoCapitalize="none"
              hideLabel={true}
              style={CreateRecordStyles.inputDropdown}
            />

            <View style={CreateRecordStyles.btnSimpanContainer}>
              <TouchableOpacity
                style={CreateRecordStyles.btnSimpan}
                onPress={handleUpdate}
                disabled={loading}
              >
                <Text style={CreateRecordStyles.btnSimpanText}>
                  {loading ? 'Memperbarui...' : 'Simpan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AdminLayout>
  );
}
