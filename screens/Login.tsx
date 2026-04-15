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
import CryptoJS from 'crypto-js';
import { LayoutStyles } from '../styles/GlobalStyles';

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

    const hashedPassword = CryptoJS.MD5(password).toString();

    // 2. Panggil RPC ke Supabase dengan password ter-hash (MD5)
    let { data, error } = await supabase
      .rpc('check_custom_login', {
        input_us: username,
        input_pw: hashedPassword
      });

    // Fallback: Jika pengguna belum di-hash di database, coba dengan plaintext 
    // agar tidak 'gagal login terus'
    if (!data || data.length === 0) {
      const fallback = await supabase
        .rpc('check_custom_login', {
          input_us: username,
          input_pw: password
        });
      data = fallback.data;
      if (fallback.error) error = fallback.error;
    }

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
    const rawData = data[0];
    const userId = rawData.id || rawData.id_users; // Handle both 'id' and 'id_users'

    // 6. JEMPUT DATA LENGKAP (Termasuk Spesialisasi dari tb_dokter)
    const { data: fullUserData, error: profileError } = await supabase
      .from('tb_users')
      .select(`
        *,
        tb_dokter (spesialisasi)
      `)
      .eq('id_users', userId)
      .single();

    if (profileError || !fullUserData) {
      console.log("Gagal ambil profil lengkap, pakai data login saja");
    }

    const userData = fullUserData || rawData;
    const userRole = userData.role.toLowerCase();
    
    // Ambil spesialisasi dari nested object tb_dokter
    const spesialisasi = userData.spesialisasi || (userData.tb_dokter && userData.tb_dokter[0]?.spesialisasi) || (userData.tb_dokter?.spesialisasi);

    console.log("Profil Lengkap Berhasil Dimuat:", { ...userData, spesialisasi });

    // 7. Simpan ke Global State (AuthContext)
    login({
      id_users: userId,
      username: username,
      nama: userData.nama_users || "User",
      role: userRole as any,
      spesialisasi: spesialisasi 
    });

    // Notifikasi khusus jika bukan admin
    if (userRole !== 'admin') {
      alert(`Selamat datang, ${userData.nama || 'User'} (${userRole})`);
    }
  };

  return (
    <AuthTemplate>
      <Header style={LayoutStyles.mb40}>LOGIN PENGGUNA</Header>

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
        variant="login"
      />

      <CaptchaBox
        isChecked={isCaptchaChecked}
        onValidChange={setIsCaptchaChecked}
      />

      <PrimaryButton
        title="Masuk"
        onPress={handleLogin}
        style={[LayoutStyles.w50p, LayoutStyles.alignSelfCenter]}
      />
    </AuthTemplate>
  );
}
