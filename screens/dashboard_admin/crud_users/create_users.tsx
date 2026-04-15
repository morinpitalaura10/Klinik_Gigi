import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';

export function CreateUser() {
  const navigation = useNavigation<any>();

  // Form States
  const [namaUsers, setNamaUsers] = useState('');
  const [us, setUs] = useState('');
  const [pw, setPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [emailUsers, setEmailUsers] = useState('');
  const [role, setRole] = useState('');
  const [spesialisasi, setSpesialisasi] = useState('');

  const [loading, setLoading] = useState(false);

  const roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Dokter', value: 'dokter' },
  ];

  const spesialisasiOptions = [
    { label: 'Umum', value: 'Umum' },
    { label: 'Ortodental', value: 'Ortodental' },
  ];

  const handleSave = async () => {
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
      const { data: newUser, error: userError } = await supabase
        .from('tb_users')
        .insert({
          nama_users: namaUsers,
          us: us,
          pw: pw,
          email_users: emailUsers,
          role: role,
          spesialisasi: role === 'dokter' ? spesialisasi : null
        })
        .select()
        .single();

      if (userError) throw userError;

      // Handle tb_dokter if role is dokter
      if (role === 'dokter' && newUser) {
        const { error: docError } = await supabase
          .from('tb_dokter')
          .insert({
            user_id: newUser.id_users,
            nama: namaUsers,
            email_users: emailUsers,
            spesialisasi: spesialisasi
          });
        if (docError) throw docError;
      }

      Alert.alert('Berhasil', 'Pengguna baru berhasil ditambahkan.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Gagal Menyimpan', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      customLeftTitle="Tambah Pengguna"
      customRightTitle="Manajemen User"
      noScroll={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={LayoutStyles.flex1}
      >
        <ScrollView contentContainerStyle={LayoutStyles.scrollContent}>
          <View style={GlobalStyles.formCard}>
            <Text style={GlobalStyles.formSectionTitle}>TAMBAH INFORMASI AKUN</Text>
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
              label="Password"
              placeholder="Masukkan password"
              value={pw}
              onChangeText={setPw}
            />

            <PasswordInput
              label="Konfirmasi Password"
              placeholder="Konfirmasi password"
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
                title={loading ? "Menyimpan..." : "Tambah"}
                onPress={handleSave}
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
