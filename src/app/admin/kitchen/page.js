'use client';

import { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle, RefreshCw, Volume2, VolumeX, Flame, AlertCircle } from 'lucide-react';
import { formatTime, getTimeDifferenceInMinutes } from '@/lib/format';
import { playOrderNotificationSound } from '@/lib/sound';

export default function KitchenDisplayPage() {
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemChecks, setItemChecks] = useState({});

  const fetchKitchenOrders = async () => {
    try {
      const res = await fetch('/api/orders?limit=50');
      const data = await res.json();
      if (data.success && data.orders) {
        // Show orders that are new, accepted, or preparing
        const active = data.orders.filter(
          (o) => o.orderStatus === 'new' || o.orderStatus === 'accepted' || o.orderStatus === 'preparing'
        );
        setKitchenOrders(active);
      }
    } catch (e) {
      console.error('Kitchen orders error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
  }, []);

  const handleToggleItemCheck = (orderId, itemIdx) => {
    const key = `${orderId}_${itemIdx}`;
    setItemChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMarkReady = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: 'ready' }),
      });
      if (res.ok) {
        fetchKitchenOrders();
      }
    } catch (e) {}
  };

  const handleStartCooking = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: 'preparing' }),
      });
      if (res.ok) {
        fetchKitchenOrders();
      }
    } catch (e) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ChefHat size={26} color="#ea580c" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Kitchen Display System (KDS)</h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Real-time kitchen tickets with preparation timers and item completion checks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              backgroundColor: '#fff7ed',
              color: '#c2410c',
              fontSize: '0.85rem',
              fontWeight: 800,
            }}
          >
            {kitchenOrders.length} Active Tickets
          </span>

          <button
            onClick={fetchKitchenOrders}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <RefreshCw size={14} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Kitchen Ticket Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading kitchen tickets...</p>
        </div>
      ) : kitchenOrders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '5rem 1rem',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <ChefHat size={48} color="#16a34a" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>All Clear, Chef!</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            There are currently no pending kitchen orders.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {kitchenOrders.map((ord) => {
            const minsAgo = getTimeDifferenceInMinutes(ord.createdAt);
            const isUrgent = minsAgo >= 15;

            return (
              <div
                key={ord._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: isUrgent ? '2px solid #ef4444' : '1px solid #e2e8f0',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Ticket Header */}
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: isUrgent ? '#fef2f2' : ord.orderStatus === 'preparing' ? '#fff7ed' : '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ea580c' }}>
                        TABLE {ord.tableNumber}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>#{ord.orderNumber}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Guest: {ord.customerName}
                    </span>
                  </div>

                  {/* Timer Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '8px',
                      backgroundColor: isUrgent ? '#fee2e2' : '#f1f5f9',
                      color: isUrgent ? '#dc2626' : '#334155',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                    }}
                  >
                    <Clock size={16} />
                    <span>{minsAgo}m</span>
                  </div>
                </div>

                {/* Items Checklist for Chefs */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {ord.items?.map((item, idx) => {
                    const checkKey = `${ord._id}_${idx}`;
                    const isChecked = !!itemChecks[checkKey];

                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleItemCheck(ord._id, idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          backgroundColor: isChecked ? '#f0fdf4' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                      >
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
                            border: '2px solid',
                            borderColor: isChecked ? '#16a34a' : '#cbd5e1',
                            backgroundColor: isChecked ? '#16a34a' : '#ffffff',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        >
                          {isChecked && <CheckCircle size={14} />}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: '1.05rem',
                              fontWeight: 800,
                              color: isChecked ? '#94a3b8' : '#0f172a',
                              textDecoration: isChecked ? 'line-through' : 'none',
                            }}
                          >
                            <span style={{ color: '#ea580c' }}>{item.quantity}× </span>
                            {item.name}
                          </div>
                          {item.notes && (
                            <div
                              style={{
                                fontSize: '0.8rem',
                                color: '#dc2626',
                                fontWeight: 700,
                                backgroundColor: '#fef2f2',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                display: 'inline-block',
                                marginTop: '0.2rem',
                              }}
                            >
                              ★ NOTE: {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {ord.specialInstructions && (
                    <div
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#fff7ed',
                        border: '1px solid #fed7aa',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#9a3412',
                        marginTop: '0.5rem',
                      }}
                    >
                      <strong>SPECIAL INSTRUCTIONS:</strong> {ord.specialInstructions}
                    </div>
                  )}
                </div>

                {/* Bottom Action */}
                <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
                  {ord.orderStatus !== 'preparing' ? (
                    <button
                      onClick={() => handleStartCooking(ord._id)}
                      className="btn-primary"
                      style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
                    >
                      <ChefHat size={18} />
                      <span>Start Cooking</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkReady(ord._id)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                      }}
                    >
                      <CheckCircle size={18} />
                      <span>Mark Dishes Ready For Pickup</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
