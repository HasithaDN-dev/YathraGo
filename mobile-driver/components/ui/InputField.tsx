import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/Typography';
import { InputProps, InputVariant } from '@/types/common.types';

// Input variant styles
const getInputVariantStyle = (variant: InputVariant, isFocused: boolean, hasError: boolean) => {
  if (hasError) {
    return 'border-2 border-red-500 bg-white';
  }
  
  switch (variant) {
    case 'outline':
      return isFocused 
        ? 'border-2 border-brand-deepNavy bg-white' 
        : 'border-2 border-gray-300 bg-white';
    case 'ghost':
      return isFocused 
        ? 'border-b-2 border-brand-deepNavy bg-transparent' 
        : 'border-b border-gray-300 bg-transparent';
    case 'error':
      return 'border-2 border-red-500 bg-red-50';
    case 'success':
      return 'border-2 border-green-500 bg-green-50';
    default: // default
      return isFocused 
        ? 'border border-brand-deepNavy bg-white' 
        : 'border border-gray-300 bg-white';
  }
};

// Get icon color based on variant and state
const getIconColor = (variant: InputVariant, isFocused: boolean, hasError: boolean) => {
  if (hasError) return '#ef4444'; // red-500
  if (isFocused) return '#143373'; // brand-deepNavy
  
  switch (variant) {
    case 'success':
      return '#10b981'; // green-500
    case 'error':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
};

const InputField: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  variant = 'default',
  textSize = 'body-medium',
  IconLeft,
  IconRight,
  keyboardType = 'default',
  secureTextEntry = false,
  maxLength,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  error,
  helperText,
  className = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(error);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  // Dynamic sizing based on textSize
  const getTextSizeStyle = () => {
    if (textSize.startsWith('display-') || textSize.startsWith('headline-')) {
      return `text-${textSize}`;
    } else if (textSize.startsWith('title-')) {
      return `text-${textSize}`;
    } else {
      return `text-${textSize}`;
    }
  };

  const getIconSize = () => {
    if (textSize.startsWith('display-')) return 28;
    if (textSize.startsWith('headline-')) return 24;
    if (textSize.startsWith('title-large')) return 22;
    if (textSize.startsWith('title-')) return 20;
    if (textSize.startsWith('body-large')) return 20;
    if (textSize.startsWith('body-')) return 18;
    if (textSize.startsWith('label-')) return 16;
    return 18; // Default
  };

  const inputContainerClasses = [
    'rounded-xl flex flex-row items-center',
    getInputVariantStyle(variant, isFocused, hasError),
    multiline ? 'py-3' : 'h-12',
    'px-4',
    !editable ? 'opacity-60' : '',
    className
  ].filter(Boolean).join(' ');

  const textInputClasses = [
    'flex-1',
    getTextSizeStyle(),
    'text-black',
    IconLeft ? 'ml-2' : '',
    IconRight ? 'mr-2' : '',
  ].filter(Boolean).join(' ');

  const iconColor = getIconColor(variant, isFocused, hasError);
  const iconSize = getIconSize();

  return (
    <View className="w-full">
      {/* Label */}
      {label && (
        <Typography variant="label-medium" weight="semibold" className="text-black mb-2">
          {label}
        </Typography>
      )}

      {/* Input Container */}
      <View className={inputContainerClasses}>
        {/* Left Icon */}
        {IconLeft && (
          <TouchableOpacity disabled>
            <IconLeft size={iconSize} color={iconColor} weight="regular" />
          </TouchableOpacity>
        )}

        {/* Text Input */}
        <TextInput
          className={textInputClasses}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af" // gray-400
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...props}
        />

        {/* Right Icon */}
        {IconRight && (
          <TouchableOpacity>
            <IconRight size={iconSize} color={iconColor} weight="regular" />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Typography variant="label-small" className="text-red-500 mt-1">
          {error}
        </Typography>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <Typography variant="label-small" className="text-brand-neutralGray mt-1">
          {helperText}
        </Typography>
      )}
    </View>
  );
};

export default InputField;
