'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bell,
  Utensils,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  Banknote,
  PhoneCall,
  Printer,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [waiterCalled, setWaiterCalled] = useState(false);

  // Fetch single order details
  const fetchOrder = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);
        setLastRefreshed(new Date());
        setError('');
      } else {
        setError(data.error || 'Order not found');
      }
    } catch (err) {
      console.error('Fetch order error:', err);
      setError('Unable to load order status.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Poll order status every 6 seconds for live updates
  useEffect(() => {
    fetchOrder(true);
  }, [id]);

  // Order timeline steps definition
  const steps = [
    { key: 'new', label: 'Order Placed', desc: 'Received at restaurant' },
    { key: 'accepted', label: 'Confirmed', desc: 'Accepted by staff' },
    { key: 'preparing', label: 'Cooking', desc: 'Chef preparing fresh in kitchen' },
    { key: 'ready', label: 'Food Ready', desc: 'Ready for delivery to table' },
    { key: 'served', label: 'Served', desc: 'Enjoy your meal!' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'new':
        return 0;
      case 'accepted':
        return 1;
      case 'preparing':
        return 2;
      case 'ready':
        return 3;
      case 'served':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIndex = order ? getStepIndex(order.orderStatus) : 0;
  const isCancelled = order?.orderStatus === 'cancelled';

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    setTimeout(() => {
      setWaiterCalled(false);
    }, 4000);
  };

  if (loading) {
    return (
      <div className="menu-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Utensils size={36} color="#ea580c" className="pulse-glow" style={{ margin: '0 auto 1rem', borderRadius: '50%' }} />
        <p style={{ fontWeight: 600, color: '#64748b' }}>Loading live order status...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="menu-container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}
        >
          <Utensils size={28} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          {error || 'Order Not Found'}
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
          We could not find the order details for ID #{id}.
        </p>
        <Link href="/menu" className="btn-primary">
          <span>Back to Menu</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="menu-container">
      {/* Top Header */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href={`/menu?table=${order.tableNumber}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: 700, fontSize: '0.9rem' }}
        >
          <ArrowLeft size={18} />
          <span>Table #{order.tableNumber} Menu</span>
        </Link>

        <button
          onClick={() => fetchOrder(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            color: '#64748b',
            backgroundColor: '#f8fafc',
            padding: '0.35rem 0.65rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <RefreshCw size={12} />
          <span>Live Sync</span>
        </button>
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* Order Success Banner */}
        <div
          style={{
            backgroundColor: isCancelled ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${isCancelled ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: '16px',
            padding: '1.25rem',
            textAlign: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: isCancelled ? '#dc2626' : '#16a34a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
            }}
          >
            {isCancelled ? <Clock size={24} /> : <CheckCircle2 size={26} />}
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: isCancelled ? '#991b1b' : '#166534', marginBottom: '0.25rem' }}>
            {isCancelled ? 'Order Cancelled' : 'Order Placed Successfully!'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: isCancelled ? '#b91c1c' : '#15803d' }}>
            {isCancelled
              ? 'This order has been cancelled by staff.'
              : `Thank you ${order.customerName}, your food is being cooked for Table #${order.tableNumber}.`}
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#ffffff',
              padding: '0.4rem 0.9rem',
              borderRadius: '20px',
              marginTop: '0.75rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            <span>Order #{order.orderNumber}</span>
            <span>•</span>
            <span style={{ color: '#ea580c' }}>Table #{order.tableNumber}</span>
          </div>
        </div>

        {/* Live Timeline Tracker */}
        {!isCancelled && (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #f1f5f9',
              padding: '1.25rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Live Preparation Status</h3>
              <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }} />
                Auto Refreshing
              </span>
            </div>

            {/* Steps Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', position: 'relative' }}>
                    {/* Vertical connecting line */}
                    {idx < steps.length - 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '14px',
                          top: '28px',
                          bottom: '-14px',
                          width: '2px',
                          backgroundColor: idx < currentStepIndex ? '#16a34a' : '#e2e8f0',
                          zIndex: 1,
                        }}
                      />
                    )}

                    {/* Step Icon */}
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: isCurrent ? '#ea580c' : isPassed ? '#16a34a' : '#f1f5f9',
                        color: isPassed ? '#ffffff' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        zIndex: 2,
                        boxShadow: isCurrent ? '0 0 0 4px rgba(234, 88, 12, 0.2)' : 'none',
                      }}
                    >
                      {isPassed ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>

                    {/* Step details */}
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isCurrent ? '#ea580c' : isPassed ? '#0f172a' : '#94a3b8' }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isPassed ? '#64748b' : '#cbd5e1' }}>
                        {step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons: Call Waiter & Order More */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button
            onClick={handleCallWaiter}
            style={{
              padding: '0.85rem',
              borderRadius: '12px',
              backgroundColor: waiterCalled ? '#f0fdf4' : '#f8fafc',
              border: '1px solid',
              borderColor: waiterCalled ? '#86efac' : '#e2e8f0',
              color: waiterCalled ? '#16a34a' : '#334155',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <PhoneCall size={16} />
            <span>{waiterCalled ? 'Waiter Notified!' : 'Call Waiter'}</span>
          </button>

          <Link
            href={`/menu?table=${order.tableNumber}`}
            style={{
              padding: '0.85rem',
              borderRadius: '12px',
              backgroundColor: '#fff7ed',
              border: '1px solid #fed7aa',
              color: '#ea580c',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Utensils size={16} />
            <span>Order More</span>
          </Link>
        </div>

        {/* Ordered Items Summary */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            marginBottom: '1.25rem',
          }}
        >
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.85rem' }}>
            Items Ordered
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  paddingBottom: '0.75rem',
                  borderBottom: idx < order.items.length - 1 ? '1px dashed #f1f5f9' : 'none',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span className={item.foodType === 'veg' ? 'diet-badge-veg' : 'diet-badge-nonveg'} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {item.quantity}</span>
                  {item.notes && (
                    <div style={{ fontSize: '0.75rem', color: '#ea580c', fontStyle: 'italic', marginTop: '0.15rem' }}>
                      "{item.notes}"
                    </div>
                  )}
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {order.specialInstructions && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: '#fff7ed',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#9a3412',
              }}
            >
              <strong>Chef Note:</strong> {order.specialInstructions}
            </div>
          )}

          {/* Pricing breakdown */}
          <div
            style={{
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
              <span>Taxes & GST ({order.taxRate}%)</span>
              <span>{formatCurrency(order.taxAmount)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#0f172a',
                paddingTop: '0.4rem',
                borderTop: '1px dashed #cbd5e1',
              }}
            >
              <span>Total Bill</span>
              <span style={{ color: '#ea580c' }}>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Details Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: order.paymentStatus === 'paid' ? '#f0fdf4' : '#fff7ed',
                color: order.paymentStatus === 'paid' ? '#16a34a' : '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {order.paymentMethod === 'online' ? <CreditCard size={20} /> : <Banknote size={20} />}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                {order.paymentMethod === 'online' ? 'Paid via Razorpay' : 'Pay at Counter'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {formatDate(order.createdAt)}
              </div>
            </div>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.3rem 0.65rem',
              borderRadius: '20px',
              backgroundColor: order.paymentStatus === 'paid' ? '#dcfce7' : '#fef3c7',
              color: order.paymentStatus === 'paid' ? '#166534' : '#92400e',
            }}
          >
            {order.paymentStatus === 'paid' ? 'PAID ✓' : 'PENDING'}
          </span>
        </div>
      </div>
    </div>
  );
}
