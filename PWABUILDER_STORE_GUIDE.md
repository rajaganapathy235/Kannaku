# 🚀 JustGST — Complete PWABuilder Android & iOS Store Publishing Guide

This guide documents everything you need to generate **Google Play Store (Android)** and **Apple App Store (iOS)** packages using **[PWABuilder](https://www.pwabuilder.com/)** from Microsoft.

Our web application at **`https://justgst.in`** is now **100% PWABuilder compliant** across all 3 audit pillars:
1. ✅ **Web App Manifest**: Valid ID, display_override, maskable icons (192 & 512), screenshots (desktop & mobile), shortcuts, protocol handlers.
2. ✅ **Service Worker**: Cache-first / Network-first fetch handler with offline fallback (`/offline.html`), background update lifecycle (`skipWaiting` & `clients.claim`).
3. ✅ **Security & Device Capabilities**: HTTPS/TLS, viewport-fit cover, Apple mobile status bar, Web Share, Haptics, WebAuthn Biometrics, Bluetooth POS.

---

## 📱 Part 1: Generating the Android App (Google Play Store)

PWABuilder packages your PWA into an **Android Trusted Web Activity (TWA)** using Google's official Bubblewrap engine.

### Step 1.1: Audit on PWABuilder
1. Go to **[https://www.pwabuilder.com](https://www.pwabuilder.com)**.
2. Enter your live URL: `https://justgst.in` and click **Start**.
3. You will see green checkmarks across **Manifest**, **Service Worker**, and **Security**.

### Step 1.2: Package for Android
1. Click **Package for Stores** → **Android**.
2. Click **Options** (Gear icon) to configure:
   - **Package ID / Application ID**: `in.justgst.app`
   - **App Name**: `JustGST`
   - **Short Name**: `JustGST`
   - **Theme Color**: `#059669`
   - **Background Color**: `#ffffff`
   - **Splash Screen Color**: `#059669`
   - **Status Bar Color**: `#059669`
   - **Navigation Bar Color**: `#ffffff`
   - **Display Mode**: `Standalone` or `Fullscreen`
   - **Fallback Type**: `Custom Tabs`
   - **Signing Key**:
     - *Option A (Recommended for Google Play)*: Select **"Upload My Key"** or click **"Generate New Key"** (PWABuilder will give you a `.zip` containing your `signing.keystore` and `assetlinks.json`).
     - Save the generated `.keystore` and key passwords in a secure password manager!
3. Click **Generate Package**.
4. Download the resulting `.zip` file. Inside you will find:
   - `app-release-bundle.aab` *(The final file to upload to Google Play Console)*
   - `assetlinks.json` *(Digital Asset Links file)*

### Step 1.3: Verify Digital Asset Links (No URL Bar)
1. Digital Asset Links enables your Android app to run **100% full screen with no browser URL bar or address bar**.
2. We have already placed your `assetlinks.json` in `public/.well-known/assetlinks.json`.
3. If you generated a new keystore on PWABuilder, update the `sha256_cert_fingerprints` inside `public/.well-known/assetlinks.json` with the SHA-256 fingerprint provided by PWABuilder or Google Play App Signing.

### Step 1.4: Upload to Google Play Console
1. Log into **[Google Play Console](https://play.google.com/console)**.
2. Click **Create App** → App name: `JustGST`, Category: `Business / Finance`.
3. Under **Production** (or **Closed Testing**), click **Create new release** and drag-and-drop `app-release-bundle.aab`.
4. Fill in Store Listing (Screenshots from `icon-512.png` and app screenshots, Privacy Policy: `https://justgst.in/privacy`).
5. Submit for review!

---

## 🍏 Part 2: Generating the iOS App (Apple App Store)

PWABuilder generates an **Xcode iOS Project** utilizing WebKit (WKWebView) wrapped in Swift.

### Step 2.1: Package for iOS on PWABuilder
1. On PWABuilder, click **Package for Stores** → **iOS**.
2. Click **Options** to customize:
   - **Bundle Identifier**: `in.justgst.app` (or your Apple Developer Bundle ID, e.g. `com.yourcompany.justgst`)
   - **App Name**: `JustGST`
   - **URL**: `https://justgst.in`
   - **Status Bar Color**: `#059669` or Dark
3. Click **Generate**.
4. Download the generated **Xcode iOS Source Project `.zip`**.

### Step 2.2: Open & Sign in Apple Xcode (Mac)
1. Unzip the downloaded iOS package on a Mac.
2. Double-click the `.xcodeproj` file to open it in **Xcode**.
3. In Xcode, click on the **JustGST** root project item in the left sidebar:
   - Under **Signing & Capabilities**:
     - Check **"Automatically manage signing"**.
     - Select your **Apple Developer Team**.
4. Under **Info.plist**:
   - Ensure Camera / Location permissions description strings are present if needed.

### Step 2.3: Build & Distribute to App Store Connect / TestFlight
1. Connect your iPhone via USB or select **"Any iOS Device (arm64)"** in Xcode.
2. In the top Xcode menu, click **Product** → **Archive**.
3. Once the Archive build finishes, the **Xcode Organizer** window opens automatically.
4. Click **Distribute App** → **App Store Connect** → **Upload**.
5. Within 10 minutes, the build will appear on **[App Store Connect](https://appstoreconnect.apple.com)** under TestFlight and App Store submission.

---

## 🛡️ Part 3: Store Submission & Review Notes (Zero Rejections)

### Apple Review Note (Guideline 3.1.3b Compliance):
Paste this into the Review Notes box in App Store Connect:
> *"JustGST is a multi-platform B2B cloud GST billing, invoicing, and tax accounting utility for registered Indian business entities. Subscriptions and billing are per-business organization and used across Web, POS Desktop, and Mobile interfaces compliant with Guideline 3.1.3(b)."*

### Reviewer Demo Account:
Provide login credentials so Apple and Google reviewers can test without registration:
- **Email**: `demo@justgst.in`
- **Password**: `DemoPass@123`

---

## ⚙️ Architecture Summary & Verification

| Asset / Endpoint | Location in Repo | Role |
| :--- | :--- | :--- |
| **Web Manifest** | `public/manifest.json` | PWA installation & PWABuilder schema |
| **Service Worker** | `public/sw.js` | Caching & instant offline fallback |
| **Offline Fallback** | `public/offline.html` | Emerald branded "No Connection" UI |
| **Digital Asset Links** | `public/.well-known/assetlinks.json` | Removes Android TWA address bar |
| **PWA Auto Updater** | `src/components/PwaUpdateHandler.tsx` | Background refresh without cache clearing |
| **Hardware Capabilities** | `src/utils/nativeCapabilities.ts` | Haptics, WebAuthn, Native Share, Bluetooth |
| **Network Status Banner** | `src/hooks/useNetworkStatus.tsx` | Real-time offline/online toast |
