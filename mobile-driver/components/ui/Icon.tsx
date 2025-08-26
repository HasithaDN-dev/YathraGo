import React from 'react';
import {
  ArrowLeft,
  Camera,
  User,
  Receipt,
  ChartLineUp,
  Car,
  Headset,
  Info,
  SignOut,
  ArrowRight,
  X,
  Users,
  UsersFour,
  Wind,
  CarProfile,
} from 'phosphor-react-native';

const iconMap = {
  ArrowLeft,
  Camera,
  User,
  Receipt,
  ChartLineUp,
  Car,
  Headset,
  Info,
  SignOut,
  ArrowRight,
  X,
  Users,
  UsersFour,
  Wind,
  CarProfile,
};

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}

export function Icon({ name, size = 24, color = 'black', weight = 'regular' }: IconProps) {
  // @ts-ignore
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    return null;
  }

  // @ts-ignore
  return <IconComponent size={size} color={color} weight={weight} />;
}