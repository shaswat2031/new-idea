import Link from 'next/link';
import { Utensils, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          backgroundColor: '#ea580c',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <Utensils size={32} />
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>404 - Page Not Found</h1>
      <p style={{ color: '#94a3b8', maxWidth: '420px', lineHeight: 1.6, marginBottom: '2rem' }}>
        The table menu or page you are looking for does not exist or has been moved.
      </p>

      <Link
        href="/"
        style={{
          backgroundColor: '#ea580c',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          borderRadius: '12px',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <ArrowLeft size={18} />
        <span>Return to Bistro Home</span>
      </Link>
    </div>
  );
}
