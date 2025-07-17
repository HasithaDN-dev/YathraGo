import React, { useState } from 'react';
import { WarningCircleIcon } from 'phosphor-react-native';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/Typography';
import { InputVariant, InputFieldProps, TypographyVariant } from '@/types/common.types';

// Focus color map for border and icon
const focusColorMap = {
  deepNavy: {
    border: 'border-[1.5px] border-brand-deepNavy',
    border2: 'border-2 border-brand-deepNavy',
    borderB: 'border-b-2 border-brand-deepNavy',
    hex: '#143373',
  },
  navyBlue: {
    border: 'border-[1.5px] border-brand-navyBlue',
    border2: 'border-2 border-brand-navyBlue',
    borderB: 'border-b-2 border-brand-navyBlue',
    hex: '#1e40af',
  },
  warmYellow: {
    border: 'border-[1.5px] border-brand-warmYellow',
    border2: 'border-2 border-brand-warmYellow',
    borderB: 'border-b-2 border-brand-warmYellow',
    hex: '#fbbf24',
  },
} as const;

// Input variant styles with focusColor
const getInputVariantStyle = (
  variant: InputVariant,
  isFocused: boolean,
  hasError: boolean,
  focusColor: keyof typeof focusColorMap
) => {
  if (hasError) {
    return 'border-2 border-error bg-white';
  }
  
  const color = focusColorMap[focusColor];
  
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
        ? `${color.border} bg-white`
        : 'border-[1.5px] border-gray-300 bg-white';
  }
};

// Map theme color names to hex codes for icon coloring
const themeHexMap = {
  error: '#ef4444',
  success: '#10b981',
  neutralGray: '#6b7280',
} as const;

// Get icon color based on variant, state, and focusColor
const getIconColor = (
  variant: InputVariant,
  isFocused: boolean,
  hasError: boolean,
  focusColor: keyof typeof focusColorMap
) => {
  if (hasError) return themeHexMap.error;
  if (isFocused) return focusColorMap[focusColor].hex;
  
  switch (variant) {
    case 'success':
      return themeHexMap.success;
    case 'error':
      return themeHexMap.error;
    default:
      return themeHexMap.neutralGray;
  }
};

// Size configuration with proper typing
const sizeMap = {
  small: {
    label: { variant: 'footnote' as TypographyVariant, className: 'mb-1' },
    input: { font: 'subhead', height: 'h-10', py: 'py-2', px: 'px-3' },
    error: { variant: 'caption-1' as TypographyVariant, className: 'mt-1' },
    helper: { variant: 'caption-1' as TypographyVariant, className: 'mt-1' },
    icon: 16,
  },
  medium: {
    label: { variant: 'subhead' as TypographyVariant, className: 'mb-2' },
    input: { font: 'body', height: 'h-12', py: 'py-3', px: 'px-4' },
    error: { variant: 'footnote' as TypographyVariant, className: 'mt-1' },
    helper: { variant: 'footnote' as TypographyVariant, className: 'mt-1' },
    icon: 20,
  },
  large: {
    label: { variant: 'body' as TypographyVariant, className: 'mb-3' },
    input: { font: 'title-3', height: 'h-14', py: 'py-4', px: 'px-5' },
    error: { variant: 'subhead' as TypographyVariant, className: 'mt-2' },
    helper: { variant: 'subhead' as TypographyVariant, className: 'mt-2' },
    icon: 24,
  },
} as const;

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  variant = 'default',
  size = 'medium',
  IconLeft,
  IconRight,
  inputMode,
  enterKeyHint,
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

  const currentSize = sizeMap[size];
  const iconSize = currentSize.icon;
  const heightClass = multiline ? currentSize.input.py : currentSize.input.height;
  const pxClass = currentSize.input.px;
  const fontSizeClass = `text-${currentSize.input.font}`;

  const inputContainerClasses = [
    'rounded-2xl flex flex-row items-center',
    getInputVariantStyle(variant, isFocused, hasError, focusColor),
    heightClass,
    pxClass,
    !editable ? 'opacity-60' : '',
    className
  ].filter(Boolean).join(' ');

  const textInputClasses = [
    'flex-1',
    'font-figtree-regular',
    fontSizeClass,
    'text-black',
    'h-full',         // Make input fill container height
    'py-0',           // Remove extra vertical padding
    IconLeft ? 'ml-2' : '',
    IconRight ? 'mr-2' : '',
  ].filter(Boolean).join(' ');

  const iconColor = getIconColor(variant, isFocused, hasError, focusColor);

  // Determine which right icon to show
  const getRightIcon = () => {
    if (hasError) {
      return (
        <TouchableOpacity disabled>
          <WarningCircleIcon size={iconSize} color={themeHexMap.error} weight="bold" />
        </TouchableOpacity>
      );
    }
    
    if (IconRight) {
      return (
        <TouchableOpacity>
          <IconRight size={iconSize} color={iconColor} weight="regular" />
        </TouchableOpacity>
      );
    }
    
    return null;
  };

  return (
    <View className="w-full">
      {/* Label */}
      {label && (
        <Typography 
          variant={currentSize.label.variant} 
          weight="semibold" 
          className={`text-black ${currentSize.label.className}`.trim()}
        >
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
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          inputMode={inputMode}
          enterKeyHint={enterKeyHint}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          // Accessibility improvements
          accessible={true}
          accessibilityLabel={label || placeholder}
          accessibilityHint={helperText}
          accessibilityState={{ 
            disabled: !editable,
            expanded: isFocused 
          }}
          {...props}
        />

        {/* Right Icon */}
        {getRightIcon()}
      </View>

      {/* Error Message */}
      {error && (
        <Typography 
          variant={currentSize.error.variant} 
          className={`text-error ${currentSize.error.className}`.trim()}
        >
          {error}
        </Typography>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <Typography 
          variant={currentSize.helper.variant} 
          className={`text-brand-neutralGray ${currentSize.helper.className}`.trim()}
        >
          {helperText}
        </Typography>
      )}
    </View>
  );
};

export default InputField;