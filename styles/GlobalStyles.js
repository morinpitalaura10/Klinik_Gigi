import { StyleSheet, Platform } from 'react-native';

export const Colors = {
  primary: '#8B1D1D', // Warna merah maroon utama (Header/Tombol Login)
  secondary: '#A45D5D', // Warna merah pudar (Menu Dashboard)
  cardRed: '#A35D5D', // Merah agak pudar untuk card di dashboard
  cardBorder: '#3A1515', // Warna garis tepi gelap untuk kartu
  background: '#F5F5F5', // Latar belakang abu-abu terang
  white: '#FFFFFF',
  black: '#000000',
  gray: '#888888',
  text: '#333333',
  placeholder: '#A0A0A0',
  formInputBg: '#FFFFFF', // Diubah menjadi Putih sesuai permintaan
};

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
    color: Colors.primary,
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

  // --- Input & Tombol ---
  pillInput: {
    borderWidth: 1.5,
    borderColor: Colors.black,
    borderRadius: 25,
    height: 50,
    backgroundColor: Colors.white,
    color: Colors.black,
    paddingHorizontal: 20,
  },
  formInput: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 25,
    height: 50,
    backgroundColor: Colors.formInputBg,
    color: Colors.black,
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
    borderRadius: 20,
    padding: 25,
    borderWidth: 1.5,
    borderColor: Colors.black,
    elevation: 3,
  },
  formSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    letterSpacing: 1,
  },
  formDivider: {
    height: 1,
    backgroundColor: Colors.black,
    marginBottom: 20,
    opacity: 0.3,
  },
  btnBatal: {
    backgroundColor: '#ABABAB',
    paddingHorizontal: 35,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    marginRight: 15,
  },
  btnBatalText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnSimpan: {
    backgroundColor: '#2A52BE',
    width: 140,
    height: 45,
    borderRadius: 12,
  },
});
