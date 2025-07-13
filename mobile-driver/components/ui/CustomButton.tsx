import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { ButtonProps, ButtonBgVariant, ButtonTextVariant } from '@/types/common.types';

// Background variant styles
const getBgVariantStyle = (variant: ButtonBgVariant) => {
  switch (variant) {
    case 'secondary':
      return 'bg-brand-brightOrange';
    case 'danger':
      return 'bg-red-500';
    case 'success':
      return 'bg-green-500';
    case 'outline':
      return 'bg-transparent border-2 border-brand-deepNavy';
    case 'ghost':
      return 'bg-transparent';
    case 'navyBlue':
      return 'bg-brand-navyBlue';
    default: // primary
      return 'bg-brand-deepNavy';
  }
};

// Text variant styles
const getTextVariantStyle = (variant: ButtonTextVariant) => {
  switch (variant) {
    case 'primary':
      return 'text-brand-deepNavy';
    case 'secondary':
      return 'text-brand-brightOrange';
    case 'white':
      return 'text-white';
    case 'black':
      return 'text-black';
    case 'navyBlue':
      return 'text-brand-navyBlue';
    default:
      return 'text-white';
  }
};

// Get icon color based on text variant
const getIconColor = (textVariant: ButtonTextVariant, bgVariant: ButtonBgVariant) => {
  if (bgVariant === 'outline' || bgVariant === 'ghost') {
    return '#143373'; // brand-deepNavy
  }
  
  switch (textVariant) {
    case 'primary':
      return '#143373';
    case 'secondary':
      return '#FF6B35';
    case 'white':
      return '#ffffff';
    case 'black':
      return '#000000';
    case 'navyBlue':
      return '#1F4EAD';
    default:
      return '#ffffff';
  }
};

const CustomButton: React.FC<ButtonProps> = ({
  title,
  bgVariant = 'primary',
  textVariant = 'white',
  textSize = 'body-large', // Default to body-large
  IconLeft,
  IconRight,
  loading = false,
  disabled = false,
  fullWidth = false, // Default to compact - explicitly set fullWidth=true for primary actions
  className = '',
  onPress,
  ...props
}) => {
  const isDisabled = disabled || loading;

  // Dynamic padding based on text content and textSize
  const getDynamicPadding = () => {
    const textLength = title.length;
    const hasIcons = IconLeft || IconRight;
    
    // Base padding varies by text size category
    if (textSize.startsWith('display-') || textSize.startsWith('headline-')) {
      return hasIcons ? 'px-5 py-4' : 'px-6 py-4'; // Large text
    } else if (textSize.startsWith('title-')) {
      return hasIcons ? 'px-4 py-3' : 'px-5 py-3'; // Title text
    } else if (textSize.startsWith('label-')) {
      return hasIcons ? 'px-2 py-2' : 'px-3 py-2'; // Small text
    } else {
      // Body text - adjust for length
      if (textLength <= 8) {
        return hasIcons ? 'px-4 py-3' : 'px-5 py-3'; // Short text
      } else {
        return hasIcons ? 'px-3 py-3' : 'px-4 py-3'; // Long text
      }
    }
  };

  const getTextSizeStyle = () => {
    // Determine appropriate font weight based on text size category
    if (textSize.startsWith('display-') || textSize.startsWith('headline-')) {
      return `text-${textSize} font-bold`;
    } else if (textSize.startsWith('title-')) {
      return `text-${textSize} font-semibold`;
    } else {
      return `text-${textSize} font-regular`;
    }
  };

  const getIconSize = () => {
    if (textSize.startsWith('display-')) return 32;      // Large icons for display text
    if (textSize.startsWith('headline-')) return 28;     // Medium-large icons
    if (textSize.startsWith('title-large')) return 24;   // Large title icons
    if (textSize.startsWith('title-')) return 20;        // Standard title icons
    if (textSize.startsWith('body-large')) return 20;    // Body large icons
    if (textSize.startsWith('body-')) return 18;         // Standard body icons
    if (textSize.startsWith('label-')) return 16;        // Small label icons
    return 20; // Default
  };

  const buttonClasses = [
    'rounded-full flex flex-row justify-center items-center shadow-sm shadow-neutral-400/30',
    getBgVariantStyle(bgVariant),
    getDynamicPadding(),
    fullWidth ? 'w-full' : 'self-center', // Compact buttons auto-center
    isDisabled ? 'opacity-60' : '',
    className
  ].filter(Boolean).join(' ');

  const textClasses = [
    getTextSizeStyle(),
    getTextVariantStyle(textVariant)
  ].filter(Boolean).join(' ');

  const iconColor = getIconColor(textVariant, bgVariant);
  const iconSize = getIconSize();

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-row items-center justify-center gap-2">
          <ActivityIndicator size="small" color={iconColor} />
          <Text className={textClasses}>Loading...</Text>
        </View>
      );
    }

    return (
      <View className="flex-row items-center justify-center gap-2">
        {IconLeft && <IconLeft size={iconSize} color={iconColor} weight="regular" />}
        <Text className={textClasses}>
          {title}
        </Text>
        {IconRight && <IconRight size={iconSize} color={iconColor} weight="regular" />}
      </View>
    );
  };

  return (
    <TouchableOpacity
      className={buttonClasses}
      disabled={isDisabled}
      activeOpacity={0.8}
      onPress={onPress}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

export default CustomButton;
