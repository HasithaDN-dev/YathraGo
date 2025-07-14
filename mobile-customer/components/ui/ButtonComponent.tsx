import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator } from 'react-native';

interface ButtonComponentProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function ButtonComponent({ 
  title, 
  variant = 'primary', 
  loading = false,
  size = 'large',
  disabled,
  className = '',
  ...props 
}: ButtonComponentProps) {
  const getButtonStyle = () => {
    const baseStyle = 'rounded-lg flex-row items-center justify-center';
    const sizeStyle = size === 'large' ? 'py-4 px-6' : size === 'medium' ? 'py-3 px-5' : 'py-2 px-4';
    
    if (disabled || loading) {
      return `${baseStyle} ${sizeStyle} bg-gray-400`;
    }
    
    if (variant === 'primary') {
      return `${baseStyle} ${sizeStyle} bg-blue-600`;
    } else {
      return `${baseStyle} ${sizeStyle} border border-blue-600 bg-transparent`;
    }
  };

  const getTextStyle = () => {
    if (disabled || loading) {
      return 'text-white text-center font-semibold';
    }
    
    if (variant === 'primary') {
      return 'text-white text-center font-semibold';
    } else {
      return 'text-blue-600 text-center font-semibold';
    }
  };

  const getTextSize = () => {
    return size === 'large' ? 'text-lg' : size === 'medium' ? 'text-base' : 'text-sm';
  };

  return (
    <TouchableOpacity
      className={`${getButtonStyle()} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' ? 'white' : '#3b82f6'} 
            style={{ marginRight: 8 }}
          />
          <Text className={`${getTextStyle()} ${getTextSize()}`}>
            Loading...
          </Text>
        </>
      ) : (
        <Text className={`${getTextStyle()} ${getTextSize()}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}