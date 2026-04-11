import React, { useState, useContext } from 'react';
import { supabase } from '../utils/supabase';
import { AuthContext } from '../context/AuthContext';

// Meng-import semua komponen atomic
import Header from '../components/atoms/Header';
import PrimaryButton from '../components/atoms/PrimaryButton';
import LabeledInput from '../components/molecules/LabeledInput';
import PasswordInput from '../components/molecules/PasswordInput';
import CaptchaBox from '../components/molecules/CaptchaBox';
import AuthTemplate from '../components/templates/AuthTemplate';

export default function Login({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isCaptchaChecked, setIsCaptchaChecked] = useState(false);

  // Ambil fungsi login dari AuthContext
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    // 1. Validasi Input Dasar
    if (!username || !password) {
      alert("Tolong isi username dan password!");
      return;
    }
    if (!isCaptchaChecked) {
      alert("Jangan lupa centang captcha 'Saya bukan robot'!");
      return;
    }

    console.log("Mencoba login untuk:", username);

    // 2. Panggil RPC ke Supabase (Menuju tb_users)
    const { data, error } = await supabase
      .rpc('check_custom_login', {
        input_us: username,
        input_pw: password
      });

    // 3. Tangani Error Query/Koneksi
    if (error) {
      console.error("Supabase Error:", error);
      alert(`Gagal: ${error.message}\n(Pastikan Tabel & RPC sesuai di Supabase)`);
      return;
    }

    // 4. Cek apakah data ditemukan
    if (!data || data.length === 0) {
      alert("Login Gagal: Username atau password salah!");
      return;
    }

    // 5. Ambil data dari baris pertama hasil query
    const userData = data[0];
    const userRole = userData.role.toLowerCase(); // Pastikan huruf kecil semua

    console.log("Login Berhasil! Data:", userData);

    // 6. Simpan ke Global State (AuthContext)
    login({
      username: username,
      nama: userData.nama_users || "User",
      role: userRole as any
    });

    // Notifikasi khusus jika bukan admin
    if (userRole !== 'admin') {
      alert(`Selamat datang, ${userData.nama || 'User'} (${userRole})`);
    }
  };

  return (
    <AuthTemplate>
      <Header style={{ marginBottom: 40 }}>LOGIN PENGGUNA</Header>

      <LabeledInput
        label="Username"
        placeholder="Masukkan username Anda"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        variant="login"
      />

      <PasswordInput
        label="Password"
        placeholder="Masukkan password Anda"
        value={password}
        onChangeText={setPassword}
      />

      <CaptchaBox
        isChecked={isCaptchaChecked}
        onPress={() => setIsCaptchaChecked(!isCaptchaChecked)}
      />

      <PrimaryButton
        title="Masuk"
        onPress={handleLogin}
        style={{ width: '50%', alignSelf: 'center' }}
      />
    </AuthTemplate>
  );
}
