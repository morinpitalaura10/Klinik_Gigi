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
import { Colors, GlobalStyles, LayoutStyles } from '../../../styles/GlobalStyles';
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
          role: role,
          spesialisasi: role === 'dokter' ? spesialisasi : null
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
        <ScrollView contentContainerStyle={LayoutStyles.scrollContent}>
          <View style={GlobalStyles.formCard}>
            <Text style={GlobalStyles.formSectionTitle}>UBAH INFORMASI AKUN</Text>
            <View style={GlobalStyles.formDivider} />

            <LabeledInput
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap pengguna"
              value={namaUsers}
              onChangeText={setNamaUsers}
            />

            <LabeledInput
              label="Username"
              placeholder="Contoh: dr.Budi"
              value={us}
              onChangeText={setUs}
              autoCapitalize="none"
            />

            <PasswordInput
              label="Password Baru (Opsional)"
              placeholder="Masukkan password baru"
              value={pw}
              onChangeText={setPw}
            />

            <PasswordInput
              label="Konfirmasi Password Baru"
              placeholder="Konfirmasi password baru"
              value={confirmPw}
              onChangeText={setConfirmPw}
            />

            <LabeledInput
              label="Email"
              placeholder="Masukkan email pengguna"
              value={emailUsers}
              onChangeText={setEmailUsers}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <DropdownInput
              label="Role"
              options={roleOptions}
              selectedValue={role}
              onValueChange={setRole}
              placeholder="Pilih role pengguna..."
            />

            {role === 'dokter' && (
              <DropdownInput
                label="Spesialisasi Dokter"
                options={spesialisasiOptions}
                selectedValue={spesialisasi}
                onValueChange={setSpesialisasi}
                placeholder="Pilih spesialisasi..."
              />
            )}

            <View style={[LayoutStyles.rowEnd, LayoutStyles.mt20]}>
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
