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
      fontFamily: {
        'figtree': ['Figtree', 'sans-serif'],
      },
      fontSize: {
        // YathraGo Display Styles
        'display-large': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px' }],
        'display-medium': ['45px', { lineHeight: '52px', letterSpacing: '0px' }],
        'display-small': ['36px', { lineHeight: '44px', letterSpacing: '0px' }],

        // YathraGo Headline Styles
        'headline-large': ['32px', { lineHeight: '40px', letterSpacing: '0px' }],
        'headline-medium': ['28px', { lineHeight: '36px', letterSpacing: '0px' }],
        'headline-small': ['24px', { lineHeight: '32px', letterSpacing: '0px' }],

        // YathraGo Title Styles
        'title-large': ['22px', { lineHeight: '28px', letterSpacing: '0px' }],
        'title-medium': ['18px', { lineHeight: '22px', letterSpacing: '0.15px' }],
        'title-small': ['14px', { lineHeight: '20px', letterSpacing: '0.1px' }],

        // YathraGo Body Styles
        'body-large': ['18px', { lineHeight: '22px', letterSpacing: '0.5px' }],
        'body-medium': ['16px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        'body-small': ['14px', { lineHeight: '17px', letterSpacing: '0.4px' }],
        'body-extra-small': ['12px', { letterSpacing: '0px' }],

        // YathraGo Label Styles
        'label-large': ['16px', { lineHeight: '20px', letterSpacing: '0.1px' }],
        'label-medium': ['14px', { lineHeight: '17px', letterSpacing: '0.5px' }],
        'label-small': ['12px', { lineHeight: '14.5px', letterSpacing: '0.5px' }],
      },
      fontWeight: {
        'regular': '400',
        'semibold': '600',
        'bold': '700',
      },
    },
  },
  plugins: [],
};