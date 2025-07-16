/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // YathraGo Brand Colors
        'brand': {
          'deepNavy': '#143373',     // Primary brand color
          'brightOrange': '#fdc334', // Secondary brand color
          'warmYellow': '#faaa21',   // Accent color
          'navyBlue': '#1F4EAD',     // Accent color
          'lightNavy': '#2d4a8a',    // Light brand color
          'softOrange': '#fde63a',   // Soft accent
          'neutralGray': '#6b7280',  // Secondary text
          'lightGray': '#f3f4f6',    // Light backgrounds
        },
        
        // Basic colors
        'white': '#ffffff',
        'black': '#000000',
        
        // Status colors
        'success': {
          DEFAULT: '#10b981',
          bg: '#e3f9f2',
        },
        'warning': {
          DEFAULT: '#f59e0b',
          bg: '#fef3c7',
        },
        'error': {
          DEFAULT: '#ef4444',
          bg: '#ffe8e8',
        },
        
        // Background colors
        'bg-light-blue': '#c0def5',
        'bg-transparent-navy': '#c0def54d',
      },

        fontSize: {
        // Your Custom Typography Scale
        'large-title': ['34px', { lineHeight: '41px' }],
        'title-1': ['28px', { lineHeight: '34px' }],
        'title-2': ['22px', { lineHeight: '28px' }],
        'title-3': ['20px', { lineHeight: '25px' }],
        'headline': ['17px', { lineHeight: '22px' }],
        'body': ['17px', { lineHeight: '22px' }],
        'callout': ['16px', { lineHeight: '21px' }],
        'subhead': ['15px', { lineHeight: '20px' }],
        'footnote': ['13px', { lineHeight: '18px' }],
        'caption-1': ['12px', { lineHeight: '16px' }],
        'caption-2': ['11px', { lineHeight: '13px' }],
        'tappable': ['17px', { lineHeight: '22px' }],
      },
    },
  },
  plugins: [],
};
