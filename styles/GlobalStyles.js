import { StyleSheet, Platform } from 'react-native';

export const Colors = {
  primary: '#801919', // Diperbarui sesuai permintaan
  secondary: '#A45D5D', // Warna merah pudar (Menu Dashboard)
  cardRed: '#A35D5D', // Merah agak pudar untuk card di dashboard
  cardBorder: '#3A1515', // Warna garis tepi gelap untuk kartu
  background: '#F5F5F5', // Latar belakang abu-abu terang
  white: '#FFFFFF',
  black: '#000000',
  gray: '#888888',
  text: '#555555', // Diubah menjadi Abu-abu sesuai permintaan
  placeholder: '#A0A0A0',
  formInputBg: '#F2E3E3', // Dikembalikan ke Pink sesuai gambar
};

// --- Auth Template Styles ---
export const AuthStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  topSection: {
    height: 80,
  },
  // Arch sempit dengan margin lebih lebar — maroon lebih terlihat di sisi
  archTop: {
    marginHorizontal: 80,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    height: 60,
    zIndex: 1,
  },
  bottomFull: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -1,
    alignItems: 'center',
  },
  formContent: {
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 40,
    alignSelf: 'center',
  },
});

// --- Layout Utilities (Dipindahkan ke atas agar aman saat diimpor) ---
export const LayoutStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'space-between',
  },
  scrollContent: {
    padding: 25,
    flexGrow: 1,
    justifyContent: 'center',
  },
  gridContainer: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    height: 350,
  },
  rightColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  dashboardCardLeft: {
    flex: 1.2,
    marginRight: 15,
  },
  dashboardCardBottom: {
    paddingVertical: 20,
    marginTop: 15,
  },
  textSmall: {
    fontSize: 22,
    marginTop: 5,
  },
  textMedium: {
    fontSize: 22,
  },
  clinicName: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  clinicAddress: {
    color: Colors.white,
    fontSize: 16,
    opacity: 0.8,
    marginTop: 2,
  }
});

export const GlobalStyles = StyleSheet.create({
  // --- Teks ---
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.black, // Diubah menjadi hitam
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },

  // --- Header Dashboard ---
  headerContainer: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  headerRightText: {
    color: Colors.white,
    fontSize: 16,
  },

  // --- Header/TopBar Styles ---
  topBarContainer: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarLogoBadge: {
    backgroundColor: Colors.white,
    width: 55,
    height: 55,
    borderRadius: 27.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  topBarTextRight: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // --- Standardized Input Styles ---
  inputWrapper: {
    marginBottom: 20,
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 25,
    height: 50,
    backgroundColor: Colors.formInputBg,
    paddingHorizontal: 15,
  },
  inputText: {
    flex: 1,
    color: Colors.black,
    fontSize: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputRightIcon: {
    marginLeft: 10,
  },

  // --- Dropdown & Picker Styles ---
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: Colors.primary, // Disamakan dengan input lain
    borderRadius: 25,
    height: 50,
    backgroundColor: Colors.formInputBg,
    paddingHorizontal: 20,
  },
  pickerText: {
    fontSize: 16,
    color: Colors.black,
  },

  // --- Selection Modal Styles ---
  selectionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionModalContent: {
    width: '85%',
    backgroundColor: Colors.white,
    borderRadius: 30, // Bulend sesuai permintaan
    padding: 25,
    maxHeight: '70%',
    borderWidth: 2,
    borderColor: Colors.black,
  },
  selectionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 15,
  },
  selectionModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  selectionOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEEEEE',
  },
  selectionOptionItemActive: {
    backgroundColor: '#F9F9F9',
  },
  selectionOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectionOptionTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },

  // --- Input & Tombol ---
  pillInput: {
    borderWidth: 2,
    borderColor: Colors.black, // Hitam untuk halaman Login
    borderRadius: 25,
    height: 50,
    backgroundColor: Colors.white,
    color: Colors.black,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  formInput: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 25,
    height: 50,
    backgroundColor: Colors.formInputBg,
    color: Colors.black,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },

  // --- Kartu/Menu Dashboard ---
  dashboardCard: {
    backgroundColor: Colors.secondary,
    borderWidth: 1.2,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  dashboardCardText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  dashboardCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- Format Teks Dokumen Cetak ---
  docHeader: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    color: Colors.black,
  },
  docTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    color: Colors.black,
    marginVertical: 10,
  },
  docBodySerif: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontSize: 14,
    color: Colors.black,
  },
  docBodyCursive: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontStyle: 'italic',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
  },

  // --- Navigasi Bawah ---
  bottomNavContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    elevation: 8,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  bottomNavText: {
    color: Colors.white,
    fontSize: 11,
    marginTop: 4,
    opacity: 0.8,
  },
  bottomNavActiveText: {
    opacity: 1,
    fontWeight: 'bold',
  },

  // --- CRUD Form Styles (Standardized) ---
  formCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 25, // Diubah menjadi lebih bulend
    padding: 30, // Diperbesar dari 25 agar lebih lega
    borderWidth: 2,
    borderColor: Colors.black,
    elevation: 3,
  },
  formSectionTitle: {
    fontSize: 16, // Diperbesar dari 12
    fontWeight: '800', // Dibuat lebih tebal
    color: '#333',
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  formDivider: {
    height: 1,
    backgroundColor: Colors.black,
    marginBottom: 20,
    opacity: 0.3,
  },
  btnBatal: {
    backgroundColor: '#B3AFAF', // Diperbarui sesuai permintaan
    width: 140, // Disamakan dengan btnSimpan
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  btnBatalText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16, // Diseragamkan ke 16
  },
  btnSimpan: {
    backgroundColor: '#2E50D4', // Diperbarui sesuai permintaan
    width: 140,
    height: 50, // Disamakan dengan btnBatal agar simetris
    justifyContent: 'center', // Agar teks di tengah
    alignItems: 'center',
    borderRadius: 12,
  },

  // --- List & User Card Styles ---
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: Colors.black,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  userRole: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  // --- Detail View Styles (Read Mode) ---
  detailRow: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
  },
  detailItem: {
    flex: 1,
    paddingRight: 10,
  },
  detailLabel: {
    fontSize: 18, // Diperbesar dari 16
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16, // Diperbesar dari 14
    fontStyle: 'italic',
    color: Colors.text,
  },
  detailFooter: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  btnBack: {
    backgroundColor: '#2E50D4', // Disamakan dengan tombol aksi biru
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  btnBackText: { // Menambahkan ini agar seragam
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },

  // --- Common List Header & Search Styles ---
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  listTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  listSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: Colors.black,
    height: 50,
    flex: 1, // Agar fleksibel mengisi ruang
  },
  listSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listAddButton: {
    backgroundColor: '#2E50D4', // Disamakan dengan tombol Tambah/Simpan
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  listAddButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  // --- Kombinasi Baris Pencarian & Tambah ---
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 5,
  },
  searchWrapper: {
    width: '55%', // Meluas dari kiri sampai tengah layar
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  listAddButtonContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  listLeftSpacer: {
    width: 0,
    display: 'none',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContent: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },

  // --- Card Action Styles ---
  cardActions: {
    flexDirection: 'row',
  },
  cardActionBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // --- Custom Modal Styles (Gini Saja Pop) ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '85%', // Diperkecil lebarnya
    backgroundColor: Colors.white,
    borderRadius: 40, // Lebih bulend lagi untuk modal
    paddingVertical: 25, // Diperpendek tingginya
    paddingHorizontal: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 20, // Dikurangi jaraknya
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  btnModalBatal: {
    backgroundColor: '#B3AFAF', // Diperbarui sesuai permintaan
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  btnModalHapus: {
    backgroundColor: Colors.primary,
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  btnModalText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },

  // --- Table Grid Styles (Sesuai Gambar Referensi) ---
  tableContainer: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 2,
    borderColor: Colors.black,
    overflow: 'hidden',
    marginHorizontal: 0,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 2,
    borderBottomColor: Colors.black,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.black,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableHeaderCell: {
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1.5,
    borderRightColor: Colors.black,
  },
  tableCell: {
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1.5,
    borderRightColor: Colors.black,
  },
  tableCellNo: {
    width: 60, // Sedikit lebih lebar agar muat nomor
  },
  tableCellName: {
    flex: 1,
    paddingHorizontal: 15,
    alignItems: 'flex-start', // Nama miring kiri
  },
  tableCellAction: {
    width: 100,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRightWidth: 0,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: Colors.black,
  },
  tableRowText: {
    fontSize: 14,
    color: Colors.black,
  },
});
