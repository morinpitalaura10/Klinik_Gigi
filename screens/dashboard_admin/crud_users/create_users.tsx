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
import Header from '../../../components/atoms/Header';

export default function CreateUsers({ navigation, route }: any) {
  const editUser = route.params?.editUser;
  const isEditing = !!editUser;

  // Form States
  const [namaUsers, setNamaUsers] = useState(editUser?.nama_users || '');
  const [us, setUs] = useState(editUser?.us || '');
  const [pw, setPw] = useState(editUser?.pw || '');
  const [confirmPw, setConfirmPw] = useState(editUser?.pw || '');
  const [emailUsers, setEmailUsers] = useState(editUser?.email_users || '');
  const [role, setRole] = useState(editUser?.role || '');
  const [spesialisasi, setSpesialisasi] = useState(''); // Untuk tb_dokter

  const [loading, setLoading] = useState(false);

  // Fetch doctor data if editing a doctor
  useEffect(() => {
    if (isEditing && editUser.role.toLowerCase() === 'dokter') {
      fetchDoctorInfo();
    }
  }, [editUser]);

  const fetchDoctorInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('tb_dokter')
        .select('spesialisasi')
        .eq('user_id', editUser.id_users)
        .single();

      if (data) setSpesialisasi(data.spesialisasi);
    } catch (e) {
      console.log("Not a doctor or no doctor info found");
    }
  };

  const roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Dokter', value: 'dokter' },
    { label: 'Perawat', value: 'perawat' },
    { label: 'Resepsionis', value: 'resepsionis' },
  ];

  const spesialisasiOptions = [
    { label: 'Dokter Umum', value: 'umum' },
    { label: 'Dokter Ortodonti', value: 'ortodonti' },
  ];

  const handleSave = async () => {
    // 1. Validasi
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
      if (isEditing) {
        // UPDATE MODE
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

        // Handle tb_dokter
        if (role === 'dokter') {
          // Upsert doctor info
          const { error: docError } = await supabase
            .from('tb_dokter')
            .upsert({
              user_id: editUser.id_users,
              nama: namaUsers,
              email_users: emailUsers,
              spesialisasi: spesialisasi
            }, { onConflict: 'user_id' });
          if (docError) throw docError;
        } else if (editUser.role === 'dokter' && role !== 'dokter') {
          // If was doctor but now not, delete doctor record
          await supabase.from('tb_dokter').delete().eq('user_id', editUser.id_users);
        }

        Alert.alert('Berhasil', 'Data pengguna berhasil diperbarui.');
        navigation.goBack();
      } else {
        // CREATE MODE
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
      }
    } catch (error: any) {
      Alert.alert('Gagal Menyimpan', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout 
      activeTab="beranda" 
      customLeftTitle={isEditing ? 'Ubah Pengguna' : 'Tambah Pengguna'}
      customRightTitle="Manajemen User"
      noScroll={true}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={LayoutStyles.scrollContent}>
          <View style={GlobalStyles.formCard}>
            <Text style={GlobalStyles.formSectionTitle}>INFORMASI AKUN</Text>
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

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
              <TouchableOpacity 
                style={GlobalStyles.btnBatal}
                onPress={() => navigation.goBack()}
              >
                <Text style={GlobalStyles.btnBatalText}>Batal</Text>
              </TouchableOpacity>

              <PrimaryButton
                title={loading ? "Menyimpan..." : "Simpan"}
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
