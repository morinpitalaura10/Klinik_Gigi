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
import { GlobalStyles, LayoutStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import LabeledInput from '../../../components/molecules/LabeledInput';
import DropdownInput from '../../../components/molecules/DropdownInput';
import DatePickerInput from '../../../components/molecules/DatePickerInput';
import PrimaryButton from '../../../components/atoms/PrimaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';

export function UpdatePasien() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { editItem } = route.params as { editItem: any };

    const [nama, setNama] = useState(editItem?.nama_pasien || '');
    const [tglLahir, setTglLahir] = useState(editItem?.tgl_lahir || '');
    const [jk, setJk] = useState(editItem?.jk || '');
    const [alamat, setAlamat] = useState(editItem?.alamat || '');
    const [pekerjaan, setPekerjaan] = useState(editItem?.pekerjaan || '');
    const [nope, setNope] = useState(editItem?.nope || '');
    const [alergi, setAlergi] = useState(editItem?.alergi_obat || '');
    
    const [loading, setLoading] = useState(false);

    const jkOptions = [
        { label: 'Laki-laki', value: 'Laki-laki' },
        { label: 'Perempuan', value: 'Perempuan' },
    ];

    const handleUpdate = async () => {
        if (!nama || !tglLahir || !jk || !nope || !alamat) {
            Alert.alert('Peringatan', 'Harap isi kolom wajib!');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('tb_pasien')
                .update({
                    nama_pasien: nama,
                    tgl_lahir: tglLahir,
                    jk: jk,
                    alamat: alamat,
                    pekerjaan: pekerjaan,
                    nope: nope,
                    alergi_obat: alergi
                })
                .eq('id_pasien', editItem.id_pasien);

            if (error) throw error;

            Alert.alert('Berhasil', 'Data pasien berhasil diperbarui.');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Gagal Memperbarui', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            noScroll={true}
            customRightTitle="Manajemen Pasien"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={LayoutStyles.flex1}
            >
                <ScrollView contentContainerStyle={LayoutStyles.scrollContent}>
                    <View style={GlobalStyles.formCard}>
                        <Text style={GlobalStyles.formSectionTitle}>UBAH DATA PASIEN</Text>
                        <View style={GlobalStyles.formDivider} />

                        <LabeledInput
                            label="Nama Pasien"
                            placeholder="Masukkan nama lengkap"
                            value={nama}
                            onChangeText={setNama}
                        />

                        <View style={LayoutStyles.rowBetween}>
                            <View style={LayoutStyles.w50p}>
                                <DatePickerInput
                                    label="Tanggal Lahir"
                                    value={tglLahir}
                                    onChange={setTglLahir}
                                />
                            </View>
                            <View style={[LayoutStyles.w50p, { paddingLeft: 10 }]}>
                                <DropdownInput
                                    label="Jenis Kelamin"
                                    options={jkOptions}
                                    selectedValue={jk}
                                    onValueChange={setJk}
                                />
                            </View>
                        </View>

                        <LabeledInput
                            label="Nomor HP / WhatsApp"
                            placeholder="Contoh: 08123456789"
                            value={nope}
                            onChangeText={setNope}
                            keyboardType="phone-pad"
                        />

                        <LabeledInput
                            label="Pekerjaan"
                            placeholder="Contoh: Pegawai Swasta"
                            value={pekerjaan}
                            onChangeText={setPekerjaan}
                        />

                        <LabeledInput
                            label="Alamat Lengkap"
                            placeholder="Masukkan alamat tinggal"
                            value={alamat}
                            onChangeText={setAlamat}
                            multiline={true}
                            numberOfLines={3}
                        />

                        <LabeledInput
                            label="Riwayat Alergi Obat"
                            placeholder="Tulis '-' jika tidak ada"
                            value={alergi}
                            onChangeText={setAlergi}
                        />

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
