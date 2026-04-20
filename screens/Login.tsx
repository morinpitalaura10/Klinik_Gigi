import React, { useState, useContext } from 'react';
import { useAlert } from '../context/AlertContext';
import { supabase } from '../utils/supabase';
import { AuthContext } from '../context/AuthContext';


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


  const { login } = useContext(AuthContext);
  const { showAlert } = useAlert();

  const handleLogin = async () => {

    if (!username || !password) {
      showAlert({ title: 'Peringatan', message: 'Tolong isi username dan password!', type: 'warning' });
      return;
    }
    if (!isCaptchaChecked) {
      showAlert({ title: 'Captcha', message: "Jangan lupa centang captcha 'Saya bukan robot'!", type: 'warning' });
      return;
    }

    console.log("Mencoba login untuk:", username);

    const hashedPassword = CryptoJS.MD5(password).toString();


    let { data, error } = await supabase
      .rpc('check_custom_login', {
        input_us: username,
        input_pw: hashedPassword
      });



    if (!data || data.length === 0) {
      const fallback = await supabase
        .rpc('check_custom_login', {
          input_us: username,
          input_pw: password
        });
      data = fallback.data;
      if (fallback.error) error = fallback.error;
    }


    if (error) {
      console.error("Supabase Error:", error);
      showAlert({ title: 'Gagal Login', message: `Gagal: ${error.message}\n(Pastikan Tabel & RPC sesuai di Supabase)`, type: 'error' });
      return;
    }


    if (!data || data.length === 0) {
      showAlert({ title: 'Gagal', message: 'Login Gagal: Username atau password salah!', type: 'error' });
      return;
    }


    const rawData = data[0];
    const userId = rawData.id || rawData.id_users;


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
    

    const spesialisasi = userData.spesialisasi || (userData.tb_dokter && userData.tb_dokter[0]?.spesialisasi) || (userData.tb_dokter?.spesialisasi);

    console.log("Profil Lengkap Berhasil Dimuat:", { ...userData, spesialisasi });


    login({
      id_users: userId,
      username: username,
      nama: userData.nama_users || "User",
      role: userRole as any,
      spesialisasi: spesialisasi 
    });


    if (userRole !== 'admin') {
      showAlert({ title: 'Login Berhasil', message: `Selamat datang, ${userData.nama || 'User'} (${userRole})`, type: 'success' });
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
