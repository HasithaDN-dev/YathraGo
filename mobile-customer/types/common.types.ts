// Common type definitions for YathraGo
import React from 'react';

// Button types
export type ButtonBgVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'navyBlue';
export type ButtonTextVariant = 'primary' | 'secondary' | 'white' | 'black' | 'navyBlue';

// YathraGo Typography sizes from tailwind.config.js
export type YathraGoTextSize = 
  | 'display-large' | 'display-medium' | 'display-small'
  | 'headline-large' | 'headline-medium' | 'headline-small'
  | 'title-large' | 'title-medium' | 'title-small'
  | 'body-large' | 'body-medium' | 'body-small' | 'body-extra-small'
  | 'label-large' | 'label-medium' | 'label-small';

// Button component props
export interface ButtonProps {
  title: string;
  bgVariant?: ButtonBgVariant;
  textVariant?: ButtonTextVariant;
  textSize?: YathraGoTextSize;  // Direct typography control
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  onPress?: () => void;
}
