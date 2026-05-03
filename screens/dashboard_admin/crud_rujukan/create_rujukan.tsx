import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, TextInput } from 'react-native';
import { supabase } from '../../../utils/supabase';
import { GlobalStyles, LayoutStyles, Colors, CreateRecordStyles } from '../../../styles/GlobalStyles';
import AdminLayout from '../../../components/templates/AdminLayout';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAlert } from '../../../context/AlertContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function CreateRujukan() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const initialRecord = (route.params as { record: any })?.record;
    const { showAlert } = useAlert();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [availableRecords, setAvailableRecords] = useState<any[]>([]);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const [selectedRecordId, setSelectedRecordId] = useState<string>('');
    const [selectedRecordName, setSelectedRecordName] = useState<string>('Pilih data pasien/Rekam medis');
    const [currentRecord, setCurrentRecord] = useState<any>(initialRecord || null);

    const [namaDokter, setNamaDokter] = useState('');
    const [namaPasien, setNamaPasien] = useState('');
    const [tgl, setTgl] = useState(new Date().toLocaleDateString('en-CA'));
    const [jenisKelamin, setJenisKelamin] = useState('');
    const [umur, setUmur] = useState('');
    const [alamat, setAlamat] = useState('');
    const [keluhan_rujukan, setKeluhan_rujukan] = useState('');
    const [diagnosa, setDiagnosa] = useState('');
    const [penandatangan, setPenandatangan] = useState('');
    const [penandatanganModalVisible, setPenandatanganModalVisible] = useState(false);
    const [recordModalVisible, setRecordModalVisible] = useState(false);
    
    const [recordSearch, setRecordSearch] = useState('');
    const [penandatanganSearch, setPenandatanganSearch] = useState('');

    const calculateUmur = (tglLahir: string) => {
        if (!tglLahir) return '';
        try {
            const today = new Date();
            const birthDate = new Date(tglLahir);
            if (isNaN(birthDate.getTime())) return '';
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age.toString() + ' Tahun';
        } catch (e) {
            return '';
        }
    };

    const fetchData = async () => {
        try {
            setFetching(true);
            const [recordsRes, usersRes] = await Promise.all([
                supabase
                    .from('tb_rekam_medis')
                    .select(`
                        id_record, tanggal, diagnosa, gigi, layanan, id_pasien, keterangan,
                        tb_pasien (id_pasien, nama_pasien, alamat, tgl_lahir, jk)
                    `)
                    .eq('status', 'Selesai')
                    .order('tanggal', { ascending: false }),
                supabase
                    .from('tb_users')
                    .select('id_users, nama_users, role, tb_dokter(spesialisasi)')
                    .order('nama_users', { ascending: true })
            ]);

            if (recordsRes.error) throw recordsRes.error;
            if (usersRes.error) throw usersRes.error;

            setAvailableRecords(recordsRes.data || []);
            setAvailableUsers(usersRes.data || []);
        } catch (error: any) {
            console.error('Fetch error:', error.message);
        } finally {
            setFetching(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    useEffect(() => {
        if (currentRecord) {
            setNamaPasien(currentRecord.tb_pasien?.nama_pasien || '');
            setJenisKelamin(currentRecord.tb_pasien?.jk || 'Laki-laki');
            setUmur(calculateUmur(currentRecord.tb_pasien?.tgl_lahir));
            setAlamat(currentRecord.tb_pasien?.alamat || '');
            setKeluhan_rujukan(currentRecord.keterangan || '');
            setDiagnosa(currentRecord.diagnosa || '');
            setSelectedRecordId(currentRecord.id_record.toString());
            setSelectedRecordName(`${currentRecord.tb_pasien?.nama_pasien} (${currentRecord.tanggal})`);
        }
    }, [currentRecord]);

    const handleSelectRecord = (id: string) => {
        const found = availableRecords.find(r => r.id_record.toString() === id);
        if (found) {
            setCurrentRecord(found);
            setSelectedRecordId(id);
            setRecordModalVisible(false);
        }
    };

    const handleSave = async () => {
        if (!currentRecord) {
            showAlert({ title: 'Pilih Rekam Medis', message: 'Harap pilih data pasien dari daftar rekam medis terlebih dahulu!', type: 'warning' });
            return;
        }

        if (!namaDokter.trim()) {
            showAlert({ title: 'Nama Instansi Kosong', message: 'Harap isi Nama Instansi atau Dokter tujuan rujukan!', type: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const rujukanData = {
                ditujukan: namaDokter,
                pasien_id: currentRecord.id_pasien,
                record_id: currentRecord.id_record,
                tgl: tgl,
                keluhan_rujukan: keluhan_rujukan,
                user_klinik: penandatangan || 'Admin Galeri Ortodental'
            };

            const { data, error } = await supabase
                .from('tb_rujukan')
                .insert(rujukanData)
                .select()
                .single();

            if (error) throw error;

            const fullItemForPreview = {
                ...data,
                detail_pasien: {
                    nama_pasien: namaPasien,
                    jenis_kelamin: jenisKelamin,
                    umur: umur,
                    alamat: alamat
                },
                detail_medis: {
                    keluhan_rujukan: keluhan_rujukan,
                    diagnosa: diagnosa
                },
                penandatangan: penandatangan,
                isOrto: currentRecord.layanan === 'Ortodental'
            };

            showAlert({
                title: 'Berhasil',
                message: 'Surat rujukan berhasil dibuat dan disimpan.',
                type: 'success',
                onConfirm: () => navigation.navigate('PreviewRujukan', { item: fullItemForPreview })
            });
        } catch (error: any) {
            let userMessage = 'Terjadi kesalahan saat menyimpan rujukan.';
            if (error.message.includes('not-null')) {
                userMessage = 'Beberapa data wajib masih kosong.';
            } else if (error.message.includes('network')) {
                userMessage = 'Koneksi internet bermasalah. Silakan coba lagi.';
            }
            showAlert({ title: 'Gagal Menyimpan', message: userMessage, type: 'error' });
            console.error('Rujukan Save Error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderCustomInput = (label: string, value: string, setValue: (t: string) => void, placeholder: string = "", multiline: boolean = false) => (
        <View style={GlobalStyles.mb12}>
            <Text style={CreateRecordStyles.fieldLabel}>{label}</Text>
            <TextInput
                style={[CreateRecordStyles.inputDropdown, multiline && GlobalStyles.textAreaSmall]}
                value={value}
                onChangeText={setValue}
                placeholder={placeholder || label}
                placeholderTextColor={Colors.placeholder}
                multiline={multiline}
            />
        </View>
    );

    return (
        <AdminLayout noScroll={true} customRightTitle="Rujukan">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={LayoutStyles.flex1}
            >
                <ScrollView contentContainerStyle={CreateRecordStyles.mainContainer} showsVerticalScrollIndicator={false}>
                    <View style={CreateRecordStyles.card}>
                        <Text style={CreateRecordStyles.cardTitle}>DATA REKAM MEDIS</Text>
                        <View style={CreateRecordStyles.divider} />

                        {/* Dropdown Pasien / Record */}
                        <Text style={CreateRecordStyles.fieldLabel}>Pilih data pasien/Rekam medis</Text>
                        <TouchableOpacity
                            style={CreateRecordStyles.inputDropdown}
                            onPress={() => setRecordModalVisible(true)}
                        >
                            <Text style={[CreateRecordStyles.inputText, !selectedRecordId && GlobalStyles.textLightGray]} numberOfLines={1}>
                                {fetching ? 'Memuat...' : (selectedRecordId ? selectedRecordName : 'Pilih data pasien/Rekam medis')}
                            </Text>
                            <MaterialCommunityIcons name="menu-down" size={24} color={Colors.primary} />
                        </TouchableOpacity>

                        <View style={GlobalStyles.formDivider} />

                        {renderCustomInput("Nama Instansi", namaDokter, setNamaDokter, "Masukkan nama instansi")}
                        {renderCustomInput("Nama Pasien", namaPasien, setNamaPasien, "Masukkan nama pasien")}
                        {renderCustomInput("Tanggal Rujukan", tgl, setTgl, "Masukkan tanggal rujukan")}
                        {renderCustomInput("Jenis Kelamin", jenisKelamin, setJenisKelamin, "Masukkan jenis kelamin")}
                        {renderCustomInput("Umur", umur, setUmur, "Masukkan umur pasien")}
                        {renderCustomInput("Alamat", alamat, setAlamat, "Masukkan alamat", true)}
                        {renderCustomInput("Keluhan", keluhan_rujukan, setKeluhan_rujukan, "Masukkan keluhan", true)}
                        {renderCustomInput("Diagnosa", diagnosa, setDiagnosa, "Masukkan diagnosa", true)}

                        {/* Dropdown Penandatangan */}
                        <Text style={CreateRecordStyles.fieldLabel}>Penandatanganan/Hormat Kami</Text>
                        <TouchableOpacity
                            style={CreateRecordStyles.inputDropdown}
                            onPress={() => setPenandatanganModalVisible(true)}
                        >
                            <Text style={[CreateRecordStyles.inputText, !penandatangan && GlobalStyles.textLightGray]} numberOfLines={1}>
                                {penandatangan || 'Pilih penandatangan'}
                            </Text>
                            <MaterialCommunityIcons name="menu-down" size={24} color={Colors.primary} />
                        </TouchableOpacity>

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

            {/* Modal Pilih Record */}
            <Modal visible={recordModalVisible} transparent animationType="fade" onRequestClose={() => setRecordModalVisible(false)}>
                <TouchableOpacity style={GlobalStyles.selectionModalOverlay} activeOpacity={1} onPress={() => setRecordModalVisible(false)}>
                    <View style={GlobalStyles.selectionModalContent}>
                        <Text style={GlobalStyles.selectionModalTitle}>Pilih Rekam Medis</Text>
                        
                        <View style={GlobalStyles.dropdownSearchContainer}>
                            <MaterialCommunityIcons name="magnify" size={20} color="#999" />
                            <TextInput
                                style={GlobalStyles.dropdownSearchInput}
                                placeholder="Cari nama pasien..."
                                placeholderTextColor="#999"
                                value={recordSearch}
                                onChangeText={setRecordSearch}
                            />
                        </View>

                        <ScrollView style={{ maxHeight: 400, width: '100%' }} keyboardShouldPersistTaps="handled">
                            {availableRecords.filter(r => r.tb_pasien?.nama_pasien?.toLowerCase().includes(recordSearch.toLowerCase())).map(r => (
                                <TouchableOpacity
                                    key={r.id_record}
                                    style={GlobalStyles.selectionOptionItem}
                                    onPress={() => handleSelectRecord(r.id_record.toString())}
                                >
                                    <Text style={GlobalStyles.tableRowText}>
                                        {r.tb_pasien?.nama_pasien} ({r.tanggal})
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Modal Pilih Penandatangan */}
            <Modal visible={penandatanganModalVisible} transparent animationType="fade" onRequestClose={() => setPenandatanganModalVisible(false)}>
                <TouchableOpacity style={GlobalStyles.selectionModalOverlay} activeOpacity={1} onPress={() => setPenandatanganModalVisible(false)}>
                    <View style={GlobalStyles.selectionModalContent}>
                        <Text style={GlobalStyles.selectionModalTitle}>Pilih Penandatangan</Text>
                        
                        <View style={GlobalStyles.dropdownSearchContainer}>
                            <MaterialCommunityIcons name="magnify" size={20} color="#999" />
                            <TextInput
                                style={GlobalStyles.dropdownSearchInput}
                                placeholder="Cari penandatangan..."
                                placeholderTextColor="#999"
                                value={penandatanganSearch}
                                onChangeText={setPenandatanganSearch}
                            />
                        </View>

                        <ScrollView style={{ maxHeight: 300, width: '100%' }} keyboardShouldPersistTaps="handled">
                            {availableUsers.filter(u => u.nama_users.toLowerCase().includes(penandatanganSearch.toLowerCase())).map(u => {
                                const spec = u.tb_dokter?.[0]?.spesialisasi || u.tb_dokter?.spesialisasi;
                                const roleDisplay = u.role === 'dokter' ? (spec || 'Dokter') : 'Admin';
                                const formattedName = `${u.nama_users} (${roleDisplay})`;
                                
                                return (
                                    <TouchableOpacity
                                        key={u.id_users}
                                        style={GlobalStyles.selectionOptionItem}
                                        onPress={() => {
                                            setPenandatangan(formattedName);
                                            setPenandatanganModalVisible(false);
                                        }}
                                    >
                                        <Text style={GlobalStyles.tableRowText}>{formattedName}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </AdminLayout>
    );
}
