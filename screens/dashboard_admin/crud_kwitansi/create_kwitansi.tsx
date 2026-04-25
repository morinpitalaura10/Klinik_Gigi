import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Alert,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { supabase } from '../../../utils/supabase';
import { GlobalStyles, LayoutStyles, Colors, CreateRecordStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function CreateKwitansi() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { record } = route.params as { record: any };

    const [loading, setLoading] = useState(false);
    const [nominal, setNominal] = useState('');
    const [tujuan, setTujuan] = useState('Biaya Perawatan');
    const [tindakanList, setTindakanList] = useState<any[]>([]);

    const getTindakanNames = (idStr: any, list: any[]) => {
        if (!idStr) return record.layanan || '-';
        const ids = idStr.toString().split(',');
        return list
            .filter(t => ids.includes(t.id_tindakan.toString()))
            .map(t => t.nama_tindakan)
            .join(', ') || record.layanan || '-';
    };

    const [obat, setObat] = useState('');
    const [noKwitansi, setNoKwitansi] = useState('');

    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.from('tb_tindakan').select('*');
            if (data) {
                setTindakanList(data);
                const names = getTindakanNames(record.id_tindakan, data);
                setTujuan(`Biaya Perawatan ${names}`);
            }
            generateNoKwitansi();
        };
        init();
    }, []);

    const terbilang = (n: number): string => {
        const words = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
        if (n < 12) return words[n];
        if (n < 20) return terbilang(n - 10) + " Belas";
        if (n < 100) return terbilang(Math.floor(n / 10)) + " Puluh " + terbilang(n % 10);
        if (n < 200) return "Seratus " + terbilang(n - 100);
        if (n < 1000) return terbilang(Math.floor(n / 100)) + " Ratus " + terbilang(n % 100);
        if (n < 2000) return "Seribu " + terbilang(n - 1000);
        if (n < 1000000) return terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
        if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);
        if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + " Miliar " + terbilang(n % 1000000000);
        return "";
    };

    const getTerbilang = (amountStr: string) => {
        const num = parseInt(amountStr.replace(/[^0-9]/g, ''));
        if (isNaN(num) || num === 0) return "-";
        return (terbilang(num) + " Rupiah").replace(/\s+/g, ' ').trim();
    };

    const generateNoKwitansi = async () => {
        try {
            const isOrto = record.layanan === 'Ortodental';
            const prefix = isOrto ? 'KWOrt' : 'KWU';


            const doctorName: string = record.tb_users?.nama_users || '';
            const getInitials = (name: string) => {
                const skipWords = ['drg', 'dr', 'prof', 'sp', 'ort', 'kons', 'kes', 'mkes', 'msi'];
                const words = name.split(/[\s,\.]+/).filter(w =>
                    w.length > 1 && !skipWords.includes(w.toLowerCase())
                );
                return words.slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'XX';
            };
            const initials = getInitials(doctorName);
            const noPrefix = `${prefix}-${initials}-`;


            const { count } = await supabase
                .from('tb_kwitansi')
                .select('*', { count: 'exact', head: true })
                .like('no_kwitansi', `${noPrefix}%`);

            const nextNum = String((count || 0) + 1).padStart(3, '0');
            setNoKwitansi(`${noPrefix}${nextNum}`);
        } catch {
            const fallback = `KW-${Math.floor(1000 + Math.random() * 9000)}`;
            setNoKwitansi(fallback);
        }
    };

    const handleSave = async () => {
        const cleanedNominal = nominal.replace(/[^0-9]/g, '');
        if (!cleanedNominal) {
            Alert.alert('Form Belum Lengkap', 'Harap masukkan nominal pembayaran (angka saja).');
            return;
        }

        if (isNaN(parseFloat(cleanedNominal))) {
            Alert.alert('Format Salah', 'Nominal harus berupa angka yang valid.');
            return;
        }

        setLoading(true);
        try {
            const kwitansiData = {
                record_id: record.id_record,
                pasien_id: record.id_pasien,
                doctor_id: record.doctor_id,
                rp: parseFloat(cleanedNominal),
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

            navigation.replace('PreviewKwitansi', { 
                item: { 
                    ...data, 
                    tb_pasien: record.tb_pasien, 
                    tb_rekam_medis: record
                } 
            });
        } catch (error: any) {
            let errorMsg = 'Gagal menyimpan data kwitansi ke database.';
            if (error.message.includes('not-null constraint')) {
                errorMsg = 'Ada data wajib yang belum terisi.';
            }
            Alert.alert('Gagal Menyimpan', errorMsg);
            console.error('Save Error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderCustomInput = (label: string, value: string, setValue?: (t: string) => void, placeholder: string = "", multiline: boolean = false, editable: boolean = true, keyboardType: any = "default") => (
        <View style={GlobalStyles.mb15}>
            <Text style={CreateRecordStyles.fieldLabel}>{label}</Text>
            <TextInput
                style={[
                    CreateRecordStyles.inputDropdown,
                    GlobalStyles.inputBlack,
                    multiline && GlobalStyles.textAreaSmall,
                    !editable && GlobalStyles.inputGray
                ]}
                value={value}
                onChangeText={setValue}
                placeholder={placeholder || label}
                placeholderTextColor={Colors.placeholder}
                multiline={multiline}
                editable={editable}
                keyboardType={keyboardType}
            />
        </View>
    );

    return (
        <AdminLayout noScroll={true} title="Kwitansi">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={LayoutStyles.flex1}
            >
                <ScrollView contentContainerStyle={CreateRecordStyles.mainContainer} showsVerticalScrollIndicator={false}>
                    <View style={CreateRecordStyles.card}>
                        <Text style={CreateRecordStyles.cardTitle}>
                            {record.layanan === 'Ortodental' ? 'FORM KWITANSI ORTO' : 'FORM KWITANSI UMUM'}
                        </Text>
                        <View style={CreateRecordStyles.divider} />

                        {renderCustomInput("Nama Pasien", record.tb_pasien?.nama_pasien || '', undefined, "", false, false)}
                        {renderCustomInput("No. Handphone", record.tb_pasien?.nope || '', undefined, "", false, false)}
                        {renderCustomInput("Diagnosa / Keluhan", record.diagnosa || '-', undefined, "", true, false)}
                        {renderCustomInput("Perawatan", getTindakanNames(record.id_tindakan, tindakanList), undefined, "", false, false)}

                        {renderCustomInput("Banyaknya Uang (Nominal)", nominal, setNominal, "Masukkan nominal angka saja", false, true, "numeric")}
                        {renderCustomInput("Banyaknya Uang (Terbilang)", getTerbilang(nominal), undefined, "", true, false)}
                        {renderCustomInput("Untuk Pembayaran", tujuan, setTujuan, "Keterangan pembayaran", true, true)}
                        {renderCustomInput("Obat", obat, setObat, " '-' jika tidak ada obat", true, true)}
                        {renderCustomInput("No. Kwitansi", noKwitansi, undefined, "", false, false)}

                        <View style={[LayoutStyles.flexRow, GlobalStyles.justifyEnd, LayoutStyles.mt20, GlobalStyles.gap15]}>
                            <TouchableOpacity
                                style={[CreateRecordStyles.btnSimpan, GlobalStyles.btnGray]}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={CreateRecordStyles.btnSimpanText}>Batal</Text>
                            </TouchableOpacity>

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

