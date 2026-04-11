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
import PrimaryButton from '../../../components/atoms/PrimaryButton';
import { useNavigation } from '@react-navigation/native';

export function CreateTindakan() {
    const navigation = useNavigation<any>();
    const [namaTindakan, setNamaTindakan] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!namaTindakan) {
            Alert.alert('Peringatan', 'Harap isi nama tindakan!');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('tb_tindakan')
                .insert({
                    nama_tindakan: namaTindakan
                });

            if (error) throw error;

            Alert.alert('Berhasil', 'Tindakan baru berhasil ditambahkan.');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Gagal Menyimpan', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            activeTab="beranda"
            noScroll={true}
            customRightTitle="Manajemen Tindakan"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={LayoutStyles.scrollContent}>
                    <View style={GlobalStyles.formCard}>
                        <Text style={GlobalStyles.formSectionTitle}>TAMBAH INFORMASI TINDAKAN</Text>
                        <View style={GlobalStyles.formDivider} />

                        <LabeledInput
                            label="Nama Tindakan"
                            placeholder="Masukkan nama tindakan baru"
                            value={namaTindakan}
                            onChangeText={setNamaTindakan}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                            <TouchableOpacity
                                style={GlobalStyles.btnBatal}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={GlobalStyles.btnBatalText}>Batal</Text>
                            </TouchableOpacity>

                            <PrimaryButton
                                title={loading ? "Menyimpan..." : "Tambah"}
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
