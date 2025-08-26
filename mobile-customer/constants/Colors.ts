/**
 * YathraGo App Colors - Simplified for Tab Navigation & Components
 * Main brand colors are handled by Tailwind CSS configuration
 */

// YathraGo Brand Colors (for JavaScript/React Navigation usage)
const deepNavyBlue = '#143373';      // Primary brand color
const brightOrange = '#FDC334';      // Accent/CTA color
const neutralGray = '#6B7280';       // Secondary text/icons
const lightGray = '#F3F4F6';         // Light surfaces (panels/headers)
const darkGray = '#D1D5DB';          // Darker panels
const white = '#FFFFFF';             // Background
const black = '#000000';       // Primary text
const warmYellow = '#FAAA21';  // Warning/Alert text
const successGreen = '#22C55E';      // Success state

export const Colors = {
  // For tab navigation (React Navigation requirement)
  tabIconDefault: neutralGray,
  tabIconSelected: deepNavyBlue,
  // Brand quick access
  deepNavy: deepNavyBlue,
  brightOrange,
  neutralGray,
  lightGray,
  darkGray,
  white,
  black,
  warmYellow,
  successGreen,
  
  // For ThemedText/ThemedView components (simplified - no light/dark modes)
  text: black,
  background: white,
  icon: neutralGray,
  
  // Simplified structure (removes theme complexity since you don't use light/dark mode)
  light: {
    text: black,
    background: white,
    icon: neutralGray,
  },
  dark: {
    text: black,  // Same as light since no dark mode
    background: white,
    icon: neutralGray,
  },
};
