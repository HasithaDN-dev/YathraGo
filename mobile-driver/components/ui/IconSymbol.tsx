// Fallback for using Phosphor Icons across all platforms.

import React from 'react';
import { OpaqueColorValue, type StyleProp, type ViewStyle } from 'react-native';
import {
  House,
  PaperPlaneRight,
  Code,
  CaretRight,
  IconProps,
} from 'phosphor-react-native';

type IconSymbolName = 'house.fill' | 'paperplane.fill' | 'chevron.left.forwardslash.chevron.right' | 'chevron.right';

const ICON_MAP: Record<IconSymbolName, React.ComponentType<IconProps>> = {
  'house.fill': House,
  'paperplane.fill': PaperPlaneRight,
  'chevron.left.forwardslash.chevron.right': Code,
  'chevron.right': CaretRight,
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: IconProps['weight'];
}) {
  const IconComponent = ICON_MAP[name];
  return <IconComponent color={color as string} size={size} style={style} weight={weight} />;
}
