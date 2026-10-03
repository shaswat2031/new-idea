'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  UtensilsCrossed,
  Tags,
  QrCode,
  Settings,
  LogOut,
  Bell,
  Volume2,
  VolumeX,
  ExternalLink,
  Menu,
  X,
  Store,
} from 'lucide-react';
import { playOrderNotificationSound } from '@/lib/sound';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, render children directly
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [adminUser, setAdminUser] = useState(null);

  const audioEnabledRef = useRef(audioEnabled);
  audioEnabledRef.current = audioEnabled;

  const lastKnownOrderIdsRef = useRef(new Set());

  // Load admin user info once
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('admin_user');
      if (stored) {
        try {
          setAdminUser(JSON.parse(stored));
        } catch (e) {}
      }
    }
  }, []);

  // No fetch in layout

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
    router.push('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Live Orders', href: '/admin/orders', icon: ShoppingBag, badge: newOrderCount },
    { label: 'Kitchen KDS', href: '/admin/kitchen', icon: ChefHat },
    { label: 'Menu Items', href: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Categories', href: '/admin/categories', icon: Tags },
    { label: 'Tables & QR Codes', href: '/admin/tables', icon: QrCode },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar Desktop */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 40,
          borderRight: '1px solid #1e293b',
          transition: 'transform 0.3s ease',
          transform: sidebarOpen ? 'translateX(0)' : undefined,
        }}
        className={sidebarOpen ? 'sidebar-open' : 'sidebar-desktop'}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Store size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc', lineHeight: 1.1 }}>
                Saffron & Spice
              </div>
              <div style={{ fontSize: '0.7rem', color: '#f97316', fontWeight: 700 }}>ADMIN PORTAL</div>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            style={{ color: '#94a3b8', display: 'none' }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? '#ea580c' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
                  <span>{item.label}</span>
                </div>

                {item.badge > 0 && (
                  <span
                    style={{
                      backgroundColor: isActive ? '#ffffff' : '#ea580c',
                      color: isActive ? '#ea580c' : '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '9999px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div style={{ margin: '1rem 0', borderTop: '1px solid #1e293b' }} />

          <Link
            href="/"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              color: '#64748b',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ExternalLink size={16} />
              <span>Customer Website</span>
            </div>
          </Link>
        </nav>

        {/* User Footer */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid #1e293b',
            backgroundColor: '#090d16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
              {adminUser?.name || 'Manager'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {adminUser?.email || 'admin@restaurant.com'}
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              color: '#ef4444',
              padding: '0.4rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '260px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="admin-main-wrap">
        {/* Top Header */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ color: '#0f172a', display: 'none' }}
              className="mobile-hamburger"
            >
              <Menu size={22} />
            </button>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Restaurant Operations Control
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Audio Alert Toggle */}
            <button
              onClick={() => {
                const nextState = !audioEnabled;
                setAudioEnabled(nextState);
                if (nextState) playOrderNotificationSound();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: audioEnabled ? '#f0fdf4' : '#fef2f2',
                color: audioEnabled ? '#16a34a' : '#dc2626',
                border: '1px solid',
                borderColor: audioEnabled ? '#bbf7d0' : '#fecaca',
              }}
              title="Toggle sound chime on new orders"
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{audioEnabled ? 'Sound Alerts On' : 'Muted'}</span>
            </button>

            {/* Live New Orders Indicator */}
            <Link
              href="/admin/orders"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: newOrderCount > 0 ? '#ea580c' : '#f1f5f9',
                color: newOrderCount > 0 ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              <Bell size={15} />
              <span>{newOrderCount} New Orders</span>
            </Link>
          </div>
        </header>

        {/* Page Children Container */}
        <main style={{ padding: '1.5rem', flex: 1 }}>{children}</main>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .sidebar-desktop {
            transform: translateX(-100%);
          }
          .sidebar-open {
            transform: translateX(0) !important;
          }
          .admin-main-wrap {
            margin-left: 0 !important;
          }
          .mobile-hamburger {
            display: block !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
