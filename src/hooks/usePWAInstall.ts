import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Hook for PWA install. The install button is ALWAYS visible
 * (unless already installed). Click behavior adapts to the platform.
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
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

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = useCallback(async () => {
    // Native prompt available (Chrome/Edge Android & desktop)
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
      setDeferredPrompt(null);
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

    // Desktop fallback (Chrome/Edge/Firefox)
    alert(
      'To install this app:\n\n' +
      '• Chrome/Edge: Click the install icon (⊕) in the address bar\n' +
      '• Or open browser menu (⋮) → "Install app" or "Add to Home Screen"'
    );
    return false;
  }, [deferredPrompt, isIOS]);

  return {
    // Always show unless already installed as standalone
    canInstall: !isInstalled,
    isInstalled,
    promptInstall,
  };
}
