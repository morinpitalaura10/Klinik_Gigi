import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Alert,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { supabase } from '../../../utils/supabase';
import { GlobalStyles, LayoutStyles, Colors } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import LabeledInput from '../../../components/molecules/LabeledInput';
import PrimaryButton from '../../../components/atoms/PrimaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';

export function CreateKwitansi() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { record } = route.params as { record: any }; // Menerima record dari TampilKwitansi

    const [loading, setLoading] = useState(false);
    const [nominal, setNominal] = useState('');
    const [tujuan, setTujuan] = useState(`Biaya Perawatan ${record.tb_tindakan?.nama_tindakan || record.layanan}`);

    const [obat, setObat] = useState('');
    const [noKwitansi, setNoKwitansi] = useState('');

    useEffect(() => {
        generateNoKwitansi();
    }, []);

    const generateNoKwitansi = () => {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        setNoKwitansi(`KW-${year}${month}-${random}`);
    };

    const handleSave = async () => {
        if (!nominal) {
            Alert.alert('Peringatan', 'Harap isi nominal pembayaran!');
            return;
        }

        setLoading(true);
        try {
            const kwitansiData = {
                record_id: record.id_record,
                pasien_id: record.id_pasien,
                doctor_id: record.doctor_id,
                rp: parseFloat(nominal.replace(/[^0-9]/g, '')),
                obat: obat,
                tujuan_pembayaran: tujuan,
                tgl: new Date().toLocaleDateString('en-CA'),
                no_kwitansi: noKwitansi
            };

            const { data, error } = await supabase
                .from('tb_kwitansi')
                .insert(kwitansiData)
                .select()
                .single();

            if (error) throw error;

            Alert.alert('Berhasil', 'Kwitansi berhasil dibuat.', [
                { text: 'OK', onPress: () => navigation.navigate('PreviewKwitansi', { item: { ...data, tb_pasien: record.tb_pasien, tb_rekam_medis: record } }) }
            ]);
        } catch (error: any) {
            Alert.alert('Gagal', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout noScroll={true} customRightTitle={record.layanan === 'Ortodental' ? "Form Kwitansi Orto" : "Form Kwitansi Umum"}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={LayoutStyles.flex1}
            >
                <ScrollView contentContainerStyle={LayoutStyles.scrollContent}>
                    <View style={GlobalStyles.formCard}>
                        <Text style={GlobalStyles.formSectionTitle}>
                            {record.layanan === 'Ortodental' ? 'FORM KWITANSI ORTO' : 'FORM KWITANSI UMUM'}
                        </Text>
                        <View style={GlobalStyles.formDivider} />

                        <LabeledInput
                            label="Nama Pasien"
                            value={record.tb_pasien?.nama_pasien || ''}
                            editable={false}
                            variant="login"
                        />

                        <LabeledInput
                            label="No. Handphone"
                            value={record.tb_pasien?.nope || ''}
                            editable={false}
                            variant="login"
                        />

                        <LabeledInput
                            label="Diagnosa / Keluhan"
                            value={record.diagnosa || '-'}
                            editable={false}
                            multiline={true}
                            numberOfLines={2}
                        />

                        <LabeledInput
                            label="Perawatan"
                            value={record.tb_tindakan?.nama_tindakan || record.layanan}
                            editable={false}
                        />

                        <LabeledInput
                            label="Banyaknya Uang (Nominal)"
                            placeholder="Masukkan nominal angka saja..."
                            value={nominal}
                            onChangeText={setNominal}
                            keyboardType="numeric"
                        />

                        <LabeledInput
                            label="Untuk Pembayaran"
                            placeholder="Keterangan pembayaran..."
                            value={tujuan}
                            onChangeText={setTujuan}
                            multiline={true}
                            numberOfLines={2}
                        />

                        <LabeledInput
                            label="Obat"
                            placeholder="Kosongkan jika tidak ada obat..."
                            value={obat}
                            onChangeText={setObat}
                            multiline={true}
                            numberOfLines={2}
                        />

                        <LabeledInput
                            label="No. Kwitansi"
                            value={noKwitansi}
                            editable={false}
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
