import React from 'react';
import { Text, type TextProps } from 'react-native';

export type TypographyLevel = 'large-title' | 'title-1' | 'title-2' | 'title-3' | 'headline' | 'body' | 'callout' | 'subhead' | 'footnote' | 'caption-1' | 'caption-2' | 'tappable';

export type TypographyWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export type TypographyProps = TextProps & {
  level?: TypographyLevel;
  weight?: TypographyWeight;
  color?: string;
  className?: string;
  children: React.ReactNode;
};

export function Typography({
  level = 'body',
  weight,
  color,
  className,
  children,
  style,
  ...props
}: TypographyProps) {
  
  // Get font weight based on variant and weight prop
  const getFontWeight = () => {
    if (weight) {
      if (weight === 'regular') return 'font-normal';
      return `font-${weight}`;
    }
    // Default weights based on YathraGo design system
    switch (level) {
      case 'large-title':
      case 'title-1':
        return 'font-bold';
      case 'headline':
        return 'font-semibold';
      case 'tappable':
        return 'font-medium';
      default:
        return 'font-normal';
    }
  };

  const levelStyles = `text-${level} ${getFontWeight()}`;

  return (
    <Text
      style={style}
      className={`${levelStyles} ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}

// Convenience components for common typography patterns
