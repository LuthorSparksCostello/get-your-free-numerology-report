import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Augment window to include our early-captured prompt
declare global {
  interface Window {
    __pwaInstallPrompt: BeforeInstallPromptEvent | null;
  }
}

/**
 * Hook for PWA install. Picks up the beforeinstallprompt event
 * that was captured in index.html (before React mounted).
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    // Check if prompt was already captured before React mounted
    () => window.__pwaInstallPrompt || null
  );
  const [isInstalled, setIsInstalled] = useState(false);

  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  useEffect(() => {
    // Already running as installed PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for the custom event dispatched by index.html
    const onAvailable = () => {
      if (window.__pwaInstallPrompt) {
        setDeferredPrompt(window.__pwaInstallPrompt);
      }
    };

    // Also listen for native event (in case it fires after mount)
    const onNative = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      window.__pwaInstallPrompt = prompt;
      setDeferredPrompt(prompt);
    };

    window.addEventListener('pwa-install-available', onAvailable);
    window.addEventListener('beforeinstallprompt', onNative);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__pwaInstallPrompt = null;
    });

    return () => {
      window.removeEventListener('pwa-install-available', onAvailable);
      window.removeEventListener('beforeinstallprompt', onNative);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    // Use the captured native prompt
    const prompt = deferredPrompt || window.__pwaInstallPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
      setDeferredPrompt(null);
      window.__pwaInstallPrompt = null;
      return outcome === 'accepted';
    }

    // iOS Safari fallback
    if (isIOS) {
      alert(
        'To install this app on your device:\n\n' +
        '1. Tap the Share button (□↑) at the bottom\n' +
        '2. Scroll down and tap "Add to Home Screen"\n' +
        '3. Tap "Add" to confirm'
      );
      return false;
    }

    // Desktop fallback
    alert(
      'To install this app:\n\n' +
      '• Chrome/Edge: Click the install icon (⊕) in the address bar\n' +
      '• Or open browser menu (⋮) → "Install app" or "Add to Home Screen"'
    );
    return false;
  }, [deferredPrompt, isIOS]);

  return {
    canInstall: !isInstalled,
    hasNativePrompt: !!deferredPrompt || !!window.__pwaInstallPrompt,
    isInstalled,
    promptInstall,
  };
}
