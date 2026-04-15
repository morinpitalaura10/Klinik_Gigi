import React, { useState, useEffect, useContext } from 'react';
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
import { supabase } from '../../utils/supabase';
import { GlobalStyles, LayoutStyles, Colors } from '../../styles/GlobalStyles';
import AdminLayout from '../../components/templates/AdminLayout';
import DropdownInput from '../../components/molecules/DropdownInput';
import LabeledInput from '../../components/molecules/LabeledInput';
import PrimaryButton from '../../components/atoms/PrimaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

export function IsiRekamMedis() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { user } = useContext(AuthContext);
    const { record } = route.params as { record: any };

    const [loading, setLoading] = useState(false);
    const [fetchingTindakan, setFetchingTindakan] = useState(true);
    const [tindakanList, setTindakanList] = useState<any[]>([]);

    // Form States
    const [diagnosa, setDiagnosa] = useState(record?.diagnosa || '');
    const [selectedTindakanId, setSelectedTindakanId] = useState<string>(record?.id_tindakan?.toString() || '');
    const [keterangan, setKeterangan] = useState(record?.keterangan || '');

    useEffect(() => {
        fetchTindakan();
    }, []);

    const fetchTindakan = async () => {
        try {
            const { data, error } = await supabase
                .from('tb_tindakan')
                .select('id_tindakan, nama_tindakan')
                .order('nama_tindakan', { ascending: true });

            if (error) throw error;
            setTindakanList(data || []);
        } catch (error: any) {
            Alert.alert('Error', 'Gagal memuat daftar tindakan');
        } finally {
            setFetchingTindakan(false);
        }
    };

    const handleSave = async () => {
        if (!diagnosa || !selectedTindakanId) {
            Alert.alert('Peringatan', 'Harap isi diagnosa dan pilih tindakan!');
            return;
        }

        // VALIDASI ID DOKTER (Agar tidak NULL di DB)
        if (!user?.id_users) {
            Alert.alert('Gagal', 'Sesi login dokter tidak valid. Silakan Logout dan Login kembali untuk melanjutkan.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('tb_rekam_medis')
                .update({
                    diagnosa: diagnosa,
                    id_tindakan: parseInt(selectedTindakanId),
                    keterangan: keterangan,
                    doctor_id: user?.id_users, // Pastikan ini terisi (Wajib re-login jika null)
                    status: 'Selesai' 
                })
                .eq('id_record', record.id_record);

            if (error) throw error;

            Alert.alert('Berhasil', 'Rekam medis pasien berhasil disimpan.');
            navigation.popToTop(); // Kembali ke daftar antrean
        } catch (error: any) {
            Alert.alert('Gagal', error.message);
        } finally {
            setLoading(false);
        }
    };

    const tindakanOptions = tindakanList.map(t => ({
        label: t.nama_tindakan,
        value: t.id_tindakan.toString()
    }));

    return (
        <AdminLayout
            customRightTitle="Dokter"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={LayoutStyles.flex1}
            >
                <ScrollView contentContainerStyle={LayoutStyles.scrollContent}>
                    <View style={GlobalStyles.formCard}>
                        <Text style={GlobalStyles.formSectionTitle}>MEDICAL RECORD</Text>
                        <Text style={{ textAlign: 'center', marginBottom: 15, color: '#666' }}>
                            Pasien: {record.tb_pasien?.nama_pasien}
                        </Text>
                        <View style={GlobalStyles.formDivider} />

                        <LabeledInput
                            label="Diagnosa"
                            placeholder="Masukkan hasil diagnosa..."
                            value={diagnosa}
                            onChangeText={setDiagnosa}
                            multiline={true}
                            numberOfLines={3}
                        />

                        {fetchingTindakan ? (
                            <ActivityIndicator size="small" color={Colors.primary} style={LayoutStyles.mb20} />
                        ) : (
                            <DropdownInput
                                label="Perawatan"
                                options={tindakanOptions}
                                selectedValue={selectedTindakanId}
                                onValueChange={setSelectedTindakanId}
                            />
                        )}

                        <LabeledInput
                            label="Keterangan"
                            placeholder="Tambahkan catatan jika ada..."
                            value={keterangan}
                            onChangeText={setKeterangan}
                            multiline={true}
                            numberOfLines={3}
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
