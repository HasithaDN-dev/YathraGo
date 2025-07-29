import React from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, Text } from 'react-native';

export type GenderType = 'Male' | 'Female' | 'Unspecified' | '';

interface GenderPickerProps {
  value: GenderType;
  onChange: (value: GenderType) => void;
  label?: string;
  style?: any;
}

export const GenderPicker: React.FC<GenderPickerProps> = ({ value, onChange, label = 'Gender', style }) => (
  <View style={style}>
    <Text style={{ marginBottom: 4, fontWeight: '500' }}>{label}</Text>
    <View style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, marginBottom: 8 }}>
      <Picker
        selectedValue={value}
        onValueChange={onChange}
      >
        <Picker.Item label="Select Gender" value="" />
        <Picker.Item label="Male" value="Male" />
        <Picker.Item label="Female" value="Female" />
        <Picker.Item label="Unspecified" value="Unspecified" />
      </Picker>
    </View>
  </View>
);
