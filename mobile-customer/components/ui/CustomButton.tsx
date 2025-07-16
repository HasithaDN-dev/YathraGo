import React from 'react';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Typography } from '@/components/Typography';
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
  level = 'body', // Default to body
  weight,
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

  // Dynamic padding based on text content and level
  const getDynamicPadding = () => {
    const textLength = title.length;
    const hasIcons = IconLeft || IconRight;
    switch (level) {
      case 'large-title':
        return hasIcons ? 'px-5 py-4' : 'px-6 py-4';
      case 'title-1':
      case 'title-2':
      case 'title-3':
        return hasIcons ? 'px-4 py-3' : 'px-5 py-3';
      case 'caption-1':
      case 'caption-2':
        return hasIcons ? 'px-2 py-2' : 'px-3 py-2';
      default:
        if (textLength <= 8) {
          return hasIcons ? 'px-4 py-3' : 'px-5 py-3';
        } else {
          return hasIcons ? 'px-3 py-3' : 'px-4 py-3';
        }
    }
  };

  // Icon size based on level
  const getIconSize = () => {
    switch (level) {
      case 'large-title':
        return 32;
      case 'title-1':
        return 24;
      case 'title-2':
        return 22;
      case 'title-3':
        return 20;
      case 'headline':
      case 'callout':
      case 'tappable':
        return 18;
      case 'subhead':
        return 16;
      case 'footnote':
        return 14;
      case 'caption-1':
      case 'caption-2':
        return 12;
      case 'body':
      default:
        return 18;
    }
  };

  const buttonClasses = [
    'rounded-full flex flex-row justify-center items-center shadow-sm shadow-neutral-400/30',
    getBgVariantStyle(bgVariant),
    getDynamicPadding(),
    fullWidth ? 'w-full' : 'self-center', // Compact buttons auto-center
    isDisabled ? 'opacity-60' : '',
    className
  ].filter(Boolean).join(' ');

  const textClasses = [getTextVariantStyle(textVariant)].filter(Boolean).join(' ');
  const iconColor = getIconColor(textVariant, bgVariant);
  const iconSize = getIconSize();

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-row items-center justify-center gap-2">
          <ActivityIndicator size="small" color={iconColor} />
          <Typography level={level} weight={weight} className={textClasses}>Loading...</Typography>
        </View>
      );
    }

    return (
      <View className="flex-row items-center justify-center gap-2">
        {IconLeft && <IconLeft size={iconSize} color={iconColor} weight="regular" />}
        <Typography level={level} weight={weight} className={textClasses}>
          {title}
        </Typography>
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
