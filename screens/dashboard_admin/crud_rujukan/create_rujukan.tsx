import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../../../utils/supabase';
import { GlobalStyles, LayoutStyles, Colors } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import LabeledInput from '../../../components/molecules/LabeledInput';
import DropdownInput from '../../../components/molecules/DropdownInput';
import PrimaryButton from '../../../components/atoms/PrimaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';

export function CreateRujukan() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { record } = route.params as { record: any };

    const [loading, setLoading] = useState(false);
    
    // Form States according to the UI Screenshot
    const [namaDokter, setNamaDokter] = useState(''); // Mapping to `ditujukan`
    const [namaPasien, setNamaPasien] = useState(record.tb_pasien?.nama_pasien || '');
    const [tgl, setTgl] = useState(new Date().toLocaleDateString('en-CA'));

    const calculateUmur = (tglLahir: string) => {
        if (!tglLahir) return '';
        try {
            const today = new Date();
            const birthDate = new Date(tglLahir);
            if (isNaN(birthDate.getTime())) return '';
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age.toString() + ' Tahun';
        } catch (e) {
            return '';
        }
    };

    const [jenisKelamin, setJenisKelamin] = useState(record.tb_pasien?.jk || 'Laki-laki');
    const [umur, setUmur] = useState(calculateUmur(record.tb_pasien?.tgl_lahir));
    const [alamat, setAlamat] = useState(record.tb_pasien?.alamat || '');
    const [keluhan, setKeluhan] = useState(record.keluhan || '');
    const [diagnosa, setDiagnosa] = useState(record.diagnosa || '');

    const genderOptions = [
        { label: 'Laki-laki', value: 'Laki-laki' },
        { label: 'Perempuan', value: 'Perempuan' }
    ];

    const handleSave = async () => {
        if (!namaDokter || !namaPasien) {
            Alert.alert('Peringatan', 'Harap isi Nama Dokter Tujuan dan Nama Pasien!');
            return;
        }

        setLoading(true);
        try {
            // Data to be saved strictly to tb_rujukan schema
            const rujukanData = {
                ditujukan: namaDokter,
                pasien_id: record.id_pasien,
                record_id: record.id_record,
                tgl: tgl,
                user_klinik: 'Admin Galeri Ortodental' // Modify if we have session details for users who created it
            };

            const { data, error } = await supabase
                .from('tb_rujukan')
                .insert(rujukanData)
                .select()
                .single();

            if (error) throw error;

            // Extra details for Preview printing which don't exist in tb_rujukan schema directly
            const fullItemForPreview = {
                ...data,
                detail_pasien: {
                    nama_pasien: namaPasien,
                    jenis_kelamin: jenisKelamin,
                    umur: umur,
                    alamat: alamat
                },
                detail_medis: {
                    keluhan: keluhan,
                    diagnosa: diagnosa
                },
                isOrto: record.layanan === 'Ortodental'
            };

            Alert.alert('Berhasil', 'Surat rujukan berhasil dibuat.', [
                { text: 'OK', onPress: () => navigation.navigate('PreviewRujukan', { item: fullItemForPreview }) }
            ]);
        } catch (error: any) {
            Alert.alert('Gagal', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout noScroll={true} customRightTitle="Form rujukan">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={LayoutStyles.flex1}
            >
                <ScrollView contentContainerStyle={LayoutStyles.scrollContent}>
                    <View style={GlobalStyles.formCard}>
                        
                        <LabeledInput
                            label="Nama Dokter"
                            placeholder="Masukkan nama Dokter Tujuan"
                            value={namaDokter}
                            onChangeText={setNamaDokter}
                        />

                        <LabeledInput
                            label="Nama Pasien"
                            placeholder="Masukkan nama pasien"
                            value={namaPasien}
                            onChangeText={setNamaPasien}
                        />

                        <LabeledInput
                            label="Tanggal"
                            placeholder="Masukkan tanggal rujukan (YYYY-MM-DD)"
                            value={tgl}
                            onChangeText={setTgl}
                        />

                        <DropdownInput
                            label="Jenis Kelamin"
                            options={genderOptions}
                            selectedValue={jenisKelamin}
                            onValueChange={setJenisKelamin}
                        />

                        <LabeledInput
                            label="Umur"
                            placeholder="Masukkan umur pasien"
                            value={umur}
                            onChangeText={setUmur}
                            keyboardType="numeric"
                        />

                        <LabeledInput
                            label="Alamat"
                            placeholder="Masukkan alamat pasien"
                            value={alamat}
                            onChangeText={setAlamat}
                            multiline={true}
                        />

                        <LabeledInput
                            label="Keluhan"
                            placeholder="Masukkan keluhan"
                            value={keluhan}
                            onChangeText={setKeluhan}
                            multiline={true}
                        />

                        <LabeledInput
                            label="Diagnosa"
                            placeholder="Masukkan diagnosa sementara"
                            value={diagnosa}
                            onChangeText={setDiagnosa}
                            multiline={true}
                        />

                        <View style={[LayoutStyles.rowEnd, LayoutStyles.mt20]}>
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
