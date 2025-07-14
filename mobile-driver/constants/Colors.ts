/**
 * YathraGo App Colors - Simplified for Tab Navigation & Components
 * Main brand colors are handled by Tailwind CSS configuration
 */

// YathraGo Brand Colors (for JavaScript/React Navigation usage)
const deepNavyBlue = '#143373';      // Primary brand color
const neutralGray = '#6b7280';       // Secondary text/icons
const white = '#ffffff';             // Background
const black = '#000000';     
const goldenYellow = '#FFB425'; 
const birghtOrange = '#FDC334';      // Primary text

export const Colors = {
  // For tab navigation (React Navigation requirement)
  tabIconDefault: neutralGray,
  tabIconSelected: deepNavyBlue,
  
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
