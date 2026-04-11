import React from 'react';
import { 
  View, 
  ScrollView,
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStyles } from '../../styles/GlobalStyles';


interface Props {
  children: React.ReactNode;
}

export default function AuthTemplate({ children }: Props) {
  return (
    <SafeAreaView style={AuthStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={AuthStyles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={AuthStyles.container}>
            {/* Bagian Merah Atas (Spacer) */}
            <View style={AuthStyles.topSection} />

            {/* Arch sempit di atas - ada maroon di sisi kiri kanan */}
            <View style={AuthStyles.archTop} />

            {/* Bagian putih penuh di bawah */}
            <View style={AuthStyles.bottomFull}>
              <ScrollView
                style={{ width: '100%' }}
                contentContainerStyle={AuthStyles.formContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
