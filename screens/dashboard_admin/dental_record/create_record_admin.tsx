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

interface Dokter {
    id_users: number;
    nama_users: string;
    tb_dokter?: { spesialisasi: string }[] | { spesialisasi: string };
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
    const [pasienSearch, setPasienSearch] = useState('');
    const [layanan, setLayanan] = useState(editItem?.layanan || '');

    // Dokter state
    const [dokterList, setDokterList] = useState<Dokter[]>([]);
    const [selectedDokter, setSelectedDokter] = useState<Dokter | null>(null);
    const [dokterSearch, setDokterSearch] = useState('');

    // Keluhan state (mapped to 'diagnosa' column in DB)
    const [diagnosa, setDiagnosa] = useState<string>(editItem?.diagnosa || '');

    // Modals
    const [pasienModalVisible, setPasienModalVisible] = useState(false);
    const [layananModalVisible, setLayananModalVisible] = useState(false);
    const [dokterModalVisible, setDokterModalVisible] = useState(false);

    // Layanan yang dipilih sementara (sebelum dokter dikonfirmasi)
    const [pendingLayanan, setPendingLayanan] = useState('');

    const layananOptions = [
        { label: 'Umum', value: 'Umum', spesialisasi: 'umum' },
        { label: 'Ortodental', value: 'Ortodental', spesialisasi: 'ortodonti' },
    ];

    const fetchPasien = async () => {
        try {
            setFetchingPasien(true);
            const [pasienRes, dokterRes] = await Promise.all([
                supabase
                    .from('tb_pasien')
                    .select('id_pasien, nama_pasien')
                    .order('nama_pasien', { ascending: true }),
                supabase
                    .from('tb_users')
                    .select('id_users, nama_users, tb_dokter(spesialisasi)')
                    .eq('role', 'dokter')
                    .order('nama_users', { ascending: true }),
            ]);

            if (pasienRes.error) throw pasienRes.error;
            if (dokterRes.error) throw dokterRes.error;

            setPasienList(pasienRes.data || []);
            setDokterList(dokterRes.data || []);

            if (editItem?.id_pasien) {
                const p = pasienRes.data?.find(x => x.id_pasien === editItem.id_pasien);
                if (p) setSelectedPasienName(p.nama_pasien);
            }
        } catch (error: any) {
            showAlert({ title: 'Error', message: 'Gagal memuat data: ' + error.message, type: 'error' });
        } finally {
            setFetchingPasien(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPasien();
        }, [])
    );

    // Dapatkan spesialisasi dokter dari struktur data yang mungkin berbeda
    const getDokterSpesialisasi = (dokter: Dokter): string => {
        if (!dokter.tb_dokter) return '';
        if (Array.isArray(dokter.tb_dokter)) {
            return dokter.tb_dokter[0]?.spesialisasi || '';
        }
        return (dokter.tb_dokter as any)?.spesialisasi || '';
    };

    // Filter dokter berdasarkan spesialisasi layanan yang dipilih
    const filteredDokterByLayanan = dokterList.filter(d => {
        const spec = getDokterSpesialisasi(d).toLowerCase().trim();
        const targetSpec = (layananOptions.find(l => l.value === pendingLayanan)?.spesialisasi || '').toLowerCase().trim();
        return spec === targetSpec;
    });

    const handleLayananSelect = (opt: { label: string; value: string; spesialisasi: string }) => {
        setPendingLayanan(opt.value);
        setLayananModalVisible(false);
        setDokterSearch('');
        // Buka modal pilih dokter
        setTimeout(() => setDokterModalVisible(true), 300);
    };

    const handleDokterSelect = (dokter: Dokter) => {
        setSelectedDokter(dokter);
        setLayanan(pendingLayanan);
        setDokterModalVisible(false);
    };

    const handleSave = async () => {
        if (!selectedPasienId) {
            showAlert({ title: 'Pasien Belum Dipilih', message: 'Harap pilih nama pasien dari daftar yang tersedia.', type: 'warning' });
            return;
        }

        if (!layanan) {
            showAlert({ title: 'Layanan Kosong', message: 'Harap pilih jenis layanan (Umum atau Ortodental).', type: 'warning' });
            return;
        }

        if (!selectedDokter && !editItem) {
            showAlert({ title: 'Dokter Belum Dipilih', message: 'Harap pilih dokter yang menangani pasien.', type: 'warning' });
            return;
        }

        if (!diagnosa.trim()) {
            showAlert({ title: 'Keterangan Kosong', message: 'Harap isi bagian Keluhan/Diagnosis pasien.', type: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const recordData: any = {
                id_pasien: parseInt(selectedPasienId),
                layanan: layanan,
                diagnosa: diagnosa,
                tanggal: new Date().toLocaleDateString('en-CA'),
                status: editItem?.status || 'Menunggu',
            };

            // Tambahkan doctor_id jika ada dokter terpilih
            if (selectedDokter) {
                recordData.doctor_id = selectedDokter.id_users;
            }

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

            showAlert({ 
                title: 'Berhasil Disimpan', 
                message: editItem ? 'Perubahan rekam medis berhasil diperbarui.' : 'Rekam medis baru berhasil ditambahkan.', 
                type: 'success', 
                onConfirm: () => navigation.goBack() 
            });
        } catch (error: any) {
            let errorMsg = 'Gagal menyimpan data rekam medis.';
            if (error.message.includes('not-null')) errorMsg = 'Data wajib tidak boleh kosong.';
            showAlert({ title: 'Simpan Gagal', message: errorMsg, type: 'error' });
            console.error('Record Save Error:', error.message);
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

                        {/* Info dokter terpilih */}
                        {selectedDokter && (
                            <View style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                backgroundColor: '#F0FDF4', 
                                borderWidth: 1, 
                                borderColor: '#BBF7D0', 
                                borderRadius: 10, 
                                paddingHorizontal: 12, 
                                paddingVertical: 10, 
                                marginBottom: 14,
                                gap: 8
                            }}>
                                <MaterialCommunityIcons name="doctor" size={20} color="#16A34A" />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 11, color: '#16A34A', fontWeight: '600' }}>Dokter yang Menangani</Text>
                                    <Text style={{ fontSize: 14, color: '#14532D', fontWeight: 'bold' }}>
                                        {selectedDokter.nama_users}
                                    </Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => {
                                        setSelectedDokter(null);
                                        setLayanan('');
                                    }}
                                >
                                    <MaterialCommunityIcons name="close-circle" size={20} color="#16A34A" />
                                </TouchableOpacity>
                            </View>
                        )}

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
                        
                        <View style={GlobalStyles.dropdownSearchContainer}>
                            <MaterialCommunityIcons name="magnify" size={20} color="#999" />
                            <TextInput
                                style={GlobalStyles.dropdownSearchInput}
                                placeholder="Cari nama pasien..."
                                placeholderTextColor="#999"
                                value={pasienSearch}
                                onChangeText={setPasienSearch}
                            />
                        </View>

                        <ScrollView style={GlobalStyles.modalScrollViewContent} keyboardShouldPersistTaps="handled">
                            {pasienList.filter(p => p.nama_pasien.toLowerCase().includes(pasienSearch.toLowerCase())).map(p => (
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
                        <Text style={{ fontSize: 13, color: '#888', marginBottom: 14, textAlign: 'center' }}>
                            Setelah memilih layanan, Anda akan diminta memilih dokter yang menangani.
                        </Text>
                        {layananOptions.map(opt => (
                            <TouchableOpacity
                                key={opt.value}
                                style={[GlobalStyles.selectionOptionItem, { 
                                    flexDirection: 'row', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    paddingVertical: 16,
                                    paddingHorizontal: 16,
                                    borderRadius: 12,
                                    marginBottom: 8,
                                    backgroundColor: layanan === opt.value ? '#FFF0F0' : '#FAFAFA',
                                    borderWidth: 1.5,
                                    borderColor: layanan === opt.value ? Colors.primary : '#EEE',
                                }]}
                                onPress={() => handleLayananSelect(opt)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <MaterialCommunityIcons 
                                        name={opt.value === 'Ortodental' ? 'tooth-outline' : 'stethoscope'} 
                                        size={22} 
                                        color={layanan === opt.value ? Colors.primary : '#666'} 
                                    />
                                    <View>
                                        <Text style={[GlobalStyles.tableRowText, { fontWeight: '600', color: layanan === opt.value ? Colors.primary : '#333' }]}>
                                            {opt.label}
                                        </Text>
                                        <Text style={{ fontSize: 11, color: '#999' }}>
                                            {opt.value === 'Ortodental' ? 'Dokter Spesialis Ortodonti' : 'Dokter Gigi Umum'}
                                        </Text>
                                    </View>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Modal Pilih Dokter (muncul setelah pilih layanan) */}
            <Modal visible={dokterModalVisible} transparent animationType="slide" onRequestClose={() => setDokterModalVisible(false)}>
                <TouchableOpacity style={GlobalStyles.selectionModalOverlay} activeOpacity={1} onPress={() => setDokterModalVisible(false)}>
                    <View style={GlobalStyles.selectionModalContent}>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                            <MaterialCommunityIcons name="doctor" size={22} color={Colors.primary} />
                            <Text style={GlobalStyles.selectionModalTitle}>
                                Pilih Dokter {pendingLayanan}
                            </Text>
                        </View>
                        <Text style={{ fontSize: 12, color: '#888', marginBottom: 14, textAlign: 'center' }}>
                            Pilih dokter yang akan menangani pasien untuk layanan <Text style={{ fontWeight: '600', color: Colors.primary }}>{pendingLayanan}</Text>
                        </Text>

                        <View style={GlobalStyles.dropdownSearchContainer}>
                            <MaterialCommunityIcons name="magnify" size={20} color="#999" />
                            <TextInput
                                style={GlobalStyles.dropdownSearchInput}
                                placeholder="Cari nama dokter..."
                                placeholderTextColor="#999"
                                value={dokterSearch}
                                onChangeText={setDokterSearch}
                            />
                        </View>

                        <ScrollView style={GlobalStyles.modalScrollViewContent} keyboardShouldPersistTaps="handled">
                            {filteredDokterByLayanan
                                .filter(d => d.nama_users.toLowerCase().includes(dokterSearch.toLowerCase()))
                                .length === 0 ? (
                                <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                                    <MaterialCommunityIcons name="account-off-outline" size={48} color="#CCC" />
                                    <Text style={{ color: '#999', marginTop: 8, textAlign: 'center' }}>
                                        Tidak ada dokter {pendingLayanan} yang tersedia.
                                    </Text>
                                </View>
                            ) : (
                                filteredDokterByLayanan
                                    .filter(d => d.nama_users.toLowerCase().includes(dokterSearch.toLowerCase()))
                                    .map(dokter => (
                                        <TouchableOpacity
                                            key={dokter.id_users}
                                            style={[GlobalStyles.selectionOptionItem, {
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 12,
                                                paddingVertical: 14,
                                                paddingHorizontal: 14,
                                                borderRadius: 12,
                                                marginBottom: 8,
                                                backgroundColor: selectedDokter?.id_users === dokter.id_users ? '#FFF0F0' : '#FAFAFA',
                                                borderWidth: 1.5,
                                                borderColor: selectedDokter?.id_users === dokter.id_users ? Colors.primary : '#EEE',
                                            }]}
                                            onPress={() => handleDokterSelect(dokter)}
                                        >
                                            <View style={{
                                                width: 40, height: 40, borderRadius: 20,
                                                backgroundColor: Colors.primary + '20',
                                                justifyContent: 'center', alignItems: 'center'
                                            }}>
                                                <MaterialCommunityIcons name="account" size={22} color={Colors.primary} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>
                                                    {dokter.nama_users}
                                                </Text>
                                                <Text style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                                                    Dokter {pendingLayanan}
                                                </Text>
                                            </View>
                                            {selectedDokter?.id_users === dokter.id_users && (
                                                <MaterialCommunityIcons name="check-circle" size={20} color={Colors.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))
                            )}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

        </AdminLayout>
    );
}
