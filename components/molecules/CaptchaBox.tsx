import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleProp, ViewStyle } from 'react-native';
import { GlobalStyles } from '../../styles/GlobalStyles';

interface Props {
  isChecked: boolean;
  onValidChange: (isValid: boolean, val?: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function CaptchaBox({ isChecked, onValidChange, containerStyle }: Props) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setAnswer('');
    onValidChange(false, '');
  };

  const handleAnswerChange = (val: string) => {
    setAnswer(val);
    if (parseInt(val) === num1 + num2) {
      onValidChange(true, val);
    } else {
      onValidChange(false, val);
    }
  };

  return (
    <View style={[GlobalStyles.captchaSection, containerStyle]}>
      <Text style={GlobalStyles.captchaText}>Verifikasi Keamanan:</Text>
      <View style={[GlobalStyles.captchaMathBox, GlobalStyles.mt8]}>
         <View style={GlobalStyles.captchaQuestionRow}>
           <Text style={GlobalStyles.captchaMathQuestion}>Berapa {num1} + {num2} = ?</Text>
           <Text onPress={generateCaptcha} style={GlobalStyles.captchaRefreshIcon}>↻</Text>
         </View>
         <TextInput 
            style={GlobalStyles.captchaMathInput}
            value={answer}
            onChangeText={handleAnswerChange}
            keyboardType="numeric"
            placeholder="..."
         />
      </View>
      <Text style={GlobalStyles.captchaHint}>
        {isChecked ? "✅ Verifikasi berhasil" : "*Jawaban harus benar untuk melanjutkan"}
      </Text>
    </View>
  );
}
