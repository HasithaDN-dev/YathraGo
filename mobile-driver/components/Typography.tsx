import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type TypographyVariant = 
  | 'display-large' | 'display-medium' | 'display-small'
  | 'headline-large' | 'headline-medium' | 'headline-small'
  | 'title-large' | 'title-medium' | 'title-small'
  | 'body-large' | 'body-medium' | 'body-small' | 'body-extra-small'
  | 'label-large' | 'label-medium' | 'label-small';

export type TypographyWeight = 'regular' | 'semibold' | 'bold' | 'medium';

export type TypographyProps = TextProps & {
  variant?: TypographyVariant;
  weight?: TypographyWeight;
  color?: string;
  lightColor?: string;
  darkColor?: string;
  className?: string;
  children: React.ReactNode;
};

export function Typography({
  variant = 'body-medium',
  weight,
  color,
  lightColor,
  darkColor,
  className,
  children,
  style,
  ...rest
}: TypographyProps) {
  const themeColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  
  // Get font weight based on variant and weight prop
  const getFontWeight = () => {
    if (weight) return weight;
    
    // Default weights based on YathraGo design system
    if (variant.startsWith('title-') || variant.startsWith('label-')) {
      return 'bold'; // 700
    }
    return 'regular'; // 400
  };

  const getVariantClasses = () => {
    const fontWeight = getFontWeight();
    return `font-figtree text-${variant} font-${fontWeight}`;
  };

  return (
    <Text
      style={[
        { color: color || themeColor },
        style
      ]}
      className={`${getVariantClasses()} ${className || ''}`}
      {...rest}
    >
      {children}
    </Text>
  );
}

// Convenience components for common typography patterns
export const DisplayLarge = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="display-large" {...props} />
);

export const DisplayMedium = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="display-medium" {...props} />
);

export const DisplaySmall = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="display-small" {...props} />
);

export const HeadlineLarge = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="headline-large" {...props} />
);

export const HeadlineMedium = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="headline-medium" {...props} />
);

export const HeadlineSmall = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="headline-small" {...props} />
);

export const TitleLarge = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="title-large" {...props} />
);

export const TitleMedium = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="title-medium" {...props} />
);

export const TitleSmall = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="title-small" {...props} />
);

export const BodyLarge = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body-large" {...props} />
);

export const BodyMedium = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body-medium" {...props} />
);

export const BodySmall = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body-small" {...props} />
);

export const BodyExtraSmall = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body-extra-small" {...props} />
);

export const LabelLarge = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="label-large" {...props} />
);

export const LabelMedium = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="label-medium" {...props} />
);

export const LabelSmall = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="label-small" {...props} />
);
