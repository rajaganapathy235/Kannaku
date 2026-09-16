# JustGST — Native Android & iOS Mobile App Build Guide (Option B: Live-Server Mode)

This document provides a complete, step-by-step guide to building, packaging, and publishing the **JustGST** native mobile apps for **Android (Google Play Store)** and **iOS (Apple App Store)** using **Capacitor in Live-Server Mode**.

---

## 🌟 Why This Architecture?
With **Live-Server Mode**:
1. Whenever you modify code in **Google AI Studio** and push to **GitHub**, **Cloudflare** automatically rebuilds and deploys `https://justgst.in`.
2. Both your **Android** and **iOS** apps will **instantly reflect all UI, invoice engine, report, and feature updates** on the next app open without needing to rebuild or re-submit binaries to Google Play or Apple App Store.
3. You only submit a new binary (`.aab` / `.ipa`) if you modify native hardware permissions (e.g. camera, push notifications) or app icons.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have the following installed on your development machine:

### 1. Common Tools (All Platforms)
- **Node.js (v18 or v20 LTS)**: [Download Node.js](https://nodejs.org/)
- **Git**: [Download Git](https://git-scm.com/)

### 2. For Android (Windows, Mac, or Linux)
- **Android Studio (Ladybug / Koala or newer)**: [Download Android Studio](https://developer.android.com/studio)
  - Ensure **Android SDK (API 34 / 35)** and **Android SDK Command-line Tools** are installed via Android Studio SDK Manager.
- **Java JDK 17 or 21**: Android Studio installs this bundled in `jbr`.

### 3. For iOS (macOS Required)
- **Mac Computer** (MacBook, Mac mini, or Mac Studio with macOS Sonoma or Sequoia).
- **Xcode 15 or 16**: [Download from Mac App Store](https://apps.apple.com/app/xcode/id497799835)
- **CocoaPods**: Install via terminal: `sudo gem install cocoapods` or `brew install cocoapods`

---

## 🚀 Step 1: Clone Repository & Install Dependencies

Open your computer's terminal (Terminal on Mac, or PowerShell / Command Prompt on Windows):

```bash
# 1. Clone your repository
git clone https://github.com/your-username/justgst.git
cd justgst

# 2. Install existing project dependencies
npm install

# 3. Install Capacitor Core, CLI, and Native Platforms
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# 4. Install recommended native hardware plugins
npm install @capacitor/camera @capacitor/barcode-scanner @capacitor/network @capacitor/preferences @capacitor/haptics @capacitor/share @capacitor/status-bar @capacitor/splash-screen
```

---

## ⚙️ Step 2: Create Capacitor Configuration

Create a file named `capacitor.config.ts` in the root folder of your project:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.justgst.app',
  appName: 'JustGST',
  webDir: 'dist',
  server: {
    // Points the native shell to the live Cloudflare deployment
    url: 'https://justgst.in',
    cleartext: false,
    allowNavigation: [
      'justgst.in',
      '*.justgst.in',
      'accounts.google.com',
      '*.payu.in',
      'secure.payu.in',
      'test.payu.in',
      '*.payubiz.in',
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      backgroundColor: '#059669',
      showSpinner: false,
      androidSplashResourceName: 'splash',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#059669',
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
  },
};

export default config;
```

---

## 🎨 Step 3: Auto-Generate App Icons & Splash Screens

Capacitor has an automatic asset generator tool that cuts all required icon sizes (mdpi, hdpi, xhdpi, xxinter, iOS 1x, 2x, 3x) from your single 512x512 logo.

```bash
# 1. Install asset generator tool
npm install -g @capacitor/assets

# 2. Create an assets directory
mkdir -p assets

# 3. Copy your 512x512 logo into assets/
# (Use the public/icon-512.png already in the project)
cp public/icon-512.png assets/icon-only.png
cp public/icon-512.png assets/icon-foreground.png
cp public/icon-512.png assets/icon-background.png
cp public/icon-512.png assets/splash.png

# 4. Build the web dist first
npm run build

# 5. Initialize the native project folders
npx cap add android
npx cap add ios

# 6. Auto-generate all required Android & iOS icons/splashes
npx @capacitor/assets generate
```

---

## 🤖 Step 4: Building the Android App (`.aab` for Google Play)

### 4.1 Open Android Studio
Run the following command to open the native Android project in Android Studio:
```bash
npx cap open android
```

### 4.2 Test on Emulator or Real Phone
1. Connect an Android device via USB (with USB Debugging enabled) or start an Android Emulator.
2. Click the green **Play (Run)** button in Android Studio.
3. Test billing, invoice generation, WhatsApp sharing, and camera barcode scanning.

### 4.3 Generate Signed Production Bundle (.aab) for Google Play
1. In Android Studio's top menu, go to **Build** → **Generate Signed Bundle / APK...**
2. Select **Android App Bundle (.aab)** and click **Next**.
3. **Key store path**: Click **Create new...**
   - Save the key file somewhere secure (e.g. `justgst-release-key.jks`).
   - Fill in a strong password and your company details.
   - ⚠️ **CRITICAL**: Back up this `.jks` file and password. If lost, Google Play will not allow you to update your app!
4. Select **release** build variant and check **V2 (Full APK Signature)**.
5. Click **Finish**. Android Studio will generate `app-release.aab` located in `android/app/release/`.

---

## 🍏 Step 5: Building the iOS App (`.ipa` for Apple App Store)

*(Requires a Mac with Xcode and an active Apple Developer Program membership)*

### 5.1 Open Xcode
Run the following command:
```bash
npx cap open ios
```

### 5.2 Configure Signing & Capabilities
1. In Xcode's left sidebar, click the top-level **App** project.
2. Go to the **Signing & Capabilities** tab.
3. Check **Automatically manage signing**.
4. Select your **Team** (your Apple Developer Account).
5. Ensure Bundle Identifier is `in.justgst.app`.

### 5.3 Test on iOS Simulator or Real iPhone
1. Select a simulator (e.g., *iPhone 16 Pro*) or your plugged-in iPhone.
2. Click **Run (Play)** button to test.

### 5.4 Archive & Upload to Apple App Store Connect
1. In Xcode's device selector at the top, select **Any iOS Device (arm64)**.
2. In the top menu, go to **Product** → **Archive**.
3. Once the archive completes, the **Organizer** window will pop up.
4. Click **Distribute App** → **App Store Connect** → **Upload**.
5. Follow the prompts to upload. Within 10–15 minutes, the build will appear on [App Store Connect](https://appstoreconnect.apple.com) under TestFlight & App Store submission.

---

## 🛡️ Step 6: Store Approval Playbook (Zero Rejection Tips)

### Google Play Store Approval Checklist
1. **Google Play Console Account**: $25 one-time registration fee.
2. **Privacy Policy URL**: `https://justgst.in/privacy`
3. **Terms of Service URL**: `https://justgst.in/terms`
4. **Data Safety Form**:
   - Data collected: Name, Email address, GST number, Customer ledger info.
   - Purpose: App functionality & account management.
   - Security: Data is encrypted in transit (HTTPS/TLS) and users can delete their account via Settings.
5. **Testing Requirements**:
   - If using a **Personal Account** created after Nov 2023, Google requires a 14-day closed test with 20 opt-in testers before production access.
   - If using an **Organization Account** (D-U-N-S registered), you can publish directly to Production.

### Apple App Store Approval Checklist (Guideline Compliance)
1. **Apple Developer Program**: $99/year.
2. **Account Deletion (Guideline 5.1.1)**: Ensure the "Delete Account / Reset Data" feature in Settings is functional.
3. **B2B Multiplatform Exemption (Guideline 3.1.3b)**:
   - When submitting review notes to Apple, paste this exact explanation:
     > *"JustGST is a multi-platform B2B cloud GST billing and invoicing software for registered Indian small businesses and enterprises. Subscriptions are billed per business account and allow access across Web, POS Desktop, and Mobile interfaces. Payments are business-to-business subscriptions compliant with Section 3.1.3(b)."*
4. **Demo Account for App Reviewer**:
   - Provide demo credentials in App Store Connect:
     - **Email**: `demo@justgst.in` (or a dedicated reviewer account)
     - **Password**: `DemoPass@123`

---

## 🔄 Step 7: The Ongoing Workflow (How Updates Work)

Once your apps are live in the stores:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Edit features/UI in Google AI Studio                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Commit & Push changes to GitHub                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Cloudflare automatically builds & deploys to justgst.in  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Native Android & iOS apps instantly receive new changes! │
│    (No app store review or re-compilation needed!)          │
└─────────────────────────────────────────────────────────────┘
```

You are now fully set up to release JustGST as a native Android and iOS app!
