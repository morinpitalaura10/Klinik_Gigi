import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../utils/supabase';
import { GlobalStyles, LayoutStyles, Colors, CreateRecordStyles } from '../../styles/GlobalStyles';
import AdminLayout from '../../components/templates/AdminLayout';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

export function IsiRekamMedis() {
    const navigation = useNavigation<any>();
    const { showAlert } = useAlert();
    const route = useRoute();
    const { user } = useContext(AuthContext);
    const { record } = route.params as { record: any };

    const [loading, setLoading] = useState(false);
    const [fetchingTindakan, setFetchingTindakan] = useState(true);
    const [tindakanList, setTindakanList] = useState<any[]>([]);

    const [selectedTindakanId, setSelectedTindakanId] = useState<string>(record?.id_tindakan?.toString() || '');
    const [selectedTindakanName, setSelectedTindakanName] = useState<string>('Pilih perawatan');
    const [keterangan, setKeterangan] = useState(record?.keterangan || '');
    
    // Tooth selection state
    const [selectedGigi, setSelectedGigi] = useState<string[]>(
        record?.gigi && record.gigi !== '-' ? record.gigi.split(',') : []
    );

    const [tindakanModalVisible, setTindakanModalVisible] = useState(false);

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

            if (record?.id_tindakan) {
                const found = data?.find(x => x.id_tindakan === record.id_tindakan);
                if (found) setSelectedTindakanName(found.nama_tindakan);
            }
        } catch (error: any) {
            showAlert({ title: 'Error', message: 'Gagal memuat daftar tindakan', type: 'error' });
        } finally {
            setFetchingTindakan(false);
        }
    };

    const toggleGigi = (no: string) => {
        setSelectedGigi(prev => 
            prev.includes(no) ? prev.filter(g => g !== no) : [...prev, no]
        );
    };

    const handleSave = async () => {
        if (!selectedTindakanId) {
            showAlert({ title: 'Peringatan', message: 'Harap pilih tindakan/perawatan!', type: 'warning' });
            return;
        }

        if (!user?.id_users) {
            showAlert({ title: 'Gagal', message: 'Sesi login dokter tidak valid.', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('tb_rekam_medis')
                .update({
                    id_tindakan: parseInt(selectedTindakanId),
                    keterangan: keterangan,
                    gigi: selectedGigi.join(','),
                    doctor_id: user?.id_users,
                    status: 'Selesai' 
                })
                .eq('id_record', record.id_record);

            if (error) throw error;
            showAlert({ title: 'Berhasil', message: 'Rekam medis pasien berhasil disimpan.', type: 'success', onConfirm: () => navigation.popToTop() });
        } catch (error: any) {
            showAlert({ title: 'Gagal', message: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout customRightTitle="Dokter" noScroll={true}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={LayoutStyles.flex1}
            >
                <ScrollView contentContainerStyle={CreateRecordStyles.mainContainer} showsVerticalScrollIndicator={false}>
                    <View style={CreateRecordStyles.card}>
                        <Text style={CreateRecordStyles.cardTitle}>
                            DENTAL RECORD ({record.tb_pasien?.nama_pasien || 'PASIEN'})
                        </Text>
                        <View style={CreateRecordStyles.divider} />

                        {/* Dropdown Tindakan */}
                        <Text style={CreateRecordStyles.fieldLabel}>Tindakan/Perawatan</Text>
                        <TouchableOpacity
                            style={CreateRecordStyles.inputDropdown}
                            onPress={() => setTindakanModalVisible(true)}
                        >
                            <Text style={CreateRecordStyles.inputText}>
                                {fetchingTindakan ? 'Memuat...' : selectedTindakanName}
                            </Text>
                            <MaterialCommunityIcons name="menu-down" size={24} color={Colors.primary} />
                        </TouchableOpacity>

                        {/* Keterangan */}
                        <Text style={CreateRecordStyles.fieldLabel}>Keterangan</Text>
                        <TextInput
                            style={CreateRecordStyles.textArea}
                            placeholder="Masukkan keterangan"
                            placeholderTextColor="#999"
                            multiline={true}
                            value={keterangan}
                            onChangeText={setKeterangan}
                        />

                        {/* Grid Gigi */}
                        <Text style={CreateRecordStyles.fieldLabel}>Nomor Gigi</Text>
                        <View style={CreateRecordStyles.gridContainer}>
                            {Array.from({ length: 85 }, (_, i) => {
                                const numStr = (i + 1).toString();
                                const isChecked = selectedGigi.includes(numStr);
                                return (
                                    <TouchableOpacity 
                                        key={numStr} 
                                        style={CreateRecordStyles.checkboxWrapper16} 
                                        onPress={() => toggleGigi(numStr)}
                                    >
                                        <View style={{ alignItems: 'center' }}>
                                            <View style={[CreateRecordStyles.checkbox, isChecked && CreateRecordStyles.checkboxChecked]}>
                                                {isChecked && <MaterialCommunityIcons name="check" size={12} color="#FFF" />}
                                            </View>
                                            <Text style={CreateRecordStyles.checkboxLabel}>{numStr}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

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

            {/* Modal Pilih Tindakan */}
            <Modal visible={tindakanModalVisible} transparent animationType="fade" onRequestClose={() => setTindakanModalVisible(false)}>
                <TouchableOpacity style={GlobalStyles.selectionModalOverlay} activeOpacity={1} onPress={() => setTindakanModalVisible(false)}>
                    <View style={GlobalStyles.selectionModalContent}>
                        <Text style={GlobalStyles.selectionModalTitle}>Pilih Perawatan</Text>
                        <ScrollView style={{ maxHeight: 300, width: '100%' }}>
                            {tindakanList.map(t => (
                                <TouchableOpacity
                                    key={t.id_tindakan}
                                    style={GlobalStyles.selectionOptionItem}
                                    onPress={() => {
                                        setSelectedTindakanId(t.id_tindakan.toString());
                                        setSelectedTindakanName(t.nama_tindakan);
                                        setTindakanModalVisible(false);
                                    }}
                                >
                                    <Text style={GlobalStyles.tableRowText}>{t.nama_tindakan}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </AdminLayout>
    );
}

// Ensure TextInput is imported locally since LabeledInput was used before
import { TextInput } from 'react-native';
