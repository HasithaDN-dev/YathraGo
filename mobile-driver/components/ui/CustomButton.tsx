import React from 'react';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Typography} from '@/components/Typography';
import { ButtonProps, ButtonBgVariant, ButtonTextVariant, ButtonSize, FontWeight } from '@/types/common.types';

// Background variant styles
const getBgVariantStyle = (variant: ButtonBgVariant) => {
  switch (variant) {
    case 'secondary':
      return 'bg-brand-brightOrange';
    case 'danger':
      return 'bg-danger';
    case 'success':
      return 'bg-success';
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

// Mobile-optimized size configurations
const getSizeConfig = (size: ButtonSize) => {
  switch (size) {
    case 'small':
      return {
        padding: 'px-4 py-2',
        minHeight: 'min-h-[36px]',
        typographyVariant: 'caption-1' as const,
        iconSize: 16,
        defaultWeight: 'medium' as FontWeight,
        borderRadius: 'rounded-full'
      };
    case 'medium': // DEFAULT SIZE
      return {
        padding: 'px-5 py-3',
        minHeight: 'min-h-[44px]',
        typographyVariant: 'subhead' as const,
        iconSize: 18,
        defaultWeight: 'medium' as FontWeight,
        borderRadius: 'rounded-full'
      };
    case 'large':
      return {
        padding: 'px-6 py-4',
        minHeight: 'min-h-[52px]',
        typographyVariant: 'body' as const,
        iconSize: 20,
        defaultWeight: 'semibold' as FontWeight,
        borderRadius: 'rounded-full'
      };
    case 'xlarge':
      return {
        padding: 'px-8 py-5',
        minHeight: 'min-h-[60px]',
        typographyVariant: 'headline' as const,
        iconSize: 22,
        defaultWeight: 'semibold' as FontWeight,
        borderRadius: 'rounded-full'
      };
    default:
      return getSizeConfig('medium');
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
  bgVariant = 'navyBlue',
  textVariant = 'white',
  weight,
  size = 'medium', // DEFAULT SIZE
  fullWidth = false,
  IconLeft,
  IconRight,
  loading = false,
  disabled = false,
  className = '',
  onPress,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const sizeConfig = getSizeConfig(size);
  const finalWeight = weight || sizeConfig.defaultWeight;

  const buttonClasses = [
    getBgVariantStyle(bgVariant),
    sizeConfig.padding,
    sizeConfig.minHeight,
    sizeConfig.borderRadius,
    fullWidth ? 'w-full' : 'self-start',
    isDisabled ? 'opacity-60' : '',
    'justify-center items-center',
    className
  ].filter(Boolean).join(' ');

  const textClasses = [getTextVariantStyle(textVariant)].filter(Boolean).join(' ');
  const iconColor = getIconColor(textVariant, bgVariant);

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-row items-center justify-center gap-2">
          <ActivityIndicator size="small" color={iconColor} />
          <Typography 
            variant={sizeConfig.typographyVariant} 
            weight={finalWeight} 
            className={textClasses}
          >
            Loading...
          </Typography>
        </View>
      );
    }

    return (
      <View className="flex-row items-center justify-center gap-2">
        {IconLeft && (
          <IconLeft 
            size={sizeConfig.iconSize} 
            color={iconColor}
            weight="regular"
          />
        )}
        <Typography 
          variant={sizeConfig.typographyVariant} 
          weight={finalWeight} 
          className={textClasses}
        >
          {title}
        </Typography>
        {IconRight && (
          <IconRight 
            size={sizeConfig.iconSize} 
            color={iconColor}
            weight="regular"
          />
        )}
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