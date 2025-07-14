import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import TextInputMask, { TextInputMaskProps } from 'react-native-text-input-mask';

interface PhoneComponentProps {
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  example?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export const validateSriLankanPhone = (phone: string): boolean => {
  // Remove spaces and validate the format +947XXXXXXXX
  const cleanPhone: string = phone.replace(/\s/g, '');
  const phoneRegex: RegExp = /^\+947[0-9]{8}$/;
  return phoneRegex.test(cleanPhone);
};

export const PhoneComponent: React.FC<PhoneComponentProps> = ({
  value,
  onChangeText,
  label,
  required = false,
  error,
  placeholder = '+94 7XX XXX XXX',
  example = 'e.g., +94 712 345 678',
  style,
  inputStyle,
}) => {
  const handleTextChange = (formatted: string, extracted?: string): void => {
    // The formatted value includes spaces, but we'll keep it for display
    onChangeText(formatted);
  };

  const containerStyle: ViewStyle = {
    marginBottom: 16,
    ...style,
  };

  const defaultInputStyle: TextStyle = {
    borderColor: error ? '#ef4444' : '#d1d5db',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#374151',
    ...inputStyle,
  };

  const labelStyle: TextStyle = {
    fontWeight: '600' as const,
    marginBottom: 4,
    fontSize: 14,
    color: '#374151',
  };

  const exampleStyle: TextStyle = {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  };

  const errorStyle: TextStyle = {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500' as const,
  };

  const maskProps: Partial<TextInputMaskProps> = {
    value,
    onChangeText: handleTextChange,
    mask: '+94 [000] [000] [000]',
    placeholder,
    keyboardType: 'phone-pad',
    style: defaultInputStyle,
    autoComplete: 'tel',
    textContentType: 'telephoneNumber',
    autoCapitalize: 'none',
    autoCorrect: false,
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={labelStyle}>
          {label} {required && <Text style={{ color: '#ef4444' }}>*</Text>}
        </Text>
      )}
      <TextInputMask {...maskProps} />
      <Text style={exampleStyle}>{example}</Text>
      {error && <Text style={errorStyle}>{error}</Text>}
    </View>
  );
};