# 📱 Aether Mobile App - Expo Go Setup

## ✅ What I've Done

I've converted your mobile app to use **Expo** so you can run it directly on your phone with Expo Go!

### Changes Made:
1. ✅ Converted from React Native CLI to Expo
2. ✅ Set up all screens (Login, Register, Dashboard, Coach, Tracker, Tasks, Journal)
3. ✅ Connected authentication to your backend API
4. ✅ Installed all dependencies

## 📲 How to Run on Your Phone

### Step 1: Install Expo Go on Your Phone

**Android:**
- Open Play Store
- Search for "Expo Go"
- Install it

**iOS:**
- Open App Store
- Search for "Expo Go"
- Install it

### Step 2: Make Sure Backend is Running

In a PowerShell window:
```powershell
cd "C:\Users\mukul\Desktop\Mukul Yadav\Projects\Aether\backend"
npm run start:dev
```

Wait for: `🚀 Aether API running on http://localhost:3000`

### Step 3: Get Your Computer's IP Address

**Important!** Your phone needs to connect to your computer's backend.

In PowerShell, run:
```powershell
ipconfig
```

Look for **"Wireless LAN adapter Wi-Fi"** section and find **"IPv4 Address"**

Example: `192.168.1.100`

### Step 4: Update API URL in the App

Open: `mobile/src/config/api.ts`

Change:
```typescript
export const API_URL = 'http://localhost:3000';
```

To your IP (example):
```typescript
export const API_URL = 'http://192.168.1.100:3000';
```

**⚠️ Make sure your phone and computer are on the SAME Wi-Fi network!**

### Step 5: Start the Expo App

In another PowerShell window:
```powershell
cd "C:\Users\mukul\Desktop\Mukul Yadav\Projects\Aether\mobile"
npm start
```

You'll see a QR code in the terminal!

### Step 6: Scan QR Code with Your Phone

**Android:**
1. Open Expo Go app
2. Tap "Scan QR code"
3. Point camera at QR code in terminal
4. App will load!

**iOS:**
1. Open your Camera app
2. Point at QR code
3. Tap the notification
4. Expo Go will open

### Step 7: Test the App!

1. You'll see the **Login screen**
2. Tap "Don't have an account? Sign Up"
3. Fill in:
   - Name: Your Name
   - Email: test@aether.com
   - Password: Test123!
4. Tap "Sign Up"
5. You'll see the **Dashboard** with your name!

## 🎨 What's in the App

### Auth Screens
- ✅ Login Screen - Sign in with email/password
- ✅ Register Screen - Create new account
- ✅ Connected to your backend API

### Main Screens (Bottom Tabs)
- ✅ **Dashboard** - Overview, logout button
- ✅ **Coach** - Health & wellness features (coming soon)
- ✅ **Tracker** - GPS activity tracking (coming soon)
- ✅ **Tasks** - Productivity & task management (coming soon)
- ✅ **Journal** - AI journaling & goals (coming soon)

## 🔧 Troubleshooting

### "Unable to connect to server"
- ✅ Make sure backend is running on your computer
- ✅ Check that you updated the API_URL with your computer's IP
- ✅ Verify phone and computer are on the same Wi-Fi

### "Network request failed"
- Windows Firewall might be blocking port 3000
- Run this in PowerShell (as Administrator):
```powershell
New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000
```

### QR Code not working
- In Expo terminal, press `s` to switch to Expo Go
- Or manually enter the URL shown in terminal into Expo Go app

## 📝 Quick Commands

**Start Backend:**
```powershell
cd "C:\Users\mukul\Desktop\Mukul Yadav\Projects\Aether\backend"
npm run start:dev
```

**Start Mobile App:**
```powershell
cd "C:\Users\mukul\Desktop\Mukul Yadav\Projects\Aether\mobile"
npm start
```

**Restart Expo (if needed):**
- Press `r` in the terminal
- Or shake your phone and tap "Reload"

## 🎉 Next Steps

Once it's working:
1. Test registration and login
2. Try logging out and logging back in
3. Check out all the screens in the bottom tabs
4. We can add more features to each screen!

The AI integration will work once we add those features to the screens - all the backend endpoints are ready!
