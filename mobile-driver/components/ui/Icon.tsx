import React from "react";
import * as PhosphorIcons from "phosphor-react-native";
import { IconProps as PhosphorIconProps } from "phosphor-react-native";

export type IconName = keyof typeof PhosphorIcons;

export interface IconProps extends PhosphorIconProps {
  name: IconName;
}

export const Icon = ({ name, ...props }: IconProps) => {
  const PhosphorIcon = PhosphorIcons[name];

  // Runtime check to ensure we have a renderable component.
  // React components (both functional and class-based) are functions,
  // but other exports like `IconContext` are objects.
  if (typeof PhosphorIcon !== 'function') {
    // Don't warn for IconContext, as it's a valid export we just don't render it here.
    if (name !== 'IconContext') {
      console.warn(`Icon with name "${name}" does not exist or is not a valid component.`);
    }
    return null;
  }

  // Use React.createElement for dynamically creating an element from a component.
  // This is safer with TypeScript for dynamic component types.
  return React.createElement(PhosphorIcon as React.ComponentType<PhosphorIconProps>, props);
};