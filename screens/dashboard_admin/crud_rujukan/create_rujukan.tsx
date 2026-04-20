import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { supabase } from '../../../utils/supabase';
import { GlobalStyles, LayoutStyles, Colors } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import LabeledInput from '../../../components/molecules/LabeledInput';
import DropdownInput from '../../../components/molecules/DropdownInput';
import PrimaryButton from '../../../components/atoms/PrimaryButton';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAlert } from '../../../context/AlertContext';

export function CreateRujukan() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const initialRecord = (route.params as { record: any })?.record;
    const { showAlert } = useAlert();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [availableRecords, setAvailableRecords] = useState<any[]>([]);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const [selectedRecordId, setSelectedRecordId] = useState<string>('');
    const [currentRecord, setCurrentRecord] = useState<any>(initialRecord || null);


    const [namaDokter, setNamaDokter] = useState('');
    const [namaPasien, setNamaPasien] = useState('');
    const [tgl, setTgl] = useState(new Date().toLocaleDateString('en-CA'));
    const [jenisKelamin, setJenisKelamin] = useState('Laki-laki');
    const [umur, setUmur] = useState('');
    const [alamat, setAlamat] = useState('');
    const [keluhan_rujukan, setKeluhan_rujukan] = useState('');
    const [diagnosa, setDiagnosa] = useState('');
    const [penandatangan, setPenandatangan] = useState('');

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

    const fetchData = async () => {
        try {
            setFetching(true);
            const [recordsRes, usersRes] = await Promise.all([
                supabase
                    .from('tb_rekam_medis')
                    .select(`
                        id_record, tanggal, diagnosa, gigi, layanan, id_pasien, keterangan,
                        tb_pasien (id_pasien, nama_pasien, alamat, tgl_lahir, jk)
                    `)
                    .eq('status', 'Selesai')
                    .order('tanggal', { ascending: false }),
                supabase
                    .from('tb_users')
                    .select('id_users, nama_users')
                    .order('nama_users', { ascending: true })
            ]);

            if (recordsRes.error) throw recordsRes.error;
            if (usersRes.error) throw usersRes.error;

            setAvailableRecords(recordsRes.data || []);
            setAvailableUsers(usersRes.data || []);
        } catch (error: any) {
            console.error('Fetch error:', error.message);
        } finally {
            setFetching(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    useEffect(() => {
        if (currentRecord) {
            setNamaPasien(currentRecord.tb_pasien?.nama_pasien || '');
            setJenisKelamin(currentRecord.tb_pasien?.jk || 'Laki-laki');
            setUmur(calculateUmur(currentRecord.tb_pasien?.tgl_lahir));
            setAlamat(currentRecord.tb_pasien?.alamat || '');
            setKeluhan_rujukan(currentRecord.keterangan || '');
            setDiagnosa(currentRecord.diagnosa || '');
            setSelectedRecordId(currentRecord.id_record.toString());
        }
    }, [currentRecord]);

    const handleSelectRecord = (id: string) => {
        const found = availableRecords.find(r => r.id_record.toString() === id);
        if (found) {
            setCurrentRecord(found);
            setSelectedRecordId(id);
        }
    };

    const recordOptions = availableRecords.map(r => ({
        label: `${r.tb_pasien?.nama_pasien} (${r.tanggal})`,
        value: r.id_record.toString()
    }));

    const userOptions = availableUsers.map(u => ({
        label: u.nama_users,
        value: u.nama_users
    }));

    const genderOptions = [
        { label: 'Laki-laki', value: 'Laki-laki' },
        { label: 'Perempuan', value: 'Perempuan' }
    ];

    const handleSave = async () => {
        if (!namaDokter || !currentRecord) {
            showAlert({ title: 'Peringatan', message: 'Harap pilih data pasien dan isi Nama Dokter Tujuan!', type: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const rujukanData = {
                ditujukan: namaDokter,
                pasien_id: currentRecord.id_pasien,
                record_id: currentRecord.id_record,
                tgl: tgl,
                keluhan_rujukan: keluhan_rujukan,
                user_klinik: penandatangan || 'Admin Galeri Ortodental'
            };

            const { data, error } = await supabase
                .from('tb_rujukan')
                .insert(rujukanData)
                .select()
                .single();

            if (error) throw error;

            const fullItemForPreview = {
                ...data,
                detail_pasien: {
                    nama_pasien: namaPasien,
                    jenis_kelamin: jenisKelamin,
                    umur: umur,
                    alamat: alamat
                },
                detail_medis: {
                    keluhan_rujukan: keluhan_rujukan,
                    diagnosa: diagnosa
                },
                penandatangan: penandatangan,
                isOrto: currentRecord.layanan === 'Ortodental'
            };

            showAlert({
                title: 'Berhasil',
                message: 'Surat rujukan berhasil dibuat.',
                type: 'success',
                onConfirm: () => navigation.navigate('PreviewRujukan', { item: fullItemForPreview })
            });
        } catch (error: any) {
            showAlert({ title: 'Gagal', message: error.message, type: 'error' });
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

                        <Text style={[GlobalStyles.formSectionTitle, LayoutStyles.mb15]}>DATA REKAM MEDIS</Text>

                        {fetching ? (
                            <ActivityIndicator size="small" color={Colors.primary} style={LayoutStyles.mb20} />
                        ) : (
                            <DropdownInput
                                label="Pilih Data Pasien/Rekam Medis"
                                options={recordOptions}
                                selectedValue={selectedRecordId}
                                onValueChange={handleSelectRecord}
                                placeholder="-- Cari & Pilih Pasien --"
                            />
                        )}

                        <View style={GlobalStyles.formDivider} />

                        <LabeledInput
                            label="Nama Dokter / RS Tujuan"
                            placeholder="Contoh: drg. X / RS Sehat"
                            value={namaDokter}
                            onChangeText={setNamaDokter}
                        />

                        <LabeledInput
                            label="Nama Pasien"
                            placeholder="Auto-fill dari rekam medis"
                            value={namaPasien}
                            onChangeText={setNamaPasien}
                        />

                        <LabeledInput
                            label="Tanggal Rujukan"
                            placeholder="Masukkan tanggal (YYYY-MM-DD)"
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
                            placeholder="Auto-fill dari rekam medis"
                            value={umur}
                            onChangeText={setUmur}
                        />

                        <LabeledInput
                            label="Alamat"
                            placeholder="Auto-fill dari rekam medis"
                            value={alamat}
                            onChangeText={setAlamat}
                            multiline={true}
                        />

                        <LabeledInput
                            label="Keluhan Utama"
                            placeholder="Auto-fill dari rekam medis (bisa diedit)"
                            value={keluhan_rujukan}
                            onChangeText={setKeluhan_rujukan}
                            multiline={true}
                        />

                        <LabeledInput
                            label="Diagnosa Sementara"
                            placeholder="Auto-fill dari rekam medis"
                            value={diagnosa}
                            onChangeText={setDiagnosa}
                            multiline={true}
                        />

                        <DropdownInput
                            label="Penandatangan (Hormat Kami)"
                            options={userOptions}
                            selectedValue={penandatangan}
                            onValueChange={setPenandatangan}
                            placeholder="-- Pilih Nama Penandatangan --"
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
