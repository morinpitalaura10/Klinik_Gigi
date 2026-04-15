import React, { useState, useCallback } from 'react';
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
import DropdownInput from '../../../components/molecules/DropdownInput';
import LabeledInput from '../../../components/molecules/LabeledInput';
import PrimaryButton from '../../../components/atoms/PrimaryButton';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

interface Pasien {
    id_pasien: number;
    nama_pasien: string;
}

export function CreateRecordAdmin() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { editItem } = (route.params as any) || {};

    const [loading, setLoading] = useState(false);
    const [fetchingPasien, setFetchingPasien] = useState(true);
    
    // States
    const [pasienList, setPasienList] = useState<Pasien[]>([]);
    const [selectedPasienId, setSelectedPasienId] = useState<string>(editItem?.id_pasien?.toString() || '');
    const [layanan, setLayanan] = useState(editItem?.layanan || 'Ortodental');
    const [keluhan, setKeluhan] = useState(editItem?.keluhan || '');

    const layananOptions = [
        { label: 'Ortodental', value: 'Ortodental' },
        { label: 'Umum', value: 'Umum' },
    ];

    const fetchPasien = async () => {
        try {
            setFetchingPasien(true);
            const { data, error } = await supabase
                .from('tb_pasien')
                .select('id_pasien, nama_pasien')
                .order('nama_pasien', { ascending: true });

            if (error) throw error;
            setPasienList(data || []);
        } catch (error: any) {
            Alert.alert('Error', 'Gagal memuat data pasien: ' + error.message);
        } finally {
            setFetchingPasien(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPasien();
        }, [])
    );

    const handleSave = async () => {
        if (!selectedPasienId || !keluhan) {
            Alert.alert('Peringatan', 'Harap pilih pasien dan isi keluhan!');
            return;
        }

        setLoading(true);
        try {
            const recordData = {
                id_pasien: parseInt(selectedPasienId),
                layanan: layanan,
                keluhan: keluhan,
                tanggal: new Date().toLocaleDateString('en-CA'),
                status: editItem?.status || 'Menunggu'
            };

            let error;
            if (editItem) {
                const { error: err } = await supabase
                    .from('tb_rekam_medis')
                    .update(recordData)
                    .eq('id_record', editItem.id_record);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('tb_rekam_medis')
                    .insert(recordData);
                error = err;
            }

            if (error) throw error;

            Alert.alert('Berhasil', 'Dental record berhasil disimpan.');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Gagal', error.message);
        } finally {
            setLoading(false);
        }
    };

    const pasienOptions = pasienList.map(p => ({
        label: p.nama_pasien,
        value: p.id_pasien.toString()
    }));

    return (
        <AdminLayout
            noScroll={true}
            customRightTitle="Dental Record"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={LayoutStyles.flex1}
            >
                <ScrollView contentContainerStyle={LayoutStyles.scrollContent}>
                    <View style={GlobalStyles.formCard}>
                        <Text style={GlobalStyles.formSectionTitle}>
                            {editItem ? 'EDIT RECORD' : 'RECORD BARU'}
                        </Text>
                        <View style={GlobalStyles.formDivider} />

                        {fetchingPasien ? (
                            <ActivityIndicator size="small" color={Colors.primary} style={LayoutStyles.mb20} />
                        ) : (
                            <DropdownInput
                                label="Pilih Pasien"
                                options={pasienOptions}
                                selectedValue={selectedPasienId}
                                onValueChange={setSelectedPasienId}
                                disabled={!!editItem} // Pasien tidak bisa diubah saat edit
                            />
                        )}

                        <DropdownInput
                            label="Layanan"
                            options={layananOptions}
                            selectedValue={layanan}
                            onValueChange={setLayanan}
                        />

                        <LabeledInput
                            label="Keluhan"
                            placeholder="Tuliskan keluhan pasien..."
                            value={keluhan}
                            onChangeText={setKeluhan}
                            multiline={true}
                            numberOfLines={4}
                        />

                        <View style={[LayoutStyles.rowEnd, LayoutStyles.mt20]}>
                            <TouchableOpacity
                                style={GlobalStyles.btnBatal}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={GlobalStyles.btnBatalText}>Batal</Text>
                            </TouchableOpacity>

                            <PrimaryButton
                                title={loading ? "Menyimpan..." : (editItem ? "Simpan Perubahan" : "Simpan")}
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
