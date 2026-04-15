import React, { useState, useEffect } from 'react';
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
import { Colors, GlobalStyles, LayoutStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import LabeledInput from '../../../components/molecules/LabeledInput';
import DropdownInput from '../../../components/molecules/DropdownInput';
import PrimaryButton from '../../../components/atoms/PrimaryButton';
import { useNavigation } from '@react-navigation/native';

export function CreateTindakan() {
    const navigation = useNavigation<any>();
    const [namaTindakan, setNamaTindakan] = useState('');
    const [layanan, setLayanan] = useState('');
    const [loading, setLoading] = useState(false);

    const layananOptions = [
        { label: 'Umum', value: 'Umum' },
        { label: 'Ortodental', value: 'Ortodental' },
    ];

    const handleSave = async () => {
        if (!namaTindakan || !layanan) {
            Alert.alert('Peringatan', 'Harap isi nama tindakan dan pilih kategori!');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('tb_tindakan')
                .insert({
                    nama_tindakan: namaTindakan,
                    layanan: layanan // Menyimpan kategori layanan langsung
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
            noScroll={true}
            customRightTitle="Manajemen Tindakan"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={LayoutStyles.flex1}
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

                        <DropdownInput
                            label="Kategori Perawatan"
                            placeholder="Pilih (Umum / Ortodental)..."
                            options={layananOptions}
                            selectedValue={layanan}
                            onValueChange={setLayanan}
                        />

                        <View style={[LayoutStyles.rowEnd, LayoutStyles.mt20]}>
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
