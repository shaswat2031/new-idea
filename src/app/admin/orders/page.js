'use client';

import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  XCircle,
  ChefHat,
  CreditCard,
  Banknote,
  AlertCircle,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Phone,
  User,
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime, getTimeDifferenceInMinutes } from '@/lib/format';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeReceiptModal, setActiveReceiptModal] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders?limit=100');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error('Update status error:', e);
    }
  };

  const handleTogglePayment = async (orderId, currentPaymentStatus) => {
    const nextStatus = currentPaymentStatus === 'paid' ? 'pending' : 'paid';
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: nextStatus }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error('Toggle payment error:', e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber?.toLowerCase().includes(q);
      const matchName = o.customerName?.toLowerCase().includes(q);
      const matchTable = String(o.tableNumber).toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchTable) return false;
    }
    return true;
  });

  const statuses = [
    { key: 'all', label: 'All Orders' },
    { key: 'new', label: 'New Orders' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'served', label: 'Served' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusCount = (st) => {
    if (st === 'all') return orders.length;
    return orders.filter((o) => o.orderStatus === st).length;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Live Order Management</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Accept, route to kitchen, update status, and manage table billing.
          </p>
        </div>

        <button
          onClick={fetchOrders}
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
          <span>Refresh Live</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {statuses.map((st) => {
            const count = getStatusCount(st.key);
            const isActive = statusFilter === st.key;

            return (
              <button
                key={st.key}
                onClick={() => setStatusFilter(st.key)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  backgroundColor: isActive ? '#0f172a' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#64748b',
                  border: '1px solid',
                  borderColor: isActive ? '#0f172a' : '#e2e8f0',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>{st.label}</span>
                <span
                  style={{
                    backgroundColor: isActive ? '#ea580c' : '#e2e8f0',
                    color: isActive ? '#ffffff' : '#475569',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            padding: '0.6rem 0.85rem',
            border: '1px solid #e2e8f0',
          }}
        >
          <Search size={18} color="#94a3b8" style={{ marginRight: '0.5rem' }} />
          <input
            type="text"
            placeholder="Search by order #, table number, or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.9rem',
              color: '#0f172a',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ color: '#94a3b8' }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading table orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <ShoppingBag size={44} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>No matching orders found</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
            Orders placed via QR codes will appear here instantaneously.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredOrders.map((ord) => {
            const minsAgo = getTimeDifferenceInMinutes(ord.createdAt);

            return (
              <div
                key={ord._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Card Top Header */}
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: ord.orderStatus === 'new' ? '#fff7ed' : '#f8fafc',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                        #{ord.orderNumber}
                      </span>
                      <span
                        style={{
                          backgroundColor: '#ea580c',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                        }}
                      >
                        Table {ord.tableNumber}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {minsAgo === 0 ? 'Just now' : `${minsAgo}m ago`} • {formatTime(ord.createdAt)}
                    </span>
                  </div>

                  {/* Print receipt button */}
                  <button
                    onClick={() => setActiveReceiptModal(ord)}
                    title="Print Bill / KOT"
                    style={{
                      padding: '0.4rem',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                    }}
                  >
                    <Printer size={16} />
                  </button>
                </div>

                {/* Customer Details */}
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155', fontWeight: 600 }}>
                    <User size={15} color="#64748b" />
                    <span>{ord.customerName}</span>
                  </div>

                  {ord.customerPhone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.8rem' }}>
                      <Phone size={13} />
                      <span>{ord.customerPhone}</span>
                    </div>
                  )}
                </div>

                {/* Ordered Items List */}
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {ord.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.quantity}× </span>
                        <span style={{ color: '#334155' }}>{item.name}</span>
                        {item.notes && (
                          <div style={{ fontSize: '0.75rem', color: '#ea580c', fontStyle: 'italic' }}>
                            "{item.notes}"
                          </div>
                        )}
                      </div>
                      <span style={{ fontWeight: 600, color: '#64748b' }}>
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}

                  {ord.specialInstructions && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#fff7ed',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        color: '#9a3412',
                      }}
                    >
                      <strong>Chef Note:</strong> {ord.specialInstructions}
                    </div>
                  )}
                </div>

                {/* Total & Payment Details */}
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderTop: '1px solid #f1f5f9',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Bill (incl. GST)</span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      {formatCurrency(ord.total)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleTogglePayment(ord._id, ord.paymentStatus)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      backgroundColor: ord.paymentStatus === 'paid' ? '#f0fdf4' : '#fffbeb',
                      color: ord.paymentStatus === 'paid' ? '#166534' : '#b45309',
                      border: '1px solid',
                      borderColor: ord.paymentStatus === 'paid' ? '#bbf7d0' : '#fde68a',
                    }}
                    title="Click to toggle Paid/Pending"
                  >
                    {ord.paymentMethod === 'online' ? 'Online ' : 'Cash '}
                    {ord.paymentStatus === 'paid' ? 'PAID ✓' : 'PENDING ↻'}
                  </button>
                </div>

                {/* Order Status Action Buttons */}
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}>
                  {ord.orderStatus === 'new' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(ord._id, 'accepted')}
                        className="btn-primary"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(ord._id, 'cancelled')}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {ord.orderStatus === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(ord._id, 'preparing')}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '8px',
                        backgroundColor: '#d97706',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      Send to Kitchen (Preparing)
                    </button>
                  )}

                  {ord.orderStatus === 'preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(ord._id, 'ready')}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '8px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      Food Ready for Table
                    </button>
                  )}

                  {ord.orderStatus === 'ready' && (
                    <button
                      onClick={() => handleUpdateStatus(ord._id, 'served')}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '8px',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      Mark as Served
                    </button>
                  )}

                  {ord.orderStatus === 'served' && (
                    <button
                      onClick={() => handleUpdateStatus(ord._id, 'completed')}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: '#16a34a',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      Clear &amp; Free Table #{ord.tableNumber} ✓
                    </button>
                  )}

                  {ord.orderStatus === 'completed' && (
                    <div style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>
                      Order Closed &amp; Table Vacated ✓
                    </div>
                  )}

                  {ord.orderStatus === 'cancelled' && (
                    <div style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#dc2626' }}>
                      Order Cancelled ✕
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Receipt / KOT Modal */}
      {activeReceiptModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="animate-fade-in"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '380px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Kitchen Ticket & Receipt</h3>
              <button onClick={() => setActiveReceiptModal(null)} style={{ color: '#64748b' }}>
                ✕
              </button>
            </div>

            {/* Receipt Printable Preview */}
            <div
              className="printable-area"
              style={{
                border: '1px dashed #94a3b8',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '1rem', display: 'block' }}>SAFFRON & SPICE BISTRO</strong>
                <span>TABLE ORDER TICKET</span>
              </div>
              <div style={{ borderTop: '1px dashed #000', margin: '0.5rem 0' }} />
              <div>Order: #{activeReceiptModal.orderNumber}</div>
              <div>Table: Table {activeReceiptModal.tableNumber}</div>
              <div>Guest: {activeReceiptModal.customerName}</div>
              <div>Date: {formatDate(activeReceiptModal.createdAt)}</div>
              <div style={{ borderTop: '1px dashed #000', margin: '0.5rem 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {activeReceiptModal.items?.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{it.quantity}x {it.name}</span>
                    <span>{formatCurrency(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>

              {activeReceiptModal.specialInstructions && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                  *NOTE: {activeReceiptModal.specialInstructions}
                </div>
              )}

              <div style={{ borderTop: '1px dashed #000', margin: '0.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>{formatCurrency(activeReceiptModal.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST (5%):</span>
                <span>{formatCurrency(activeReceiptModal.taxAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.95rem' }}>
                <span>TOTAL:</span>
                <span>{formatCurrency(activeReceiptModal.total)}</span>
              </div>
              <div style={{ borderTop: '1px dashed #000', margin: '0.5rem 0' }} />
              <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                Payment: {activeReceiptModal.paymentMethod.toUpperCase()} ({activeReceiptModal.paymentStatus.toUpperCase()})
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => window.print()}
                className="btn-primary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                <Printer size={16} />
                <span>Print Ticket</span>
              </button>
              <button
                onClick={() => setActiveReceiptModal(null)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
