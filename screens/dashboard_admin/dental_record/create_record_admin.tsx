import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Alert,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Modal,
    TextInput
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../utils/supabase';
import { GlobalStyles, LayoutStyles, Colors, CreateRecordStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAlert } from '../../../context/AlertContext';

interface Pasien {
    id_pasien: number;
    nama_pasien: string;
}

export function CreateRecordAdmin() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { showAlert } = useAlert();
    const { editItem } = (route.params as any) || {};

    const [loading, setLoading] = useState(false);
    const [fetchingPasien, setFetchingPasien] = useState(true);

    const [pasienList, setPasienList] = useState<Pasien[]>([]);
    const [selectedPasienId, setSelectedPasienId] = useState<string>(editItem?.id_pasien?.toString() || '');
    const [selectedPasienName, setSelectedPasienName] = useState<string>('Masukkan nama pasien');
    const [layanan, setLayanan] = useState(editItem?.layanan || '');

    // Keluhan state (mapped to 'keluhan' column in DB)
    const [diagnosa, setDiagnosa] = useState<string>(
        editItem?.diagnosa || ''
    );

    // Modals for dropdowns
    const [pasienModalVisible, setPasienModalVisible] = useState(false);
    const [layananModalVisible, setLayananModalVisible] = useState(false);

    const layananOptions = ['Ortodental', 'Umum'];

    const fetchPasien = async () => {
        try {
            setFetchingPasien(true);
            const { data, error } = await supabase
                .from('tb_pasien')
                .select('id_pasien, nama_pasien')
                .order('nama_pasien', { ascending: true });

            if (error) throw error;
            setPasienList(data || []);

            if (editItem?.id_pasien) {
                const p = data?.find(x => x.id_pasien === editItem.id_pasien);
                if (p) setSelectedPasienName(p.nama_pasien);
            }
        } catch (error: any) {
            showAlert({ title: 'Error', message: 'Gagal memuat data pasien: ' + error.message, type: 'error' });
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
        if (!selectedPasienId || !diagnosa.trim() || !layanan) {
            showAlert({ title: 'Peringatan', message: 'Harap isi semua data (Pasien, Layanan, dan Keluhan)!', type: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const recordData = {
                id_pasien: parseInt(selectedPasienId),
                layanan: layanan,
                diagnosa: diagnosa,
                gigi: editItem?.gigi || '1',
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

            showAlert({ title: 'Berhasil', message: 'Dental record berhasil disimpan.', type: 'success', onConfirm: () => navigation.goBack() });
        } catch (error: any) {
            showAlert({ title: 'Gagal', message: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout noScroll={true} customRightTitle="Dental Record">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={LayoutStyles.flex1}
            >
                <ScrollView contentContainerStyle={CreateRecordStyles.mainContainer} showsVerticalScrollIndicator={false}>

                    <View style={CreateRecordStyles.card}>

                        <Text style={CreateRecordStyles.cardTitle}>
                            {editItem ? 'DENTAL RECORD' : 'DENTAL RECORD BARU'}
                        </Text>
                        <View style={CreateRecordStyles.divider} />

                        {/* Dropdown Pasien */}
                        <Text style={CreateRecordStyles.fieldLabel}>Nama Pasien</Text>
                        <TouchableOpacity
                            style={CreateRecordStyles.inputDropdown}
                            onPress={() => !editItem && setPasienModalVisible(true)}
                            disabled={!!editItem}
                        >
                            <Text style={CreateRecordStyles.inputText}>
                                {fetchingPasien ? 'Memuat...' : selectedPasienName}
                            </Text>
                            <MaterialCommunityIcons name="menu-down" size={24} color={Colors.primary} />
                        </TouchableOpacity>

                        {/* Dropdown Layanan */}
                        <Text style={CreateRecordStyles.fieldLabel}>Layanan</Text>
                        <TouchableOpacity
                            style={CreateRecordStyles.inputDropdown}
                            onPress={() => setLayananModalVisible(true)}
                        >
                            <Text style={CreateRecordStyles.inputText}>
                                {layanan || 'Pilih pelayanan'}
                            </Text>
                            <MaterialCommunityIcons name="menu-down" size={24} color={Colors.primary} />
                        </TouchableOpacity>

                        {/* Text Area Keluhan */}
                        <Text style={CreateRecordStyles.fieldLabel}>Keluhan/Diagnosis</Text>
                        <TextInput
                            style={CreateRecordStyles.textArea}
                            placeholder="Masukkan keluhan pasien..."
                            placeholderTextColor="#999"
                            multiline={true}
                            value={diagnosa}
                            onChangeText={setDiagnosa}
                        />

                        {/* Tombol Simpan */}
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

            {/* Modal Pilih Pasien */}
            <Modal visible={pasienModalVisible} transparent animationType="fade" onRequestClose={() => setPasienModalVisible(false)}>
                <TouchableOpacity style={GlobalStyles.selectionModalOverlay} activeOpacity={1} onPress={() => setPasienModalVisible(false)}>
                    <View style={GlobalStyles.selectionModalContent}>
                        <Text style={GlobalStyles.selectionModalTitle}>Pilih Pasien</Text>
                        <ScrollView style={{ maxHeight: 300, width: '100%' }}>
                            {pasienList.map(p => (
                                <TouchableOpacity
                                    key={p.id_pasien}
                                    style={GlobalStyles.selectionOptionItem}
                                    onPress={() => {
                                        setSelectedPasienId(p.id_pasien.toString());
                                        setSelectedPasienName(p.nama_pasien);
                                        setPasienModalVisible(false);
                                    }}
                                >
                                    <Text style={GlobalStyles.tableRowText}>{p.nama_pasien}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Modal Pilih Layanan */}
            <Modal visible={layananModalVisible} transparent animationType="fade" onRequestClose={() => setLayananModalVisible(false)}>
                <TouchableOpacity style={GlobalStyles.selectionModalOverlay} activeOpacity={1} onPress={() => setLayananModalVisible(false)}>
                    <View style={GlobalStyles.selectionModalContent}>
                        <Text style={GlobalStyles.selectionModalTitle}>Pilih Layanan</Text>
                        {layananOptions.map(opt => (
                            <TouchableOpacity
                                key={opt}
                                style={GlobalStyles.selectionOptionItem}
                                onPress={() => {
                                    setLayanan(opt);
                                    setLayananModalVisible(false);
                                }}
                            >
                                <Text style={GlobalStyles.tableRowText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

        </AdminLayout>
    );
}
