'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Utensils,
  QrCode,
  Clock,
  MapPin,
  Phone,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Flame,
  Award,
  ArrowRight,
  ChefHat,
  Star,
  Camera,
  Scan,
  CheckCircle2,
  X,
  Smartphone,
  CreditCard,
} from 'lucide-react';
import { formatCurrency } from '@/lib/format';

export default function HomePage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('1');
  const [selectedTableQr, setSelectedTableQr] = useState('');
  const [isScanningModalOpen, setIsScanningModalOpen] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, menuRes, tblRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/menu'),
          fetch('/api/tables'),
        ]);

        const catData = await catRes.json();
        const menuData = await menuRes.json();
        const tblData = await tblRes.json();

        if (catData.success) setCategories(catData.categories || []);
        if (menuData.success) {
          const items = menuData.items || [];
          setPopularItems(items.filter((i) => i.isBestseller).slice(0, 6));
        }
        if (tblData.success && tblData.tables?.length > 0) {
          setTables(tblData.tables);
          const t1 = tblData.tables.find((t) => t.tableNumber === '1') || tblData.tables[0];
          setSelectedTable(t1.tableNumber);
          setSelectedTableQr(t1.qrCodeDataUrl || '');
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Update QR when table is clicked
  const handleSelectTable = (tblNum) => {
    setSelectedTable(tblNum);
    const target = tables.find((t) => String(t.tableNumber) === String(tblNum));
    if (target?.qrCodeDataUrl) {
      setSelectedTableQr(target.qrCodeDataUrl);
    }
  };

  // Simulate Phone Camera Scanning
  const handleStartSimulatedScan = () => {
    setIsScanningModalOpen(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanningModalOpen(false);
            router.push(`/menu?table=${selectedTable}`);
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fcfbf9' }}>
      {/* Top Announcement Bar */}
      <div
        style={{
          background: 'linear-gradient(90deg, #ea580c 0%, #c2410c 100%)',
          color: '#ffffff',
          padding: '0.55rem 1rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          letterSpacing: '0.02em',
        }}
      >
        <Sparkles size={16} />
        <span>✨ Dine-In Specials: Free Tandoori Garlic Naan on every main course order today!</span>
      </div>

      {/* Main Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #f1f5f9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <div
          className="container-custom"
          style={{
            height: '74px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 6px 16px rgba(234, 88, 12, 0.35)',
              }}
            >
              <Utensils size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
                Saffron & Spice
              </h1>
              <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 800, letterSpacing: '0.08em' }}>
                BISTRO & BAR
              </span>
            </div>
          </Link>

          {/* Navigation CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Link
              href="/admin/login"
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#64748b',
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                transition: 'all 0.15s ease',
              }}
            >
              Staff Portal
            </Link>

            <button
              onClick={handleStartSimulatedScan}
              className="btn-primary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
            >
              <QrCode size={18} />
              <span>Scan Table QR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Interactive 3D Table Stand Simulation */}
      <section
        style={{
          position: 'relative',
          padding: '4.5rem 1rem 5.5rem',
          background: 'radial-gradient(ellipse at 50% 0%, #fff7ed 0%, #ffffff 70%)',
          overflow: 'hidden',
        }}
      >
        <div className="container-custom">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3.5rem',
              alignItems: 'center',
            }}
          >
            {/* Left Hero Story */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.95rem',
                  backgroundColor: '#ffedd5',
                  color: '#c2410c',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  marginBottom: '1.25rem',
                }}
              >
                <Flame size={16} />
                <span>Contactless QR Table Dining</span>
              </div>

              <h1
                className="font-display"
                style={{
                  fontSize: 'clamp(2.4rem, 5.5vw, 3.6rem)',
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1.12,
                  marginBottom: '1.25rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Scan Table QR. <br />
                <span style={{ color: '#ea580c' }}>Savor Royal Flavors</span> from Your Seat.
              </h1>

              <p
                style={{
                  fontSize: '1.1rem',
                  color: '#475569',
                  lineHeight: 1.65,
                  marginBottom: '2rem',
                  maxWidth: '520px',
                  fontWeight: 400,
                }}
              >
                Experience effortless dine-in. Each table features a unique tabletop stand. Scan the QR code with your smartphone, browse our chef-crafted menu, customize your order, and pay with Razorpay or cash.
              </p>

              {/* Clean Primary Actions */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                <button
                  onClick={handleStartSimulatedScan}
                  className="btn-primary"
                  style={{
                    padding: '1rem 1.8rem',
                    fontSize: '1.05rem',
                    borderRadius: '14px',
                    boxShadow: '0 10px 25px rgba(234, 88, 12, 0.35)',
                    cursor: 'pointer',
                  }}
                >
                  <Camera size={20} />
                  <span>Scan Table QR & Open Menu</span>
                  <ArrowRight size={18} />
                </button>

                <Link
                  href="/menu?table=1"
                  className="btn-secondary"
                  style={{
                    padding: '1rem 1.6rem',
                    fontSize: '1rem',
                    borderRadius: '14px',
                  }}
                >
                  <Utensils size={18} />
                  <span>Explore Digital Menu</span>
                </Link>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                  <ShieldCheck size={20} color="#16a34a" />
                  <span>100% Contactless</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                  <Clock size={20} color="#ea580c" />
                  <span>10-15 Min Fast Prep</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                  <Award size={20} color="#d97706" />
                  <span>Master Chef Recipes</span>
                </div>
              </div>
            </div>

            {/* Right: Realistic 3D Table Stand Mockup (Clickable) */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <div
                onClick={handleStartSimulatedScan}
                className="table-tent-stand"
                title="Click to Scan QR Code"
                style={{
                  width: '100%',
                  maxWidth: '340px',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Logo & Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      backgroundColor: '#ea580c',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Utensils size={18} />
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
                    SAFFRON & SPICE
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  Tap QR to Scan & Order
                </div>

                {/* QR Display Card with Laser Scan Line */}
                <div
                  style={{
                    position: 'relative',
                    padding: '0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px',
                    border: '1.5px solid #fed7aa',
                    display: 'inline-block',
                    marginBottom: '0.75rem',
                    overflow: 'hidden',
                  }}
                >
                  <div className="laser-scanner" />
                  {selectedTableQr ? (
                    <img
                      src={selectedTableQr}
                      alt={`Table ${selectedTable} QR Code`}
                      style={{ width: '190px', height: '190px', display: 'block', borderRadius: '8px' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '190px',
                        height: '190px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <QrCode size={90} color="#ea580c" />
                    </div>
                  )}
                </div>

                {/* Table Number Pill */}
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    marginBottom: '0.75rem',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                  <span>TABLE #{selectedTable}</span>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4, margin: '0 0.5rem' }}>
                  Point smartphone camera to order & pay directly from this table
                </p>

                {/* Acrylic Stand Base */}
                <div className="table-tent-base" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Dishes Showcase */}
      <section style={{ padding: '4.5rem 1rem', backgroundColor: '#ffffff' }}>
        <div className="container-custom">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Handcrafted Favorites
              </span>
              <h2 className="font-display" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
                Chef's Signature Dishes
              </h2>
            </div>

            <Link
              href={`/menu?table=${selectedTable}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#ea580c',
                fontWeight: 800,
                fontSize: '0.95rem',
              }}
            >
              <span>Explore Full Menu</span>
              <ChevronRight size={18} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {popularItems.map((dish) => (
              <div
                key={dish._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #f1f5f9',
                  overflow: 'hidden',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.03)',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '190px', backgroundColor: '#f8fafc' }}>
                  <img
                    src={dish.image}
                    alt={dish.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      padding: '4px',
                      backgroundColor: '#ffffff',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      display: 'flex',
                    }}
                  >
                    <span className={dish.foodType === 'veg' ? 'diet-badge-veg' : 'diet-badge-nonveg'} />
                  </div>

                  {dish.isBestseller && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: '#ea580c',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.3rem 0.7rem',
                        borderRadius: '9999px',
                        boxShadow: '0 4px 10px rgba(234, 88, 12, 0.4)',
                      }}
                    >
                      ★ Chef Choice
                    </span>
                  )}
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                    {dish.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: '#64748b',
                      lineHeight: 1.5,
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flexGrow: 1,
                    }}
                  >
                    {dish.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div>
                      <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>
                        {formatCurrency(dish.price)}
                      </span>
                      {dish.originalPrice && (
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '0.5rem' }}>
                          {formatCurrency(dish.originalPrice)}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/menu?table=${selectedTable}`}
                      style={{
                        backgroundColor: '#fff7ed',
                        color: '#ea580c',
                        border: '1.5px solid #fed7aa',
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>Order</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Camera Scanner Modal Simulation */}
      {isScanningModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="animate-fade-in"
            style={{
              backgroundColor: '#1e293b',
              color: '#ffffff',
              borderRadius: '24px',
              maxWidth: '380px',
              width: '100%',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              border: '1px solid #334155',
              position: 'relative',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
          >
            <button
              onClick={() => setIsScanningModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <Smartphone size={36} color="#ea580c" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Simulating Phone Scanner
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              Scanning Table #{selectedTable} QR Code...
            </p>

            {/* Viewfinder simulation */}
            <div
              style={{
                position: 'relative',
                width: '200px',
                height: '200px',
                margin: '0 auto 1.5rem',
                border: '2px dashed #ea580c',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
              }}
            >
              <div className="laser-scanner" />
              {selectedTableQr ? (
                <img
                  src={selectedTableQr}
                  alt="QR"
                  style={{ width: '150px', height: '150px', opacity: 0.8 }}
                />
              ) : (
                <QrCode size={100} color="#64748b" />
              )}
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: '6px', backgroundColor: '#334155', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div
                style={{
                  height: '100%',
                  width: `${scanProgress}%`,
                  backgroundColor: '#ea580c',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f97316' }}>
              {scanProgress >= 100 ? 'Table Recognized! Opening Menu...' : 'Aligning QR code...'}
            </div>
          </div>
        </div>
      )}

      {/* 3-Step Clean Dining Workflow */}
      <section id="how-it-works" style={{ padding: '4.5rem 1rem', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Seamless Guest Experience
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginTop: '0.25rem' }}>
              How QR Ordering Works
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '540px', margin: '0.5rem auto 0' }}>
              Zero app download required. Sit down at any table and enjoy effortless dining in 3 simple steps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {/* Step 1 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '2rem 1.5rem',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: '#fff7ed',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <QrCode size={26} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>Step 01</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0 0.5rem' }}>
                Scan Tabletop QR Code
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Open your phone's default camera app and point at the acrylic stand. Your table number is instantly identified.
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '2rem 1.5rem',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: '#fff7ed',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Utensils size={26} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>Step 02</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0 0.5rem' }}>
                Browse & Customize
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Explore chef specialties with dietary filters (Veg/Non-Veg), add custom cooking instructions, and select quantity.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '2rem 1.5rem',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: '#fff7ed',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <CreditCard size={26} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>Step 03</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0 0.5rem' }}>
                Pay & Track Live
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Pay securely online via UPI/Card (Razorpay) or Cash at Counter. Watch real-time cooking progress from your screen!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Rich Footer */}
      <footer
        style={{
          backgroundColor: '#090d16',
          color: '#94a3b8',
          padding: '4.5rem 1rem 2.5rem',
          marginTop: 'auto',
          borderTop: '1px solid #1e293b',
        }}
      >
        <div className="container-custom">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '3rem',
              marginBottom: '3rem',
            }}
          >
            {/* Column 1: Identity */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <Utensils size={20} />
                </div>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff' }}>Saffron & Spice</span>
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1.25rem' }}>
                Artisanal dining with authentic regional recipes, warm ambiance, and seamless QR table ordering.
              </p>
              <div style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: 700 }}>
                ★ 4.9 Star Dine-In Experience
              </div>
            </div>

            {/* Column 2: Easy 3-Step Ordering Guide */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                How To Order
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>1</span>
                  <span>Scan QR Code at your table</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>2</span>
                  <span>Select delicious food items</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>3</span>
                  <span>Pay online or cash at counter</span>
                </div>
              </div>
            </div>

            {/* Column 3: Timings & Location */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Hours & Location
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="#ea580c" />
                  <span>Mon - Sun: 11:30 AM – 11:00 PM</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="#ea580c" />
                  <span>42 Culinary Ave, Gourmet District, Bangalore</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} color="#ea580c" />
                  <span>+91 98765 43210</span>
                </div>
              </div>
            </div>

            {/* Column 4: Staff & Management */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Staff Operations
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <Link href="/admin/login" style={{ color: '#ea580c', fontWeight: 700 }}>
                  Admin Staff Login →
                </Link>
                <Link href="/admin/kitchen" style={{ color: '#cbd5e1' }}>
                  Kitchen Display System (KDS)
                </Link>
                <Link href="/admin/tables" style={{ color: '#cbd5e1' }}>
                  Table Stands & QR Print Studio
                </Link>
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: '2rem',
              borderTop: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: '0.8rem',
            }}
          >
            <div>© 2026 Saffron & Spice Bistro. All Rights Reserved. Built with Next.js & MongoDB.</div>
            <div style={{ color: '#64748b' }}>Fast Contactless Dining Engine</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
