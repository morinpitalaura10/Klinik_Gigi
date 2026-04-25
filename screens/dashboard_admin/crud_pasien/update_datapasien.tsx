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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAlert } from '../../../context/AlertContext';

export function UpdatePasien() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { showAlert } = useAlert();
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
        if (!nama.trim() || !tglLahir || !jk || !nope || !alamat.trim()) {
            showAlert({ title: 'Data Tidak Lengkap', message: 'Harap isi semua kolom yang wajib (tanda bintang atau kolom utama).', type: 'warning' });
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

            showAlert({ 
                title: 'Berhasil', 
                message: 'Data pasien berhasil diperbarui dalam sistem.', 
                type: 'success', 
                onConfirm: () => navigation.goBack() 
            });
        } catch (error: any) {
            showAlert({ title: 'Gagal Memperbarui', message: error.message, type: 'error' });
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
                        <Text style={CreateRecordStyles.cardTitle}>UBAH DATA PASIEN</Text>
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
                                onPress={handleUpdate}
                                disabled={loading}
                            >
                                <Text style={CreateRecordStyles.btnSimpanText}>
                                    {loading ? 'Memperbarui...' : 'Simpan'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </AdminLayout>
    );
}
