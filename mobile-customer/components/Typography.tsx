import React from 'react';
import { Text, type TextProps } from 'react-native';
import { FontWeight, TypographyVariant } from '@/types/common.types';

interface TypographyProps extends TextProps {
  variant: TypographyVariant;
  weight?: FontWeight;
  children: React.ReactNode;
}

const variantSizes: Record<TypographyVariant, string> = {
  'large-title': 'text-large-title',
  'title-1': 'text-title-1',
  'title-2': 'text-title-2',
  'title-3': 'text-title-3',
  'headline': 'text-headline',
  'body': 'text-body',
  'callout': 'text-callout',
  'subhead': 'text-subhead',
  'footnote': 'text-footnote',
  'caption-1': 'text-caption-1',
  'caption-2': 'text-caption-2',
  'tappable': 'text-tappable',
};

const defaultWeights: Record<TypographyVariant, FontWeight> = {
  'large-title': 'regular',
  'title-1': 'regular',
  'title-2': 'regular',
  'title-3': 'regular',
  'headline': 'semibold',
  'body': 'regular',
  'callout': 'regular',
  'subhead': 'regular',
  'footnote': 'regular',
  'caption-1': 'regular',
  'caption-2': 'regular',
  'tappable': 'medium',
};

const weightStyles: Record<FontWeight, string> = {
  'light': 'font-figtree-light',
  'regular': 'font-figtree-regular',
  'medium': 'font-figtree-medium',
  'semibold': 'font-figtree-semibold',
  'bold': 'font-figtree-bold',
  'extrabold': 'font-figtree-extrabold',
};

export const Typography: React.FC<TypographyProps> = ({ 
  variant = 'body', 
  weight,
  children, 
  className, 
  ...props 
}) => {
  const finalWeight = weight || defaultWeights[variant];
  const sizeClass = variantSizes[variant];
  const weightClass = weightStyles[finalWeight];
  
  return (
    <Text 
      className={`${weightClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
};