import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Smartphone, Monitor, Share, MoreVertical, Download } from 'lucide-react';
import type { InstallPlatform } from '@/hooks/usePWAInstall';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: InstallPlatform;
}

const Step = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <li className="flex gap-3 items-start">
    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold text-sm flex items-center justify-center">
      {n}
    </span>
    <span className="text-gray-200 leading-relaxed pt-0.5">{children}</span>
  </li>
);

const InstallInstructionsDialog = ({ open, onOpenChange, platform }: Props) => {
  const Icon = platform === 'desktop' ? Monitor : Smartphone;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#13132a] border-amber-500/30 text-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl text-white">
              Install Cosmic Blueprint
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            Add the app to your {platform === 'desktop' ? 'desktop' : 'home screen'} for instant access — no app store needed.
          </DialogDescription>
        </DialogHeader>

        {platform === 'ios' && (
          <ol className="space-y-4 mt-2">
            <Step n={1}>
              Tap the <Share className="inline w-4 h-4 mx-1 -mt-0.5 text-blue-400" /> <strong>Share</strong> button in Safari's bottom toolbar.
            </Step>
            <Step n={2}>
              Scroll down and tap <strong>"Add to Home Screen"</strong>.
            </Step>
            <Step n={3}>
              Tap <strong>"Add"</strong> in the top-right corner to confirm.
            </Step>
            <li className="text-xs text-amber-300/80 mt-2 pl-10">
              Note: iOS only supports install from Safari, not Chrome or Firefox.
            </li>
          </ol>
        )}

        {platform === 'android' && (
          <ol className="space-y-4 mt-2">
            <Step n={1}>
              Tap the <MoreVertical className="inline w-4 h-4 mx-1 -mt-0.5 text-gray-300" /> <strong>menu</strong> button (three dots, top-right).
            </Step>
            <Step n={2}>
              Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
            </Step>
            <Step n={3}>
              Confirm by tapping <strong>"Install"</strong>.
            </Step>
          </ol>
        )}

        {platform === 'desktop' && (
          <ol className="space-y-4 mt-2">
            <Step n={1}>
              Look for the <Download className="inline w-4 h-4 mx-1 -mt-0.5 text-amber-400" /> <strong>install icon</strong> on the right side of your address bar.
            </Step>
            <Step n={2}>
              Click it, then click <strong>"Install"</strong> in the popup.
            </Step>
            <li className="text-xs text-gray-400 mt-2 pl-10">
              No icon visible? Open the browser menu (<MoreVertical className="inline w-3 h-3 -mt-0.5" />) → <strong>"Install Cosmic Blueprint…"</strong> or <strong>"Cast, save, and share"</strong> → <strong>"Install page as app"</strong>.
            </li>
            <li className="text-xs text-amber-300/80 pl-10">
              Works best in Chrome, Edge, Brave, or Opera. Firefox and Safari desktop don't support PWA install.
            </li>
          </ol>
        )}

        <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-500">
          Already installed? You can launch the app from your {platform === 'desktop' ? 'Start menu, Dock, or Applications folder' : 'home screen'}.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallInstructionsDialog;
