import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Modal,
    TextInput
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../utils/supabase';
import { GlobalStyles, LayoutStyles, Colors, CreateRecordStyles, DoctorStyles } from '../../styles/GlobalStyles';
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

    const [selectedTindakanIds, setSelectedTindakanIds] = useState<string[]>(
        record?.id_tindakan ? record.id_tindakan.toString().split(',') : []
    );
    const [selectedTindakanNames, setSelectedTindakanNames] = useState<string[]>([]);
    const [keterangan, setKeterangan] = useState(record?.keterangan || '');
    
    // Tooth selection state
    const [selectedGigi, setSelectedGigi] = useState<string[]>(
        record?.gigi && record.gigi !== '-' ? record.gigi.split(',') : []
    );



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
                const ids = record.id_tindakan.toString().split(',');
                const names = data
                    ?.filter(x => ids.includes(x.id_tindakan.toString()))
                    .map(x => x.nama_tindakan);
                setSelectedTindakanNames(names || []);
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

    const toggleTindakan = (id: string, name: string) => {
        setSelectedTindakanIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        setSelectedTindakanNames(prev => 
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const handleSave = async () => {
        if (selectedTindakanIds.length === 0) {
            showAlert({ title: 'Peringatan', message: 'Harap pilih minimal satu tindakan/perawatan!', type: 'warning' });
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
                    id_tindakan: selectedTindakanIds.join(','),
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
                        {/* Checkbox Tindakan */}
                        <Text style={CreateRecordStyles.fieldLabel}>Tindakan/Perawatan</Text>
                        {fetchingTindakan ? (
                            <ActivityIndicator size="small" color={Colors.primary} style={LayoutStyles.mv10} />
                        ) : (
                            <View style={[LayoutStyles.flexRow, LayoutStyles.flexWrap, DoctorStyles.treatmentSelectionContainer]}>
                                {tindakanList.map((t) => {
                                    const tIdStr = t.id_tindakan.toString();
                                    const isChecked = selectedTindakanIds.includes(tIdStr);
                                    return (
                                        <TouchableOpacity 
                                            key={tIdStr} 
                                            style={DoctorStyles.treatmentItem} 
                                            onPress={() => toggleTindakan(tIdStr, t.nama_tindakan)}
                                        >
                                            <View style={[LayoutStyles.flexRow, LayoutStyles.alignCenter, DoctorStyles.treatmentBadge, isChecked && DoctorStyles.treatmentBadgeChecked]}>
                                                <View style={[CreateRecordStyles.checkbox, isChecked && CreateRecordStyles.checkboxChecked, DoctorStyles.checkboxInner]}>
                                                    {isChecked && <MaterialCommunityIcons name="check" size={12} color="#FFF" />}
                                                </View>
                                                <Text style={[CreateRecordStyles.checkboxLabel, isChecked ? DoctorStyles.checkboxCheckedText : DoctorStyles.checkboxUncheckedText]}>{t.nama_tindakan}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}

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
                                        <View style={GlobalStyles.alignCenter}>
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
        </AdminLayout>
    );
}
