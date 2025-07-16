// Common type definitions for YathraGo
import React from 'react';

// Button types
export type ButtonBgVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'navyBlue';
export type ButtonTextVariant = 'primary' | 'secondary' | 'white' | 'black' | 'navyBlue';

// YathraGo Typography sizes from tailwind.config.js
export type YathraGoTextSize =
  | 'large-title'
  | 'title-1'
  | 'title-2'
  | 'title-3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subhead'
  | 'footnote'
  | 'caption-1'
  | 'caption-2'
  | 'tappable';

// Button component props
export interface ButtonProps {
  title: string;
  bgVariant?: ButtonBgVariant;
  textVariant?: ButtonTextVariant;
  level?: YathraGoTextSize; // Direct typography control (now matches TypographyLevel)
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  onPress?: () => void;
}

// Input field types
export type InputVariant = 'default' | 'outline' | 'ghost' | 'error' | 'success';

// Input field component props (for InputField component)
export interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  variant?: InputVariant;
  size?: 'small' | 'medium' | 'large';
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  secureTextEntry?: boolean;
  maxLength?: number;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  helperText?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  /**
   * Focus color for border and icon when focused. One of: 'deepNavy', 'navyBlue', 'warmYellow'. Defaults to 'navyBlue'.
   */
  focusColor?: 'deepNavy' | 'navyBlue' | 'warmYellow';
}
