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
import PasswordInput from '../../../components/molecules/PasswordInput';
import DropdownInput from '../../../components/molecules/DropdownInput';
import PrimaryButton from '../../../components/atoms/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { useAlert } from '../../../context/AlertContext';

export function CreateUser() {
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();

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
    { label: 'Umum', value: 'umum' },
    { label: 'Ortodonti', value: 'ortodonti' },
  ];

  const handleSave = async () => {
    if (!namaUsers.trim()) {
      showAlert({ title: 'Nama Kosong', message: 'Harap isi nama lengkap pengguna.', type: 'warning' });
      return;
    }
    if (!us.trim()) {
      showAlert({ title: 'Username Kosong', message: 'Harap isi username untuk login.', type: 'warning' });
      return;
    }
    if (!pw || pw.length < 6) {
      showAlert({ title: 'Password Lemah', message: 'Password minimal harus 6 karakter.', type: 'warning' });
      return;
    }
    if (pw !== confirmPw) {
      showAlert({ title: 'Password Tidak Cocok', message: 'Konfirmasi password harus sama dengan password.', type: 'warning' });
      return;
    }
    if (!emailUsers.includes('@')) {
      showAlert({ title: 'Email Tidak Valid', message: 'Harap masukkan format email yang benar.', type: 'warning' });
      return;
    }
    if (!role) {
      showAlert({ title: 'Role Kosong', message: 'Harap pilih role (Admin atau Dokter).', type: 'warning' });
      return;
    }
    if (role === 'dokter' && !spesialisasi) {
      showAlert({ title: 'Spesialisasi Kosong', message: 'Harap pilih spesialisasi untuk akun Dokter.', type: 'warning' });
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
          role: role
        })
        .select()
        .single();

      if (userError) throw userError;

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

      showAlert({ title: 'Berhasil', message: 'Pengguna baru berhasil ditambahkan ke database.', type: 'success', onConfirm: () => navigation.goBack() });
    } catch (error: any) {
      let msg = error?.message || 'Gagal menyimpan data pengguna.';
      if (msg.toLowerCase().includes('unique')) {
        msg = 'Username atau Email sudah digunakan oleh akun lain.';
      }
      showAlert({ title: 'Gagal Menyimpan', message: msg, type: 'error' });
      console.error('Save User Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout noScroll={true} customRightTitle="Admin">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={LayoutStyles.flex1}
      >
        <ScrollView contentContainerStyle={CreateRecordStyles.mainContainer} showsVerticalScrollIndicator={false}>
          <View style={CreateRecordStyles.card}>
            <Text style={CreateRecordStyles.cardTitle}>INFORMASI AKUN</Text>
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

            <Text style={CreateRecordStyles.fieldLabel}>Password</Text>
            <PasswordInput
              label=""
              placeholder="Masukkan password"
              value={pw}
              onChangeText={setPw}
              hideLabel={true}
              innerContainerStyle={CreateRecordStyles.inputDropdown}
            />

            <Text style={CreateRecordStyles.fieldLabel}>Konfirmasi Password</Text>
            <PasswordInput
              label=""
              placeholder="Konfirmasi password"
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
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={CreateRecordStyles.btnSimpanText}>
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AdminLayout>
  );
}
