import React, { useState, useContext, useEffect } from 'react';
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
import { Text } from 'react-native';

export default function Login({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isCaptchaChecked, setIsCaptchaChecked] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  const { login } = useContext(AuthContext);
  const { showAlert } = useAlert();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutUntil) {
      interval = setInterval(() => {
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutUntil(null);
          setFailedAttempts(0);
          setCountdown(0);
        } else {
          setCountdown(remaining);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleLogin = async () => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      showAlert({ title: 'Terkunci', message: `Terlalu banyak percobaan gagal. Silakan tunggu ${countdown} detik.`, type: 'error' });
      return;
    }

    if (!username && !password) {
      showAlert({ title: 'Peringatan', message: 'Harap isi username dan password!', type: 'warning' });
      return;
    }
    if (!username) {
      showAlert({ title: 'Peringatan', message: 'Harap isi username!', type: 'warning' });
      return;
    }
    if (!password) {
      showAlert({ title: 'Peringatan', message: 'Harap isi password!', type: 'warning' });
      return;
    }

    if (!isCaptchaChecked) {
      if (!captchaValue) {
        showAlert({ title: 'Captcha', message: 'Harap isi kode captcha!', type: 'warning' });
      } else {
        showAlert({ title: 'Captcha', message: 'Kode captcha tidak sesuai!', type: 'warning' });
      }
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
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        const lockoutTime = Date.now() + 30000; // 30 seconds
        setLockoutUntil(lockoutTime);
        setCountdown(30);
        showAlert({ title: 'Terkunci Sementara', message: 'Anda telah gagal login 5 kali. Silakan tunggu 30 detik untuk mencoba lagi.', type: 'error' });
      } else {
        showAlert({ title: 'Gagal', message: `Username atau password salah! (Percobaan gagal: ${newAttempts}/5)`, type: 'error' });
      }
      return;
    }

    // Success login, reset attempts
    setFailedAttempts(0);
    setLockoutUntil(null);

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

    showAlert({
      title: 'Login Berhasil',
      message: `Selamat datang, ${userData.nama_users || userData.nama || 'Admin'} (${userRole})`,
      type: 'success'
    });
  };

  const isLockedOut = lockoutUntil !== null && countdown > 0;

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
        editable={!isLockedOut}
      />

      <PasswordInput
        label="Password"
        placeholder="Masukkan password Anda"
        value={password}
        onChangeText={setPassword}
        variant="login"
        editable={!isLockedOut}
      />

      <CaptchaBox
        isChecked={isCaptchaChecked}
        onValidChange={(isValid, val) => {
          setIsCaptchaChecked(isValid);
          if (val !== undefined) setCaptchaValue(val);
        }}
      />

      {isLockedOut && (
        <Text style={{ color: '#EF4444', textAlign: 'center', marginBottom: 15, fontWeight: 'bold' }}>
          Terkunci sementara. Coba lagi dalam {countdown} detik.
        </Text>
      )}

      <PrimaryButton
        title={isLockedOut ? `Tunggu (${countdown}s)` : "Masuk"}
        onPress={handleLogin}
        disabled={isLockedOut}
        style={[LayoutStyles.w50p, LayoutStyles.alignSelfCenter, isLockedOut && { backgroundColor: '#94A3B8' }]}
      />
    </AuthTemplate>
  );
}
