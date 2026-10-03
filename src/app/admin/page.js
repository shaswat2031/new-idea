'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
  ChefHat,
  QrCode,
  UtensilsCrossed,
  ArrowRight,
  Flame,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/orders?limit=6'),
      ]);

      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (ordersData.success) setRecentOrders(ordersData.orders || []);
    } catch (err) {
      console.error('Admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: nextStatus }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (e) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with Title & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Executive Dashboard</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Live overview of table orders, kitchen pipeline, revenue and popular items.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchDashboardData}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          <Link href="/admin/kitchen" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <ChefHat size={16} />
            <span>Open Kitchen KDS</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Total Sales */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Total Revenue</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            {formatCurrency(stats?.totalSales || 0)}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
            {formatCurrency(stats?.paidSales || 0)} paid online
          </span>
        </div>

        {/* Active Orders */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Active Orders</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#fff7ed',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ea580c' }}>
            {stats?.activeOrders || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 600 }}>
            {stats?.newOrders || 0} New, {stats?.preparingOrders || 0} In Kitchen
          </span>
        </div>

        {/* Total Orders */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Completed Orders</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            {stats?.servedOrders || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Out of {stats?.totalOrders || 0} total tickets
          </span>
        </div>

        {/* Tables & Items */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>QR Dining Tables</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QrCode size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            {stats?.tablesCount || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>
            {stats?.menuItemsCount || 0} active menu dishes
          </span>
        </div>
      </div>

      {/* Interactive Hourly Revenue & Peak Order Hours Chart */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#ea580c" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Today's Hourly Revenue &amp; Peak Dining Rush
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>
              Real-time revenue curve across lunch (12–3 PM) and dinner service (7–11 PM).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#fed7aa' }} />
              <span>Normal Hours</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ea580c' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#ea580c' }} />
              <span>Peak Rush Hours</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart Grid */}
        <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '0.75rem',
              height: '180px',
              minWidth: '600px',
              borderBottom: '2px solid #f1f5f9',
              paddingBottom: '0.5rem',
            }}
          >
            {(() => {
              const hourlyData = stats?.hourlyRevenue || [];
              const maxRev = Math.max(...hourlyData.map((h) => h.revenue), 100);

              return hourlyData.map((slot, i) => {
                const heightPercent = Math.max(12, Math.round((slot.revenue / maxRev) * 100));
                const isPeak = slot.revenue >= maxRev * 0.75;
                const isLunchRush = slot.hour.includes('1 PM') || slot.hour.includes('2 PM');
                const isDinnerRush = slot.hour.includes('8 PM') || slot.hour.includes('9 PM');

                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                      gap: '0.4rem',
                      group: 'chart-col',
                    }}
                  >
                    {/* Tooltip / Value on top */}
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: isPeak ? '#ea580c' : '#64748b',
                        opacity: slot.revenue > 0 ? 1 : 0.4,
                      }}
                    >
                      {slot.revenue > 0 ? `₹${slot.revenue}` : '—'}
                    </span>

                    {/* Animated Bar */}
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '38px',
                        height: `${heightPercent}%`,
                        borderRadius: '8px 8px 3px 3px',
                        background: isPeak
                          ? 'linear-gradient(180deg, #ea580c 0%, #c2410c 100%)'
                          : isLunchRush || isDinnerRush
                          ? 'linear-gradient(180deg, #fb923c 0%, #f97316 100%)'
                          : 'linear-gradient(180deg, #fed7aa 0%, #ffedd5 100%)',
                        boxShadow: isPeak ? '0 4px 12px rgba(234, 88, 12, 0.35)' : 'none',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      title={`${slot.hour}: ₹${slot.revenue} (${slot.orders} orders)`}
                    />

                    {/* Hour Label */}
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: isPeak ? 800 : 600,
                        color: isPeak ? '#0f172a' : '#94a3b8',
                        whiteSpace: 'nowrap',
                        marginTop: '0.2rem',
                      }}
                    >
                      {slot.hour}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Peak Rush Info Footer */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff7ed', padding: '0.45rem 0.85rem', borderRadius: '10px' }}>
            <Flame size={16} color="#ea580c" />
            <span style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 700 }}>
              Lunch Rush Window: <strong>1:00 PM – 2:30 PM</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff7ed', padding: '0.45rem 0.85rem', borderRadius: '10px' }}>
            <Flame size={16} color="#ea580c" />
            <span style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 700 }}>
              Dinner Rush Window: <strong>8:00 PM – 10:00 PM</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Row: Recent Orders (Left) and Popular Dishes / Quick Links (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Orders Feed */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Live Orders Stream</h2>
            <Link href="/admin/orders" style={{ fontSize: '0.85rem', color: '#ea580c', fontWeight: 700 }}>
              View All Orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
              <ShoppingBag size={32} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
              <p>No orders recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
              {recentOrders.map((ord) => {
                let badgeBg = '#f1f5f9';
                let badgeColor = '#475569';
                if (ord.orderStatus === 'new') {
                  badgeBg = '#fff7ed';
                  badgeColor = '#ea580c';
                } else if (ord.orderStatus === 'preparing') {
                  badgeBg = '#fef3c7';
                  badgeColor = '#d97706';
                } else if (ord.orderStatus === 'ready') {
                  badgeBg = '#eff6ff';
                  badgeColor = '#2563eb';
                } else if (ord.orderStatus === 'served') {
                  badgeBg = '#f0fdf4';
                  badgeColor = '#16a34a';
                }

                return (
                  <div
                    key={ord._id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #f1f5f9',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                          #{ord.orderNumber}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: '#ffffff',
                            color: '#ea580c',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #fed7aa',
                          }}
                        >
                          Table {ord.tableNumber}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          backgroundColor: badgeBg,
                          color: badgeColor,
                          textTransform: 'uppercase',
                        }}
                      >
                        {ord.orderStatus}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        {ord.customerName} • {ord.items?.length || 0} items
                      </span>
                      <strong style={{ color: '#0f172a' }}>{formatCurrency(ord.total)}</strong>
                    </div>

                    {/* Quick Status Advance */}
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                      {ord.orderStatus === 'new' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord._id, 'preparing')}
                          style={{
                            padding: '0.3rem 0.6rem',
                            borderRadius: '6px',
                            backgroundColor: '#ea580c',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          Send to Kitchen
                        </button>
                      )}
                      {ord.orderStatus === 'preparing' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord._id, 'ready')}
                          style={{
                            padding: '0.3rem 0.6rem',
                            borderRadius: '6px',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          Mark Ready
                        </button>
                      )}
                      {ord.orderStatus === 'ready' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord._id, 'served')}
                          style={{
                            padding: '0.3rem 0.6rem',
                            borderRadius: '6px',
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          Mark Served
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Top Items & Fast Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Selling Dishes with Performance Bars */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flame size={18} color="#ea580c" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Top Dishes of the Week</h2>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>By Order Volume</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {stats?.topItems && stats.topItems.length > 0 ? (
                (() => {
                  const maxCount = Math.max(...stats.topItems.map((i) => i.count), 1);
                  return stats.topItems.map((item, idx) => {
                    const barWidth = Math.max(15, Math.round((item.count / maxCount) * 100));
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '0.75rem 0.85rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #f1f5f9',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: idx === 0 ? '#ea580c' : '#e2e8f0',
                                color: idx === 0 ? '#fff' : '#64748b',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {idx + 1}
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</span>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                              {item.count} sold
                            </span>
                            {item.revenue > 0 && (
                              <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>
                                {formatCurrency(item.revenue)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${barWidth}%`,
                              height: '100%',
                              backgroundColor: idx === 0 ? '#ea580c' : '#f97316',
                              borderRadius: '9999px',
                            }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No sales data available yet.</p>
              )}
            </div>
          </div>

          {/* Quick Action Cards */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.85rem' }}>
              Quick Operations
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Link
                href="/admin/tables"
                style={{
                  padding: '1rem 0.85rem',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <QrCode size={20} color="#ea580c" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Print Table QRs</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Download table stands</span>
              </Link>

              <Link
                href="/admin/menu"
                style={{
                  padding: '1rem 0.85rem',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <UtensilsCrossed size={20} color="#2563eb" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Add New Dish</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Manage prices & items</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
