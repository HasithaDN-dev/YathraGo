# YathraGo Driver Mobile App �

This is the **YathraGo Driver** mobile application built with [Expo](https://expo.dev) and React Native. This app allows drivers to receive ride requests, navigate to passengers, and manage their driving sessions.

## 🚀 Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```
   
   Or for specific platforms:
   ```bash
   npm run android:dev  # Android emulator/device
   npm run ios:dev      # iOS simulator/device  
   npm run web          # Web browser
   ```

## 📱 Development Options

In the output, you'll find options to open the app in:

- **Android Studio Emulator** (Recommended for development)
- **Expo Go** on your physical device (scan QR code)
- **iOS Simulator** (macOS only)
- **Web Browser** (for quick UI testing)

## 🎨 **CSS Architecture Guidelines**

This project follows a specific styling structure for consistency and maintainability:

### **✅ Use Tailwind CSS for:**
- **Layout**: `flex-1`, `items-center`, `justify-between`, `absolute`, `relative`
- **Colors**: `bg-blue-500`, `text-white`, `border-gray-300`
- **Typography**: `text-lg`, `font-bold`, `text-center`
- **Spacing**: `p-4`, `m-2`, `gap-4`, `mt-6`

### **✅ Use StyleSheet for:**
- **Animations**: `Animated.Value`, `transform`, `opacity`
- **Complex Transforms**: `perspective`, `rotateX/Y/Z`, `skew`
- **Dynamic Styles**: Runtime calculations, conditional styling
- **Platform-specific**: `Platform.select()` styles

### **Example Implementation:**
```tsx
// ✅ Good: Tailwind for layout and basic styling
<View className="flex-1 bg-white p-4">
  <Text className="text-2xl font-bold text-blue-600">
    Driver Dashboard
  </Text>
</View>

// ✅ Good: StyleSheet for animations
<Animated.View 
  style={{
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }]
  }}
  className="items-center justify-center"
>
```

## 🏗️ Project Structure

This project uses [file-based routing](https://docs.expo.dev/router/introduction). Key directories:

- **`app/`** - Main application screens and navigation
- **`app/(tabs)/`** - Tab-based navigation screens
- **`app/welcome.tsx`** - Animated welcome/splash screen
- **`components/`** - Reusable UI components
- **`assets/`** - Images, fonts, and static resources

## 🔧 Available Scripts

```bash
npm run dev          # Start with cache clearing (recommended)
npm run android:dev  # Android emulator with cache clearing
npm run ios:dev      # iOS simulator with cache clearing  
npm run web          # Web browser development
npm run start        # Basic expo start
npm run lint         # Code linting
```

## 🎯 YathraGo Driver Features

- **🚗 Real-time ride requests**
- **📍 GPS navigation integration**
- **💰 Earnings tracking**
- **⭐ Rating system**
- **📱 Push notifications**
- **🛣️ Route optimization**

## 🛠️ Development Guidelines

### **File Naming Convention:**
- Components: `PascalCase.tsx`
- Screens: `kebab-case.tsx` or `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`

### **Import Order:**
1. React/React Native imports
2. Third-party libraries
3. Local components
4. Utils and helpers
5. Type definitions

## 📦 Key Dependencies

- **expo-router** - File-based navigation
- **nativewind** - Tailwind CSS for React Native
- **expo-image** - Optimized image handling
- **react-native-reanimated** - Advanced animations

## 🚀 Deployment

When ready for production:

```bash
npm run build        # Build for production
npx expo export      # Export static files
```

## 📚 Learn More

### **YathraGo Resources:**
- **Project Documentation**: See `/docs` folder for detailed guides
- **API Documentation**: Backend integration guides
- **Design System**: UI/UX guidelines and components

### **Expo & React Native:**
- [Expo documentation](https://docs.expo.dev/) - Learn fundamentals and advanced topics
- [React Native documentation](https://reactnative.dev/) - Core React Native concepts
- [NativeWind documentation](https://www.nativewind.dev/) - Tailwind CSS for React Native

## 🤝 Contributing

1. Follow the CSS architecture guidelines above
2. Use TypeScript for type safety
3. Test on both Android and iOS
4. Follow the established file structure
5. Write clean, readable code with proper comments

## 🏃‍♂️ Join the Team

Building the future of ride-sharing in Sri Lanka! 🇱🇰

- **Frontend Team**: React Native, TypeScript, Expo
- **Backend Team**: Node.js, NestJS, PostgreSQL
- **Mobile Team**: iOS & Android development

---

**Happy Coding! 🎉**

---

# CSS Architecture Reference

## ✅ **Tailwind CSS Usage:**
- **Layout**: All flexbox, positioning, dimensions
- **Colors**: Background, text, border colors
- **Typography**: Font sizes, weights, alignment
- **Spacing**: Padding, margins, gaps

## ✅ **StyleSheet Usage:**
- **Animations**: Opacity, transforms, spring animations
- **Complex Transforms**: 3D transforms, perspective
- **Dynamic Styles**: Runtime calculations, conditional styles