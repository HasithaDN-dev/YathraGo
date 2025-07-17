// Common type definitions for YathraGo
import React from 'react';
import { TouchableOpacityProps } from 'react-native';
import { IconProps } from 'phosphor-react-native';

// YathraGo Typography sizes from tailwind.config.js
export type TypographyVariant = 
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

  export type FontWeight = 
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'


// Button types
export type ButtonBgVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'navyBlue';
export type ButtonTextVariant = 'primary' | 'secondary' | 'white' | 'black' | 'navyBlue';
export type ButtonSize = 'small' | 'medium' | 'large' | 'xlarge';

  // Button component props
export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  bgVariant?: ButtonBgVariant;
  textVariant?: ButtonTextVariant;
  weight?: FontWeight;
  size?: ButtonSize; // Default: 'medium'
  fullWidth?: boolean;
  IconLeft?: React.ComponentType<IconProps>;
  IconRight?: React.ComponentType<IconProps>;
  loading?: boolean;
  disabled?: boolean;
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
  IconLeft?: React.ComponentType<IconProps>
  IconRight?: React.ComponentType<IconProps>;
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
