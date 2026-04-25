import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { supabase } from '../../../utils/supabase';
import { LayoutStyles, CreateRecordStyles, Colors } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import LabeledInput from '../../../components/molecules/LabeledInput';
import DropdownInput from '../../../components/molecules/DropdownInput';
import DatePickerInput from '../../../components/molecules/DatePickerInput';
import { useNavigation } from '@react-navigation/native';
import { useAlert } from '../../../context/AlertContext';

export function CreatePasien() {
    const navigation = useNavigation<any>();
    const { showAlert } = useAlert();
    
    const [nama, setNama] = useState('');
    const [tglLahir, setTglLahir] = useState('');
    const [jk, setJk] = useState('');
    const [alamat, setAlamat] = useState('');
    const [pekerjaan, setPekerjaan] = useState('');
    const [nope, setNope] = useState('');
    const [alergi, setAlergi] = useState('');
    
    const [loading, setLoading] = useState(false);

    const jkOptions = [
        { label: 'Laki-laki', value: 'Laki-laki' },
        { label: 'Perempuan', value: 'Perempuan' },
    ];

    const handleSave = async () => {
        if (!nama.trim()) {
            showAlert({ title: 'Nama Kosong', message: 'Harap masukkan nama lengkap pasien.', type: 'warning' });
            return;
        }
        if (!tglLahir) {
            showAlert({ title: 'Tanggal Lahir', message: 'Harap pilih tanggal lahir pasien.', type: 'warning' });
            return;
        }
        if (!jk) {
            showAlert({ title: 'Jenis Kelamin', message: 'Harap pilih jenis kelamin pasien.', type: 'warning' });
            return;
        }

        const cleanedNope = nope.replace(/[^0-9]/g, '');
        if (!cleanedNope) {
            showAlert({ title: 'Nomor HP Salah', message: 'Harap masukkan nomor HP pasien dengan angka saja.', type: 'warning' });
            return;
        }

        if (!alamat.trim()) {
            showAlert({ title: 'Alamat Kosong', message: 'Harap isi alamat lengkap pasien.', type: 'warning' });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('tb_pasien')
                .insert({
                    nama_pasien: nama,
                    tgl_lahir: tglLahir,
                    jk: jk,
                    alamat: alamat,
                    pekerjaan: pekerjaan,
                    nope: cleanedNope,
                    alergi_obat: alergi
                });

            if (error) throw error;
            showAlert({ title: 'Berhasil', message: 'Data pasien baru berhasil ditambahkan ke sistem.', type: 'success', onConfirm: () => navigation.goBack() });
        } catch (error: any) {
            let userMsg = 'Gagal menyimpan data pasien.';
            if (error.message.includes('unique constraint')) userMsg = 'Nomor HP atau data pasien sudah terdaftar.';
            showAlert({ title: 'Gagal Menyimpan', message: userMsg, type: 'error' });
            console.error('Pasien Save Error:', error.message);
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
                        <Text style={CreateRecordStyles.cardTitle}>TAMBAH DATA PASIEN BARU</Text>
                        <View style={CreateRecordStyles.divider} />

                        <Text style={CreateRecordStyles.fieldLabel}>Nama Pasien</Text>
                        <LabeledInput
                            label=""
                            placeholder="Masukkan nama lengkap"
                            value={nama}
                            onChangeText={setNama}
                            hideLabel={true}
                            style={CreateRecordStyles.inputDropdown}
                        />

                        <View style={{ flexDirection: 'row', gap: 15 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={CreateRecordStyles.fieldLabel}>Tanggal Lahir</Text>
                                <DatePickerInput
                                    label=""
                                    value={tglLahir}
                                    onChange={setTglLahir}
                                    hideLabel={true}
                                    buttonStyle={CreateRecordStyles.inputDropdown}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={CreateRecordStyles.fieldLabel}>Jenis Kelamin</Text>
                                <DropdownInput
                                    label=""
                                    options={jkOptions}
                                    selectedValue={jk}
                                    onValueChange={setJk}
                                    hideLabel={true}
                                    buttonStyle={CreateRecordStyles.inputDropdown}
                                />
                            </View>
                        </View>

                        <Text style={CreateRecordStyles.fieldLabel}>Nomor HP / WhatsApp</Text>
                        <LabeledInput
                            label=""
                            placeholder="Contoh: 08123456789"
                            value={nope}
                            onChangeText={setNope}
                            keyboardType="phone-pad"
                            hideLabel={true}
                            style={CreateRecordStyles.inputDropdown}
                        />

                        <Text style={CreateRecordStyles.fieldLabel}>Pekerjaan</Text>
                        <LabeledInput
                            label=""
                            placeholder="Contoh: Pegawai Swasta"
                            value={pekerjaan}
                            onChangeText={setPekerjaan}
                            hideLabel={true}
                            style={CreateRecordStyles.inputDropdown}
                        />

                        <Text style={CreateRecordStyles.fieldLabel}>Alamat Lengkap</Text>
                        <LabeledInput
                            label=""
                            placeholder="Masukkan alamat tinggal"
                            value={alamat}
                            onChangeText={setAlamat}
                            multiline={true}
                            numberOfLines={1}
                            hideLabel={true}
                            style={[CreateRecordStyles.inputDropdown, { height: 60 }]}
                        />

                        <Text style={CreateRecordStyles.fieldLabel}>Riwayat Alergi Obat</Text>
                        <LabeledInput
                            label=""
                            placeholder="Tulis '-' jika tidak ada"
                            value={alergi}
                            onChangeText={setAlergi}
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
