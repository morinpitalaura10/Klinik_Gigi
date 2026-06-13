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
        <View style={AuthStyles.container}>
          
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={AuthStyles.topSection} />
          </TouchableWithoutFeedback>

          
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={AuthStyles.archTop} />
          </TouchableWithoutFeedback>

          
          <View style={AuthStyles.bottomFull}>
            <ScrollView
              style={AuthStyles.w100p}
              contentContainerStyle={AuthStyles.formContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
