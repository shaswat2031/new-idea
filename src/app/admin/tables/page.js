'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  QrCode,
  Download,
  Printer,
  ExternalLink,
  Trash2,
  Edit2,
  X,
  Users,
  MapPin,
  Sparkles,
  Utensils,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  LayoutGrid,
  CreditCard,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { formatCurrency, formatTime } from '@/lib/format';

export default function AdminTablesPage() {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('floor-map'); // 'floor-map' | 'qr-studio'

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activePrintTable, setActivePrintTable] = useState(null);
  const [selectedTableDetails, setSelectedTableDetails] = useState(null);
  const [formData, setFormData] = useState({
    tableNumber: '',
    label: '',
    capacity: 4,
    location: 'Main Hall',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [tablesRes, ordersRes] = await Promise.all([
        fetch('/api/tables'),
        fetch('/api/orders?limit=50'),
      ]);

      const tablesData = await tablesRes.json();
      const ordersData = await ordersRes.json();

      if (tablesData.success) {
        setTables(tablesData.tables || []);
      }
      if (ordersData.success) {
        setOrders(ordersData.orders || []);
      }
    } catch (e) {
      console.error('Fetch tables/orders error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Determine dynamic table state
  const getTableState = (tableNumber) => {
    // Find active orders for this table
    const tableOrders = orders.filter(
      (o) => String(o.tableNumber) === String(tableNumber) && o.orderStatus !== 'cancelled'
    );

    // Sort newest first
    const activeOrder = tableOrders.find(
      (o) => o.orderStatus === 'new' || o.orderStatus === 'accepted' || o.orderStatus === 'preparing' || o.orderStatus === 'ready'
    );

    const servedOrder = tableOrders.find((o) => o.orderStatus === 'served');

    if (activeOrder) {
      return {
        status: 'preparing',
        color: '#ef4444',
        bgColor: '#fef2f2',
        borderColor: '#fca5a5',
        badgeText: '🔴 Active / Cooking',
        order: activeOrder,
      };
    }

    if (servedOrder && servedOrder.paymentStatus === 'pending') {
      return {
        status: 'served',
        color: '#eab308',
        bgColor: '#fefce8',
        borderColor: '#fde047',
        badgeText: '🟡 Food Served / Dining',
        order: servedOrder,
      };
    }

    if (servedOrder && servedOrder.paymentStatus === 'paid') {
      return {
        status: 'bill_ready',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        borderColor: '#93c5fd',
        badgeText: '🔵 Bill Paid / Settle',
        order: servedOrder,
      };
    }

    return {
      status: 'available',
      color: '#22c55e',
      bgColor: '#f0fdf4',
      borderColor: '#86efac',
      badgeText: '🟢 Available / Ready',
      order: null,
    };
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.tableNumber.trim()) {
      setError('Table number is required.');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create table');

      setIsAddModalOpen(false);
      setFormData({ tableNumber: '', label: '', capacity: 4, location: 'Main Hall' });
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!confirm('Are you sure you want to remove this table and its QR code?')) return;
    try {
      await fetch(`/api/tables/${tableId}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {}
  };

  const handleDownloadQR = (table) => {
    if (!table.qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = table.qrCodeDataUrl;
    a.download = `Table_${table.tableNumber}_QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Table Statistics
  const tableStats = tables.reduce(
    (acc, t) => {
      const st = getTableState(t.tableNumber).status;
      if (st === 'available') acc.available++;
      else if (st === 'preparing') acc.preparing++;
      else if (st === 'served') acc.dining++;
      else if (st === 'bill_ready') acc.billReady++;
      return acc;
    },
    { available: 0, preparing: 0, dining: 0, billReady: 0 }
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Restaurant Seating &amp; Floor Layout
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Live color-coded floor plan, real-time dining occupancy, and table QR studio.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchData}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setError('');
              setIsAddModalOpen(true);
            }}
            className="btn-primary"
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Add New Table</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('floor-map')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.9rem',
            border: 'none',
            backgroundColor: activeTab === 'floor-map' ? '#0f172a' : '#f1f5f9',
            color: activeTab === 'floor-map' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <LayoutGrid size={17} />
          <span>Visual Floor Map (Live Grid)</span>
        </button>

        <button
          onClick={() => setActiveTab('qr-studio')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.9rem',
            border: 'none',
            backgroundColor: activeTab === 'qr-studio' ? '#0f172a' : '#f1f5f9',
            color: activeTab === 'qr-studio' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <QrCode size={17} />
          <span>QR Print Studio &amp; Stands</span>
        </button>
      </div>

      {/* 🟢 Live Color Legend Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 2px 6px -1px rgba(0,0,0,0.02)',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
          Floor Status Legend:
        </span>

        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem', fontWeight: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid #16a34a' }} />
            <span>🟢 Available ({tableStats.available})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid #dc2626' }} />
            <span>🔴 Active / Cooking ({tableStats.preparing})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ca8a04' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308', border: '2px solid #ca8a04' }} />
            <span>🟡 Food Served / Dining ({tableStats.dining})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6', border: '2px solid #2563eb' }} />
            <span>🔵 Bill Paid / Settle ({tableStats.billReady})</span>
          </div>
        </div>
      </div>

      {/* Tab 1: Visual Floor Map */}
      {activeTab === 'floor-map' && (
        <div>
          {loading ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>Loading floor layout...</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {tables.map((table) => {
                const state = getTableState(table.tableNumber);
                const order = state.order;

                return (
                  <div
                    key={table._id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '18px',
                      border: `2px solid ${state.borderColor}`,
                      padding: '1.25rem',
                      boxShadow: '0 6px 14px -2px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Top status banner stripe */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '5px',
                        backgroundColor: state.color,
                      }}
                    />

                    {/* Table Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.2rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>
                            Table #{table.tableNumber}
                          </span>
                          {table.label && (
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>({table.label})</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem', fontSize: '0.75rem', color: '#64748b' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Users size={13} /> {table.capacity || 4} Seats
                          </span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <MapPin size={13} /> {table.location || 'Main Hall'}
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          backgroundColor: state.bgColor,
                          color: state.color,
                          border: `1px solid ${state.borderColor}`,
                        }}
                      >
                        {state.badgeText}
                      </span>
                    </div>

                    {/* Table Details Body */}
                    {order ? (
                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          borderRadius: '12px',
                          padding: '0.85rem',
                          border: '1px solid #f1f5f9',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.45rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                            {order.customerName || 'Guest Dining'}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ea580c' }}>
                            {formatCurrency(order.total)}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Ticket #{order.orderNumber} ({order.items?.length || 0} items)</span>
                          <span>{order.paymentMethod === 'online' ? '💳 Online' : '💵 Cash'}</span>
                        </div>

                        {/* Order items snapshot */}
                        <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.2rem', lineHeight: 1.3 }}>
                          {order.items?.slice(0, 2).map((it, i) => (
                            <div key={i}>• {it.quantity}x {it.name}</div>
                          ))}
                          {order.items?.length > 2 && (
                            <span style={{ color: '#94a3b8' }}>+{order.items.length - 2} more dishes</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          backgroundColor: '#f0fdf4',
                          borderRadius: '12px',
                          padding: '0.85rem',
                          textAlign: 'center',
                          border: '1px dashed #86efac',
                          color: '#16a34a',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        Table is vacant &amp; ready for walk-in guests.
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      <Link
                        href={`/menu?table=${table.tableNumber}`}
                        target="_blank"
                        className="btn-secondary"
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.6rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          justifyContent: 'center',
                        }}
                      >
                        <ExternalLink size={14} />
                        <span>Open Menu</span>
                      </Link>

                      <button
                        onClick={() => setActivePrintTable(table)}
                        className="btn-secondary"
                        style={{
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          color: '#ea580c',
                        }}
                        title="Print Acrylic QR Stand"
                      >
                        <Printer size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Table QR Code Studio & Print Generator */}
      {activeTab === 'qr-studio' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {tables.map((table) => (
            <div
              key={table._id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ea580c' }}>
                      Table #{table.tableNumber}
                    </span>
                    {table.label && (
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>({table.label})</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Users size={13} /> {table.capacity || 4} Seats
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={13} /> {table.location || 'Main Hall'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTable(table._id)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                  title="Remove Table"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* QR Code Display Card */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                {table.qrCodeDataUrl ? (
                  <img
                    src={table.qrCodeDataUrl}
                    alt={`Table ${table.tableNumber} QR`}
                    style={{ width: '90px', height: '90px', borderRadius: '8px', border: '1px solid #fed7aa' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '90px',
                      height: '90px',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <QrCode size={40} color="#cbd5e1" />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                    Instant Scannable URL
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', wordBreak: 'break-all' }}>
                    /menu?table={table.tableNumber}
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <button
                      onClick={() => handleDownloadQR(table)}
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px' }}
                    >
                      <Download size={13} />
                      <span>Download .PNG</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button
                  onClick={() => setActivePrintTable(table)}
                  className="btn-primary"
                  style={{ flex: 1, padding: '0.55rem', fontSize: '0.85rem' }}
                >
                  <Printer size={16} />
                  <span>Print Table Stand</span>
                </button>

                <Link
                  href={`/menu?table=${table.tableNumber}`}
                  target="_blank"
                  className="btn-secondary"
                  style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
                >
                  <ExternalLink size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Acrylic Table Stand Modal */}
      {activePrintTable && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="animate-fade-in"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '2rem',
              maxWidth: '440px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setActivePrintTable(null)}
              className="no-print"
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            {/* Printable Tent Card View */}
            <div className="printable-area" style={{ padding: '1rem' }}>
              <div
                style={{
                  border: '3px solid #ea580c',
                  borderRadius: '20px',
                  padding: '1.75rem 1.25rem',
                  backgroundColor: '#ffffff',
                }}
              >
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
                  <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a' }}>SAFFRON &amp; SPICE</span>
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                  Dine-In Digital Table Stand
                </div>

                {activePrintTable.qrCodeDataUrl && (
                  <img
                    src={activePrintTable.qrCodeDataUrl}
                    alt="Table QR"
                    style={{ width: '180px', height: '180px', margin: '0 auto 1rem', display: 'block' }}
                  />
                )}

                <div
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '9999px',
                    display: 'inline-block',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    marginBottom: '0.75rem',
                  }}
                >
                  TABLE #{activePrintTable.tableNumber}
                </div>

                <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, fontWeight: 600 }}>
                  Scan with your phone camera to view menu, order food, and pay instantly.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => window.print()}
                className="btn-primary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                <Printer size={18} />
                <span>Print Stand (A5 / Table Tent)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Table Modal */}
      {isAddModalOpen && (
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
              borderRadius: '20px',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Add Restaurant Table</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAddTable} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Table Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9 or T-10"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Label / Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Window Corner / VIP Couch"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Location / Zone
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                  >
                    <option value="Main Hall">Main Hall</option>
                    <option value="Balcony / Patio">Balcony / Patio</option>
                    <option value="VIP Lounge">VIP Lounge</option>
                    <option value="Rooftop">Rooftop</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                  {saving ? 'Creating QR...' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
