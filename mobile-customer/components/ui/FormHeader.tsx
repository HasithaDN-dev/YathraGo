import React from 'react';
import { View, Text, Image } from 'react-native';

interface FormHeaderProps {
  title: string;
  subtitle: string;
  showLogo?: boolean;
  className?: string;
}

export function FormHeader({ 
  title, 
  subtitle, 
  showLogo = true, 
  className = '' 
}: FormHeaderProps) {
  return (
    <View className={`items-center mb-8 ${className}`}>
      {showLogo && (
        <View className="mb-6">
          <Image
            source={require('../../assets/images/logo.png')}
            className="w-16 h-16"
            resizeMode="contain"
          />
        </View>
      )}
      <Text 
        className="text-2xl font-bold text-center mb-2"
        style={{ 
          fontFamily: 'Figtree-Bold',
          color: '#143373'
        }}
      >
        {title}
      </Text>
      <Text 
        className="text-base text-center text-gray-600"
        style={{ 
          fontFamily: 'Figtree-Regular',
          color: '#6B7280'
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
