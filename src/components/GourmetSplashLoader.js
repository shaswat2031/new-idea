'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Utensils, Flame } from 'lucide-react';

const CRAVING_LINES = [
  '🔥 Tandoor is heating up... roasting char-grilled kebabs & tikkas',
  '🥘 Simmering 24-hour slow-cooked Dal Makhani with churned butter',
  '🍚 Layering fragrant basmati rice with royal saffron for Dum Biryani',
  '🫓 Clay oven baking hot, crispy Garlic Butter Naan',
  '🥭 Churning rich, chilled Alphonso Mango Kesar Lassi',
  '✨ Crafting your royal dining experience...',
];

export default function GourmetSplashLoader() {
  const [loading, setLoading] = useState(true);
  const [cravingIndex, setCravingIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [fadeout, setFadeout] = useState(false);

  useEffect(() => {
    // Only show once per tab session for smooth diner experience
    const shown = sessionStorage.getItem('splash_loader_viewed');
    if (shown) {
      setLoading(false);
      return;
    }

    // Cycle through craving text
    const textInterval = setInterval(() => {
      setCravingIndex((prev) => (prev + 1) % CRAVING_LINES.length);
    }, 600);

    // Increment progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(progressInterval);
          clearInterval(textInterval);
          setTimeout(() => {
            setFadeout(true);
            setTimeout(() => {
              setLoading(false);
              sessionStorage.setItem('splash_loader_viewed', 'true');
            }, 500);
          }, 200);
          return 100;
        }
        return prev + 18;
      });
    }, 280);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#090d16',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        opacity: fadeout ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
        pointerEvents: fadeout ? 'none' : 'auto',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow & radial aura */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234, 88, 12, 0.22) 0%, rgba(234, 88, 12, 0.05) 50%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'pulseGlowRing 3s infinite ease-in-out',
        }}
      />

      {/* Floating appetizing aroma particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4 }}>
        <div style={{ position: 'absolute', top: '25%', left: '20%', animation: 'float 3s ease-in-out infinite' }}>
          <Sparkles size={18} color="#facc15" />
        </div>
        <div style={{ position: 'absolute', top: '30%', right: '22%', animation: 'float 4s ease-in-out infinite 0.8s' }}>
          <Flame size={20} color="#ea580c" />
        </div>
        <div style={{ position: 'absolute', bottom: '30%', left: '28%', animation: 'float 3.5s ease-in-out infinite 1.2s' }}>
          <Sparkles size={16} color="#fb923c" />
        </div>
      </div>

      {/* Central Animated Luxury Cloche Dome & Flame */}
      <div
        style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          borderRadius: '30px',
          backgroundColor: '#1e1b4b',
          border: '2px solid #ea580c',
          boxShadow: '0 0 35px rgba(234, 88, 12, 0.5), 0 0 0 1px rgba(254, 215, 170, 0.3) inset',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          animation: 'float 3s ease-in-out infinite',
        }}
      >
        <img
          src="/logo.svg"
          alt="Saffron & Spice"
          style={{ width: '90px', height: '90px', objectFit: 'contain' }}
        />

        {/* Sizzling steam badge */}
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            right: '-10px',
            backgroundColor: '#ea580c',
            color: '#fff',
            borderRadius: '9999px',
            padding: '0.2rem 0.6rem',
            fontSize: '0.65rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            boxShadow: '0 4px 10px rgba(234, 88, 12, 0.5)',
          }}
        >
          <Flame size={12} />
          <span>FRESH</span>
        </div>
      </div>

      {/* Restaurant Branding */}
      <h2
        style={{
          fontFamily: "'Outfit', 'Playfair Display', sans-serif",
          fontSize: '1.8rem',
          fontWeight: 900,
          letterSpacing: '0.04em',
          color: '#ffffff',
          marginBottom: '0.35rem',
          textAlign: 'center',
        }}
      >
        SAFFRON &amp; SPICE
      </h2>

      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 800,
          color: '#facc15',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          marginBottom: '1.75rem',
        }}
      >
        Gourmet Dine-In Experience
      </div>

      {/* Dynamic Craving Sentence (Bhookh lagane wali line) */}
      <div
        style={{
          minHeight: '44px',
          maxWidth: '380px',
          textAlign: 'center',
          fontSize: '0.9rem',
          fontWeight: 700,
          color: '#fed7aa',
          lineHeight: 1.4,
          marginBottom: '1.5rem',
          transition: 'all 0.3s ease',
        }}
      >
        {CRAVING_LINES[cravingIndex]}
      </div>

      {/* Sizzling Progress Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '280px',
          height: '6px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.5) inset',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 50%, #f97316 100%)',
            borderRadius: '9999px',
            boxShadow: '0 0 12px rgba(234, 88, 12, 0.8)',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      {/* Bottom Subtle Note */}
      <div
        style={{
          marginTop: '1.25rem',
          fontSize: '0.72rem',
          color: '#64748b',
          letterSpacing: '0.02em',
        }}
      >
        Plating Table Digital Menu...
      </div>
    </div>
  );
}
