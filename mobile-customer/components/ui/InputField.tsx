import React, { useState } from 'react';
import { WarningCircleIcon } from 'phosphor-react-native';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/Typography';
import { InputVariant, InputFieldProps } from '@/types/common.types';

// Focus color map for border and icon
const focusColorMap = {
  deepNavy: {
    border: 'border-brand-deepNavy',
    border2: 'border-2 border-brand-deepNavy',
    borderB: 'border-b-2 border-brand-deepNavy',
    hex: '#143373',
  },
  navyBlue: {
    border: 'border-brand-navyBlue',
    border2: 'border-2 border-brand-navyBlue',
    borderB: 'border-b-2 border-brand-navyBlue',
    hex: '#1e40af',
  },
  warmYellow: {
    border: 'border-brand-warmYellow',
    border2: 'border-2 border-brand-warmYellow',
    borderB: 'border-b-2 border-brand-warmYellow',
    hex: '#fbbf24',
  },
};

// Input variant styles with focusColor
const getInputVariantStyle = (
  variant: InputVariant,
  isFocused: boolean,
  hasError: boolean,
  focusColor: 'deepNavy' | 'navyBlue' | 'warmYellow'
) => {
  if (hasError) {
    return 'border-2 border-error bg-white';
  }
  const color = focusColorMap[focusColor] || focusColorMap.navyBlue;
  switch (variant) {
    case 'outline':
      return isFocused
        ? `${color.border2} bg-white`
        : 'border-2 border-gray-300 bg-white';
    case 'ghost':
      return isFocused
        ? `${color.borderB} bg-transparent`
        : 'border-b border-gray-300 bg-transparent';
    case 'error':
      return 'border-2 border-error bg-error-bg';
    case 'success':
      return 'border-2 border-success bg-success-bg';
    default:
      return isFocused
        ? `border ${color.border} bg-white`
        : 'border border-gray-300 bg-white';
  }
};

// Map theme color names to hex codes for icon coloring
const themeHexMap = {
  error: '#ef4444', // Tailwind error
  success: '#10b981', // Tailwind success
  neutralGray: '#6b7280', // Tailwind gray-500
};

// Get icon color based on variant, state, and focusColor (always returns hex for Phosphor icons)
const getIconColor = (
  variant: InputVariant,
  isFocused: boolean,
  hasError: boolean,
  focusColor: 'deepNavy' | 'navyBlue' | 'warmYellow'
) => {
  if (hasError) return themeHexMap.error;
  if (isFocused) return focusColorMap[focusColor]?.hex || focusColorMap.navyBlue.hex;
  switch (variant) {
    case 'success':
      return themeHexMap.success;
    case 'error':
      return themeHexMap.error;
    default:
      return themeHexMap.neutralGray;
  }
};



const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  variant = 'default',
  size = 'medium',
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
  focusColor = 'navyBlue',
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


  // Map size to font size and icon size
  const sizeMap = {
    small: {
      label: { level: 'caption-1', className: 'mb-1' },
      input: { font: 'caption-1', height: 'h-10', py: 'py-2', px: 'px-3' },
      error: { level: 'caption-1', className: 'mt-1' },
      helper: { level: 'caption-1', className: 'mt-1' },
      icon: 16,
    },
    medium: {
      label: { level: 'subhead', className: 'mb-2' },
      input: { font: 'body', height: 'h-12', py: 'py-3', px: 'px-4' },
      error: { level: 'caption-1', className: 'mt-1' },
      helper: { level: 'caption-1', className: 'mt-1' },
      icon: 18,
    },
    large: {
      label: { level: 'title-3', className: 'mb-3' },
      input: { font: 'title-2', height: 'h-14', py: 'py-4', px: 'px-5' },
      error: { level: 'body', className: 'mt-2' },
      helper: { level: 'body', className: 'mt-2' },
      icon: 22,
    },
  };
  const iconSize = sizeMap[size].icon;
  const heightClass = multiline ? sizeMap[size].input.py : sizeMap[size].input.height;
  const pxClass = sizeMap[size].input.px;
  const fontSizeClass = `text-${sizeMap[size].input.font}`;


  const inputContainerClasses = [
    'rounded-xl flex flex-row items-center',
    getInputVariantStyle(variant, isFocused, hasError, focusColor),
    heightClass,
    pxClass,
    !editable ? 'opacity-60' : '',
    className
  ].filter(Boolean).join(' ');

  const textInputClasses = [
    'flex-1',
    fontSizeClass,
    'text-black',
    IconLeft ? 'ml-2' : '',
    IconRight ? 'mr-2' : '',
  ].filter(Boolean).join(' ');

  const iconColor = getIconColor(variant, isFocused, hasError, focusColor);
  // Removed duplicate iconSize declaration

  return (
    <View className="w-full">
      {/* Label */}
      {label && (
        <Typography level={sizeMap[size].label.level as any} weight="semibold" className={`text-black ${sizeMap[size].label.className}`.trim()}>
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
        {error ? (
          <TouchableOpacity disabled>
            <WarningCircleIcon size={iconSize} color={themeHexMap.error} weight="bold" />
          </TouchableOpacity>
        ) : (
          IconRight && (
            <TouchableOpacity>
              <IconRight size={iconSize} color={iconColor} weight="regular" />
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Typography level={sizeMap[size].error.level as any} className={`text-error ${sizeMap[size].error.className}`.trim()}>
          {error}
        </Typography>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <Typography level={sizeMap[size].helper.level as any} className={`text-brand-neutralGray ${sizeMap[size].helper.className}`.trim()}>
          {helperText}
        </Typography>
      )}
    </View>
  );
};

export default InputField;
