# YathraGo Mobile Customer App �

This is the YathraGo customer mobile app built with [Expo](https://expo.dev) and React Native.

## Features ✨

- **Beautiful Splash Screen** with YathraGo logo animation
- **Modern UI** with NativeWind (Tailwind CSS for React Native)
- **File-based Routing** with Expo Router
- **Cross-platform** support (iOS, Android, Web)
- **TypeScript** for type safety

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start --clear
   ```

3. **Development with Auto-Reload** (Recommended)

   ```bash
   npm run dev
   ```
   
   This command enables:
   - 🔄 Automatic hot reload
   - 🧹 Auto cache clearing
   - ⚡ Fast refresh
   - 📱 Live updates on save

## Available Scripts 📋

```bash
# Development with auto-reload (Best for development)
npm run dev

# Start with clear cache
npm run start:clear

# Platform-specific with auto-reload
npm run android:dev
npm run ios:dev

# Regular start commands
npm start
npm run android
npm run ios
npm run web
```

## Project Structure 📁

```
mobile-customer/
├── app/                    # File-based routing
│   ├── welcome.tsx         # Splash screen with logo animation
│   ├── index.tsx          # App entry point
│   └── (tabs)/            # Tab navigation
├── assets/                # Images and fonts
├── components/            # Reusable UI components
└── constants/             # App constants and colors
```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Development Tips 💡

- **Hot Reload**: Changes to your code will automatically appear in the app
- **Clear Cache**: Use `--clear` flag if you encounter caching issues
- **Fast Refresh**: React components update instantly while preserving state
- **File-based Routing**: Add new screens by creating files in the `app/` directory

## Current Implementation 🎯

✅ **Welcome Screen** - Animated splash screen with YathraGo logo  
✅ **Navigation Setup** - Tab-based navigation structure  
✅ **Styling System** - NativeWind (Tailwind CSS) integration  
✅ **TypeScript** - Full type safety and IntelliSense  
✅ **Cross-platform** - Works on iOS, Android, and Web  

## Next Development Steps 🚀

- [ ] User Authentication
- [ ] Map Integration for Ride Booking
- [ ] Real-time Driver Tracking
- [ ] Payment Integration
- [ ] Ride History
- [ ] Push Notifications

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# for the css used
Tailwind: All layout, colors, typography, spacing
StyleSheet: Animations, complex transforms, dynamic styles

# start the emulator "emulator -avd emulator"