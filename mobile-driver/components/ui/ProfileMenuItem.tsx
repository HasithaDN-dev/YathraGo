import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { Icon, IconName } from './Icon';

interface ProfileMenuItemProps {
  icon: IconName;
  text: string;
  onPress: () => void;
}

export default function ProfileMenuItem({ icon, text, onPress }: ProfileMenuItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
      <Icon name={icon} size={24} color="#143373" />
      <Text style={{ marginLeft: 16, fontSize: 18 }}>{text}</Text>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <Icon name="ArrowRight" size={20} color="#6b7280" />
      </View>
    </TouchableOpacity>
  );
}