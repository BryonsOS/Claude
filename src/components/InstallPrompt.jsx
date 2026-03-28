import { useState, useEffect } from 'react';

function isRunningStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isIosSafari() {
  const ua = window.navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|opios/i.test(ua);
  return isIos && isSafari;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isRunningStandalone()) return;
    if (localStorage.getItem('pwa-install-dismissed') === 'true') return;

    if (isIosSafari()) {
      const t = setTimeout(() => setShowIosHint(true), 2000);
      return () => clearTimeout(t);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') setDismissed(true);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setDeferredPrompt(null);
    setShowIosHint(false);
    setDismissed(true);
  };

  if (dismissed || (!deferredPrompt && !showIosHint)) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-30 max-w-sm mx-auto">
      <div
        className="rounded-2xl shadow-xl px-4 py-3 flex items-start gap-3"
        style={{ backgroundColor: '#6366f1', color: 'white' }}
      >
        <span className="text-2xl mt-0.5 flex-shrink-0">🏠</span>

        <div className="flex-1 min-w-0">
          {showIosHint ? (
            <>
              <p className="font-semibold text-sm leading-tight">Add to Home Screen</p>
              <p className="text-xs mt-1 leading-snug" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Tap <strong>Share</strong> (⎙) then{' '}
                <strong>"Add to Home Screen"</strong> for the full app experience.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-sm leading-tight">Install ChoreFamily</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Add to your home screen for the best experience.
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              className="text-xs font-bold bg-white rounded-full px-3 py-1"
              style={{ color: '#6366f1' }}
            >
              Install
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="text-xs"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
