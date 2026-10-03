'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, Sparkles, Check } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone (PWA installed) mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Check if user dismissed prompt in this session
    const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
    if (dismissed) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice && !isStandaloneMode) {
      // Delay showing on iOS so page loads smoothly first
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    // Capture Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install banner after 1.5s
      setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div
      className="animate-slide-up"
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        left: '1rem',
        right: '1rem',
        maxWidth: '440px',
        margin: '0 auto',
        zIndex: 9999,
        backgroundColor: '#0f172a',
        color: '#ffffff',
        borderRadius: '20px',
        padding: '1.1rem 1.25rem',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        border: '1.5px solid #ea580c',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Logo icon container */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              overflow: 'hidden',
              flexShrink: 0,
              backgroundColor: '#1e1b4b',
              border: '1.5px solid #fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/logo.svg"
              alt="Saffron & Spice Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Install Saffron & Spice App
              </h4>
              <span
                style={{
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.1rem 0.4rem',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                }}
              >
                PWA
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.2rem 0 0', lineHeight: 1.3 }}>
              Fast 1-tap table ordering & offline support
            </p>
          </div>
        </div>

        {/* Close / Dismiss */}
        <button
          onClick={handleDismiss}
          title="Dismiss"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '0.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Action Area: Android Install Button OR iOS Instructions */}
      <div style={{ marginTop: '0.85rem' }}>
        {isIOS ? (
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '0.75rem',
              fontSize: '0.78rem',
              color: '#e2e8f0',
              lineHeight: 1.45,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', fontWeight: 700, color: '#fba74c' }}>
              <Smartphone size={15} />
              <span>How to Install on iPhone / iPad:</span>
            </div>
            <p style={{ margin: 0 }}>
              1. Tap the <strong>Share</strong> button <Share size={13} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} /> in Safari.<br />
              2. Scroll down & tap <strong>"Add to Home Screen"</strong> <PlusSquare size={13} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} />.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button
              onClick={handleInstallClick}
              className="btn-primary"
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                fontSize: '0.85rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <Download size={16} />
              <span>Install App Free</span>
            </button>

            <button
              onClick={handleDismiss}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                borderRadius: '10px',
                padding: '0.65rem 0.9rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Not Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
