/**
 * JustGST Native Mobile Web Capabilities Utility
 * Provides lightweight, zero-dependency bridges to native device hardware in PWAs/TWAs
 */

// ==========================================
// 1. Haptic Feedback (Vibration API)
// ==========================================

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

/**
  * Triggers a subtle native vibration pattern.
  * Degrades gracefully on devices or browsers that do not support navigator.vibrate.
  */
export function triggerHaptic(style: HapticStyle = 'light'): boolean {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return false;
  }

  try {
    switch (style) {
      case 'selection':
      case 'light':
        return navigator.vibrate(12);
      case 'medium':
        return navigator.vibrate(25);
      case 'heavy':
        return navigator.vibrate(45);
      case 'success':
        // Short double-tap pulse
        return navigator.vibrate([15, 60, 20]);
      case 'warning':
        return navigator.vibrate([30, 80, 30]);
      case 'error':
        // Triple error buzz
        return navigator.vibrate([50, 60, 50, 60, 50]);
      default:
        return navigator.vibrate(15);
    }
  } catch (err) {
    console.debug('[Haptics] Failed to vibrate:', err);
    return false;
  }
}

// ==========================================
// 2. Native Share API (WhatsApp, Files, URLs)
// ==========================================

export interface NativeShareOptions {
  title: string;
  text?: string;
  url?: string;
  files?: File[];
}

/**
 * Shares text, URLs, or generated PDF invoice files via native Android/iOS system share sheets.
 * Falls back to clipboard or custom action if navigator.share is unavailable.
 */
export async function shareContent(options: NativeShareOptions): Promise<{ success: boolean; shared: boolean; method: 'native' | 'clipboard' | 'fallback' }> {
  const { title, text, url, files } = options;

  // Check if Web Share API is supported
  if (typeof window !== 'undefined' && navigator.share) {
    try {
      const shareData: ShareData = {
        title,
        text,
        url: url || window.location.href,
      };

      // Check if file sharing is supported
      if (files && files.length > 0 && navigator.canShare && navigator.canShare({ files })) {
        shareData.files = files;
      }

      await navigator.share(shareData);
      triggerHaptic('success');
      return { success: true, shared: true, method: 'native' };
    } catch (err: any) {
      // User cancelled the share dialog
      if (err.name === 'AbortError') {
        return { success: true, shared: false, method: 'native' };
      }
      console.warn('[NativeShare] Share failed, falling back:', err);
    }
  }

  // Fallback: Copy link to clipboard
  try {
    const copyTarget = url || text || window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(copyTarget);
      triggerHaptic('selection');
      return { success: true, shared: true, method: 'clipboard' };
    }
  } catch (copyErr) {
    console.warn('[NativeShare] Clipboard copy failed:', copyErr);
  }

  return { success: false, shared: false, method: 'fallback' };
}

// ==========================================
// 3. Biometric Authentication (WebAuthn)
// ==========================================

export interface BiometricCheckResult {
  available: boolean;
  type: 'fingerprint' | 'face' | 'screen_lock' | 'none';
}

/**
 * Checks if the device has biometric hardware (Fingerprint / Face ID / Touch ID / Device PIN)
 */
export async function isBiometricsAvailable(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }

  try {
    // Check platform authenticator support (Android Biometric / TouchID / Windows Hello)
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Prompts the user with native biometrics (Fingerprint / Face ID) for sensitive actions
 * like resetting accounting data, viewing company GST secrets, or releasing ledgers.
 */
export async function promptBiometricAuth(challengeMessage = 'Authenticate with Biometrics'): Promise<boolean> {
  if (!(await isBiometricsAvailable())) {
    return false;
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname,
      },
    });

    if (credential) {
      triggerHaptic('success');
      return true;
    }
    return false;
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      console.info('[Biometrics] User cancelled or biometric prompt timed out');
    } else {
      console.warn('[Biometrics] Auth error:', err);
    }
    triggerHaptic('error');
    return false;
  }
}

// ==========================================
// 4. Mobile Wake Lock (Prevents Screen Dimming on Counter POS)
// ==========================================

let wakeLockSentinel: any = null;

/**
 * Keeps device screen awake during active POS counter checkout sessions
 */
export async function requestScreenWakeLock(): Promise<boolean> {
  if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
    try {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    } catch (err) {
      console.debug('[WakeLock] Could not acquire lock:', err);
    }
  }
  return false;
}

export function releaseScreenWakeLock(): void {
  if (wakeLockSentinel) {
    wakeLockSentinel.release().catch(() => {});
    wakeLockSentinel = null;
  }
}

// ==========================================
// 5. Bluetooth POS Thermal Printer Scanner
// ==========================================

export interface BluetoothPrinterDevice {
  id: string;
  name: string;
  device: any;
  server?: any;
}

/**
 * Scans for nearby ESC/POS Bluetooth thermal receipt printers (2-inch or 3-inch counter POS)
 * using the Web Bluetooth API.
 */
export async function connectBluetoothPrinter(): Promise<{ success: boolean; device?: BluetoothPrinterDevice; error?: string }> {
  if (typeof window === 'undefined' || !(navigator as any).bluetooth) {
    return {
      success: false,
      error: 'Web Bluetooth API is not supported on this browser or device.',
    };
  }

  try {
    triggerHaptic('light');
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', // Standard Serial / POS Printer service
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // ESC/POS Printer service
        '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Microchip RN4020
      ],
    });

    if (!device) {
      return { success: false, error: 'No printer device selected.' };
    }

    triggerHaptic('success');
    return {
      success: true,
      device: {
        id: device.id,
        name: device.name || 'Bluetooth POS Printer',
        device,
      },
    };
  } catch (err: any) {
    if (err.name === 'NotFoundError') {
      return { success: false, error: 'Device selection was cancelled.' };
    }
    triggerHaptic('error');
    return { success: false, error: err.message || 'Failed to connect to Bluetooth printer.' };
  }
}

// ==========================================
// 6. Geolocation Utility (For E-Way Bill / Dispatch Logs)
// ==========================================

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

/**
 * Fetches the user's high-accuracy current location for GST E-Way dispatch logs and delivery location stamps.
 */
export function getCurrentLocation(timeoutMs = 10000): Promise<{ success: boolean; coordinates?: GeoCoordinates; error?: string }> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve({
        success: false,
        error: 'Geolocation is not supported by your browser or device.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          },
        });
      },
      (error) => {
        let errorMessage = 'Failed to acquire location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission was denied.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is currently unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        resolve({ success: false, error: errorMessage });
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 60000,
      }
    );
  });
}

