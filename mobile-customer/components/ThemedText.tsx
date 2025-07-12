import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'headline' | 'body' | 'label';
  className?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const getTypeClasses = () => {
    switch (type) {
      case 'title':
        return 'text-headline-large font-bold';
      case 'subtitle':
        return 'text-title-large font-bold';
      case 'defaultSemiBold':
        return 'text-body-medium font-semibold';
      case 'link':
        return 'text-body-medium font-semibold text-brand-deepNavy';
      case 'headline':
        return 'text-headline-medium font-regular';
      case 'body':
        return 'text-body-medium font-regular';
      case 'label':
        return 'text-label-medium font-semibold';
      default:
        return 'text-body-medium font-regular';
    }
  };

  return (
    <Text
      style={[{ color }, style]}
      className={`font-[Figtree] ${getTypeClasses()} ${className || ''}`}
      {...rest}
    />
  );
}
