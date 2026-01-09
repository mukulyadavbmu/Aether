# Aether Mobile App

React Native mobile application for Aether AI Life Coach.

## Prerequisites

- Node.js 18+
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env` file in the `mobile` directory:
   ```
   API_URL=http://localhost:3000
   MAPBOX_ACCESS_TOKEN=your_mapbox_token
   ```

3. **For Android:**
   - Open Android Studio
   - Open the `android` folder
   - Let Gradle sync
   - Run:
     ```bash
     npm run android
     ```

4. **For iOS (macOS only):**
   ```bash
   cd ios
   pod install
   cd ..
   npm run ios
   ```

## Project Structure

```
mobile/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication
│   │   ├── coach/        # Health & fitness
│   │   ├── tracker/      # GPS tracking
│   │   ├── productivity/ # Tasks & focus
│   │   ├── journal/      # Journaling & goals
│   │   └── dashboard/    # Home screen
│   ├── navigation/       # Navigation config
│   ├── shared/           # Shared utilities
│   └── App.tsx          # Entry point
├── android/             # Android native code
├── ios/                 # iOS native code
└── package.json
```

## Key Features (In Development)

- ✅ Authentication flow
- ✅ Dashboard UI
- 🚧 Diet logging with AI
- 🚧 GPS activity tracking
- 🚧 Task management
- 🚧 Daily journaling
- 🚧 App limiter (Android)

## Running Tests

```bash
npm test
```

## Building for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
cd ios
xcodebuild -workspace Aether.xcworkspace -scheme Aether -configuration Release
```

## Troubleshooting

**Metro bundler issues:**
```bash
npm start -- --reset-cache
```

**Android build errors:**
```bash
cd android
./gradlew clean
cd ..
```

**iOS pod issues:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```
