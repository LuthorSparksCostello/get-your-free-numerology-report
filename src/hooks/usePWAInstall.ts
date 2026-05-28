import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __pwaInstallPrompt: BeforeInstallPromptEvent | null;
  }
}

export type InstallPlatform = 'ios' | 'android' | 'desktop';

function detectPlatform(): InstallPlatform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => (typeof window !== 'undefined' ? window.__pwaInstallPrompt || null : null)
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const platform = detectPlatform();

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const onAvailable = () => {
      if (window.__pwaInstallPrompt) {
        setDeferredPrompt(window.__pwaInstallPrompt);
      }
    };

    const onNative = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      window.__pwaInstallPrompt = prompt;
      setDeferredPrompt(prompt);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__pwaInstallPrompt = null;
    };

    window.addEventListener('pwa-install-available', onAvailable);
    window.addEventListener('beforeinstallprompt', onNative);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('pwa-install-available', onAvailable);
      window.removeEventListener('beforeinstallprompt', onNative);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const prompt = deferredPrompt || window.__pwaInstallPrompt;
    if (prompt) {
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') setIsInstalled(true);
        setDeferredPrompt(null);
        window.__pwaInstallPrompt = null;
        return outcome === 'accepted';
      } catch {
        setShowInstructions(true);
        return false;
      }
    }

    setShowInstructions(true);
    return false;
  }, [deferredPrompt]);

  return {
    canInstall: !isInstalled,
    hasNativePrompt: !!deferredPrompt,
    isInstalled,
    platform,
    showInstructions,
    setShowInstructions,
    promptInstall,
  };
}
