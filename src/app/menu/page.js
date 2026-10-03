'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  Check,
  ChevronRight,
  Sparkles,
  Utensils,
  ArrowLeft,
  Flame,
  Clock,
  CreditCard,
  Banknote,
  AlertCircle,
  HelpCircle,
  SlidersHorizontal,
  ChevronDown,
  Share2,
  Smartphone,
  Copy,
  CheckCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/format';

function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Table number from query or localStorage
  const [tableNumber, setTableNumber] = useState('');
  const [isChangingTable, setIsChangingTable] = useState(false);
  const [newTableInput, setNewTableInput] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Data state
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [activeCategory, setActiveCategory] = useState('all');
  const [dietFilter, setDietFilter] = useState('all'); // 'all', 'veg', 'non-veg', 'egg', 'bestseller'
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Checkout state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('counter'); // 'online' | 'counter'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Item customization modal (for adding notes to specific item)
  const [activeItemModal, setActiveItemModal] = useState(null);
  const [itemNote, setItemNote] = useState('');

  // Detect and persist table number
  useEffect(() => {
    const tableParam = searchParams.get('table');
    const categoryParam = searchParams.get('category');

    if (tableParam) {
      setTableNumber(tableParam);
      if (typeof window !== 'undefined') {
        localStorage.setItem('restaurant_table_number', tableParam);
      }
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('restaurant_table_number');
      if (stored) {
        setTableNumber(stored);
      } else {
        setTableNumber('1'); // Default fallback table
      }
    }

    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);

  // Load customer name & phone from localStorage if previously entered
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('customer_name');
      const savedPhone = localStorage.getItem('customer_phone');
      if (savedName) setCustomerName(savedName);
      if (savedPhone) setCustomerPhone(savedPhone);
    }
  }, []);

  // Fetch menu data & settings
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [catRes, menuRes, setRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/menu'),
          fetch('/api/settings'),
        ]);

        const catData = await catRes.json();
        const menuData = await menuRes.json();
        const setData = await setRes.json();

        if (catData.success) setCategories(catData.categories || []);
        if (menuData.success) setMenuItems(menuData.items || []);
        if (setData.success) {
          setSettings(setData.settings || {});
          if (!setData.settings?.isPayAtCounterEnabled && setData.settings?.isOnlinePaymentEnabled) {
            setPaymentMethod('online');
          }
        }
      } catch (err) {
        console.error('Menu load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Cart Operations
  const addToCart = (item, note = '') => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === item._id && i.notes === note);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id && i.notes === note ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1, notes: note }];
    });
  };

  const updateQuantity = (itemId, note, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item._id === itemId && item.notes === note) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const getItemCartQuantity = (itemId) => {
    return cart
      .filter((i) => i._id === itemId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  // Cart Calculations
  const cartItemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const taxPercentage = settings?.taxPercentage !== undefined ? settings.taxPercentage : 5;
  const taxAmount = useMemo(() => {
    return Number(((subtotal * taxPercentage) / 100).toFixed(2));
  }, [subtotal, taxPercentage]);

  const totalAmount = useMemo(() => {
    return Number((subtotal + taxAmount).toFixed(2));
  }, [subtotal, taxAmount]);

  // Filtered Menu Items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (activeCategory !== 'all') {
        const catObj = categories.find((c) => c.slug === activeCategory || c._id === activeCategory);
        if (catObj && item.categoryId !== catObj._id && item.categoryId?._id !== catObj._id) {
          return false;
        }
      }

      // Dietary filter
      if (dietFilter === 'veg' && item.foodType !== 'veg') return false;
      if (dietFilter === 'non-veg' && item.foodType !== 'non-veg') return false;
      if (dietFilter === 'egg' && item.foodType !== 'egg') return false;
      if (dietFilter === 'bestseller' && !item.isBestseller) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description && item.description.toLowerCase().includes(q);
        const matchTag = item.tags && item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchTag) return false;
      }

      return true;
    });
  }, [menuItems, categories, activeCategory, dietFilter, searchQuery]);

  // Handle Order Submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Please enter your name to place the order.');
      return;
    }
    if (!tableNumber) {
      setFormError('Table number is required.');
      return;
    }
    if (cart.length === 0) {
      setFormError('Your cart is empty.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Save customer info in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('customer_name', customerName.trim());
        if (customerPhone) localStorage.setItem('customer_phone', customerPhone.trim());
      }

      // Online Payment flow (Direct instant mock success without popup modal)
      if (paymentMethod === 'online') {
        // Small 400ms visual processing pause for realistic feel
        await new Promise((resolve) => setTimeout(resolve, 400));

        const mockPaymentDetails = {
          razorpayOrderId: `order_mock_${Date.now()}`,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: 'mock_verified_signature',
          paidAt: new Date(),
        };

        await completeOrderPlacement(mockPaymentDetails);
        return;
      } else {
        // Pay at counter / Cash on delivery
        await completeOrderPlacement(null);
      }
    } catch (err) {
      console.error('Order error:', err);
      setFormError(err.message || 'Something went wrong while placing your order.');
      setIsSubmitting(false);
    }
  };

  const completeOrderPlacement = async (paymentDetails) => {
    try {
      const orderPayload = {
        tableNumber: String(tableNumber),
        customerName: customerName.trim(),
        customerPhone: customerPhone ? customerPhone.trim() : '',
        items: cart.map((i) => ({
          menuItemId: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          foodType: i.foodType,
          notes: i.notes || '',
        })),
        specialInstructions,
        paymentMethod,
        paymentDetails,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit order');
      }

      // Celebrate with confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      // Clear cart
      setCart([]);
      setIsCartOpen(false);
      setIsCheckoutStep(false);

      // Redirect to Live Order Tracking
      router.push(`/order/${data.order._id || data.order.orderNumber}`);
    } catch (err) {
      setFormError(err.message || 'Failed to complete order submission.');
      setIsSubmitting(false);
    }
  };

  const handleTableChange = (e) => {
    e.preventDefault();
    if (newTableInput.trim()) {
      setTableNumber(newTableInput.trim());
      if (typeof window !== 'undefined') {
        localStorage.setItem('restaurant_table_number', newTableInput.trim());
      }
      setIsChangingTable(false);
    }
  };

  return (
    <div className="menu-container">
      {/* Top Table & Header Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 35,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        {/* Table Indicator Banner */}
        <div
          style={{
            backgroundColor: '#fff7ed',
            padding: '0.45rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #fed7aa',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#16a34a',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9a3412' }}>
              Dine-In Table: <span style={{ color: '#ea580c', fontSize: '0.95rem' }}>#{tableNumber || '1'}</span>
            </span>
          </div>

          <button
            onClick={() => {
              setNewTableInput(tableNumber);
              setIsChangingTable(true);
            }}
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#ea580c',
              backgroundColor: '#ffffff',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid #fed7aa',
            }}
          >
            Change
          </button>
        </div>

        {/* Restaurant Header */}
        <div
          style={{
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Utensils size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                {settings?.restaurantName || 'Saffron & Spice Bistro'}
              </h2>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Fresh Dine-In Digital Menu</span>
            </div>
          </Link>

          {/* Top Actions: Share & Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.share) {
                  navigator.share({
                    title: `${settings?.restaurantName || 'Saffron & Spice Bistro'} - Table ${tableNumber} Menu`,
                    text: `Order delicious food from Table ${tableNumber} directly at ${settings?.restaurantName || 'Saffron & Spice Bistro'}!`,
                    url: window.location.href,
                  }).catch(() => setIsShareModalOpen(true));
                } else {
                  setIsShareModalOpen(true);
                }
              }}
              title="Share Menu / Install App"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <Share2 size={19} />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              <ShoppingBag size={20} />
              {cartItemCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: '#ea580c',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(234, 88, 12, 0.4)',
                  }}
                >
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0 1rem 0.65rem' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              borderRadius: '12px',
              padding: '0.5rem 0.75rem',
            }}
          >
            <Search size={18} color="#64748b" style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Search dishes, drinks, biryani, spicy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                color: '#0f172a',
                fontWeight: 500,
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ color: '#94a3b8' }}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Sticky Category Tabs */}
        <div className="sticky-tabs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`tab-pill ${activeCategory === 'all' ? 'active' : ''}`}
          >
            All Menu
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat.slug || cat._id)}
              className={`tab-pill ${activeCategory === (cat.slug || cat._id) ? 'active' : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Dietary Filters Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setDietFilter('all')}
            style={{
              padding: '0.3rem 0.7rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: dietFilter === 'all' ? '#0f172a' : '#f8fafc',
              color: dietFilter === 'all' ? '#ffffff' : '#64748b',
              border: '1px solid',
              borderColor: dietFilter === 'all' ? '#0f172a' : '#e2e8f0',
              whiteSpace: 'nowrap',
            }}
          >
            All Types
          </button>

          <button
            onClick={() => setDietFilter(dietFilter === 'veg' ? 'all' : 'veg')}
            style={{
              padding: '0.3rem 0.7rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: dietFilter === 'veg' ? '#f0fdf4' : '#ffffff',
              color: dietFilter === 'veg' ? '#16a34a' : '#475569',
              border: '1px solid',
              borderColor: dietFilter === 'veg' ? '#16a34a' : '#e2e8f0',
              whiteSpace: 'nowrap',
            }}
          >
            <span className="diet-badge-veg" />
            <span>Veg Only</span>
          </button>

          <button
            onClick={() => setDietFilter(dietFilter === 'non-veg' ? 'all' : 'non-veg')}
            style={{
              padding: '0.3rem 0.7rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: dietFilter === 'non-veg' ? '#fef2f2' : '#ffffff',
              color: dietFilter === 'non-veg' ? '#dc2626' : '#475569',
              border: '1px solid',
              borderColor: dietFilter === 'non-veg' ? '#dc2626' : '#e2e8f0',
              whiteSpace: 'nowrap',
            }}
          >
            <span className="diet-badge-nonveg" />
            <span>Non-Veg</span>
          </button>

          <button
            onClick={() => setDietFilter(dietFilter === 'bestseller' ? 'all' : 'bestseller')}
            style={{
              padding: '0.3rem 0.7rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: dietFilter === 'bestseller' ? '#fff7ed' : '#ffffff',
              color: dietFilter === 'bestseller' ? '#ea580c' : '#475569',
              border: '1px solid',
              borderColor: dietFilter === 'bestseller' ? '#ea580c' : '#e2e8f0',
              whiteSpace: 'nowrap',
            }}
          >
            <Sparkles size={13} />
            <span>Bestsellers</span>
          </button>
        </div>
      </div>

      {/* Menu List Body */}
      <div style={{ padding: '1rem' }}>
        {loading ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
            <Utensils size={32} color="#ea580c" className="pulse-glow" style={{ margin: '0 auto 1rem', borderRadius: '50%' }} />
            <p style={{ fontWeight: 600 }}>Loading appetizing dishes...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            style={{
              padding: '3.5rem 1rem',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1',
            }}
          >
            <Utensils size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              No dishes found
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Try clearing your search query or filter tags.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setDietFilter('all');
                setActiveCategory('all');
              }}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredItems.map((item) => {
              const qtyInCart = getItemCartQuantity(item._id);

              return (
                <div
                  key={item._id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #f1f5f9',
                    padding: '0.85rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'flex',
                    gap: '0.85rem',
                    position: 'relative',
                    opacity: item.isAvailable ? 1 : 0.6,
                  }}
                >
                  {/* Left info */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {/* Dietary indicator & tags */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                        <span
                          className={
                            item.foodType === 'veg'
                              ? 'diet-badge-veg'
                              : item.foodType === 'egg'
                              ? 'diet-badge-egg'
                              : 'diet-badge-nonveg'
                          }
                        />
                        {item.isBestseller && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: '#ea580c',
                              backgroundColor: '#fff7ed',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                            }}
                          >
                            ★ BESTSELLER
                          </span>
                        )}
                        {item.spicyLevel > 1 && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: '#dc2626',
                              backgroundColor: '#fef2f2',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.15rem',
                            }}
                          >
                            <Flame size={10} />
                            Spicy
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.25, marginBottom: '0.25rem' }}>
                        {item.name}
                      </h3>

                      {/* Price */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                          {formatCurrency(item.price)}
                        </span>
                        {item.originalPrice && (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            {formatCurrency(item.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: '#64748b',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.description}
                      </p>
                    </div>

                    {/* Prep time info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                      <Clock size={12} />
                      <span>~{item.preparationTime || 15} mins prep</span>
                    </div>
                  </div>

                  {/* Right Image & Action Button */}
                  <div
                    style={{
                      width: '110px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: '100px',
                        height: '95px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: '#f1f5f9',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Add / Quantity Button */}
                    {!item.isAvailable ? (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#dc2626',
                          backgroundColor: '#fef2f2',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '6px',
                        }}
                      >
                        Out of stock
                      </span>
                    ) : qtyInCart > 0 ? (
                      <div className="qty-stepper">
                        <button onClick={() => updateQuantity(item._id, '', -1)} title="Decrease">
                          <Minus size={14} />
                        </button>
                        <span>{qtyInCart}</span>
                        <button onClick={() => addToCart(item, '')} title="Increase">
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          addToCart(item, '');
                        }}
                        className="btn-add-dish"
                      >
                        <span>ADD</span>
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Sticky Cart Bar */}
      {cartItemCount > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 24px)',
            maxWidth: '640px',
            zIndex: 45,
          }}
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="pulse-glow"
            style={{
              width: '100%',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '0.85rem 1.25rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 10px 25px rgba(15, 23, 42, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                }}
              >
                {cartItemCount}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Table #{tableNumber} Cart</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{formatCurrency(totalAmount)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: '#ea580c' }}>
              <span>View Cart & Pay</span>
              <ChevronRight size={18} />
            </div>
          </button>
        </div>
      )}

      {/* Slide-over Cart & Checkout Drawer Modal */}
      {isCartOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          <div
            className="animate-slide-up"
            style={{
              backgroundColor: '#ffffff',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.25rem 1.25rem 1rem',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {isCheckoutStep && (
                  <button onClick={() => setIsCheckoutStep(false)} style={{ color: '#0f172a', padding: '0.2rem' }}>
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    {isCheckoutStep ? 'Table Checkout' : `Your Cart (Table #${tableNumber})`}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {isCheckoutStep ? 'Confirm details and choose payment' : `${cartItemCount} items selected`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutStep(false);
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              {formError && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    color: '#dc2626',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{formError}</span>
                </div>
              )}

              {!isCheckoutStep ? (
                /* Step 1: Cart Items List */
                <div>
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
                      <ShoppingBag size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
                      <p style={{ fontWeight: 600 }}>Your cart is empty.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {cart.map((item, idx) => (
                        <div
                          key={`${item._id}_${idx}`}
                          style={{
                            padding: '0.85rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div style={{ flex: 1, paddingRight: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                              <span className={item.foodType === 'veg' ? 'diet-badge-veg' : 'diet-badge-nonveg'} />
                              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {formatCurrency(item.price)} × {item.quantity} ={' '}
                              <strong style={{ color: '#0f172a' }}>{formatCurrency(item.price * item.quantity)}</strong>
                            </div>
                            {item.notes && (
                              <div style={{ fontSize: '0.75rem', color: '#ea580c', marginTop: '0.2rem', fontStyle: 'italic' }}>
                                Note: "{item.notes}"
                              </div>
                            )}
                          </div>

                          <div className="qty-stepper">
                            <button onClick={() => updateQuantity(item._id, item.notes, -1)} title="Decrease">
                              <Minus size={14} />
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => addToCart(item, item.notes)} title="Increase">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special Cooking Instructions for entire order */}
                  <div style={{ marginTop: '1.25rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      Special Cooking Instructions (Optional)
                    </label>
                    <textarea
                      placeholder="e.g. Less spicy, no onion, extra napkins, serve water immediately..."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                        resize: 'none',
                      }}
                    />
                  </div>

                  {/* Price Breakdown Summary */}
                  <div
                    style={{
                      marginTop: '1.25rem',
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                      <span>Items Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                      <span>Taxes & GST ({taxPercentage}%)</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        borderTop: '1px dashed #cbd5e1',
                        paddingTop: '0.5rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      <span>Total Amount</span>
                      <span style={{ color: '#ea580c' }}>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 2: Customer Details & Payment Options */
                <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Table Number Display */}
                  <div
                    style={{
                      padding: '0.85rem',
                      backgroundColor: '#fff7ed',
                      borderRadius: '12px',
                      border: '1px solid #fed7aa',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#9a3412', fontWeight: 600 }}>Ordering For</span>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ea580c' }}>Table #{tableNumber}</div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Auto-detected from QR</span>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      Your Name <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      Mobile Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210 (For order updates)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Payment Methods Selection */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                      Choose Payment Method
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {/* Pay Online */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('online')}
                        style={{
                          padding: '1rem 0.75rem',
                          borderRadius: '12px',
                          border: '2px solid',
                          borderColor: paymentMethod === 'online' ? '#ea580c' : '#e2e8f0',
                          backgroundColor: paymentMethod === 'online' ? '#fff7ed' : '#ffffff',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <CreditCard size={24} color={paymentMethod === 'online' ? '#ea580c' : '#64748b'} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Pay Online</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Razorpay / UPI / Cards</span>
                      </button>

                      {/* Pay at Counter */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('counter')}
                        style={{
                          padding: '1rem 0.75rem',
                          borderRadius: '12px',
                          border: '2px solid',
                          borderColor: paymentMethod === 'counter' ? '#ea580c' : '#e2e8f0',
                          backgroundColor: paymentMethod === 'counter' ? '#fff7ed' : '#ffffff',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Banknote size={24} color={paymentMethod === 'counter' ? '#ea580c' : '#64748b'} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Pay at Counter</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Cash or Card at desk</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: '#ffffff',
              }}
            >
              {!isCheckoutStep ? (
                <button
                  disabled={cart.length === 0}
                  onClick={() => setIsCheckoutStep(true)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
                >
                  <span>Proceed to Checkout ({formatCurrency(totalAmount)})</span>
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  disabled={isSubmitting || !customerName.trim()}
                  onClick={handlePlaceOrder}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.95rem',
                    fontSize: '1.05rem',
                    opacity: isSubmitting || !customerName.trim() ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <span>Placing Order...</span>
                  ) : (
                    <span>
                      Confirm & Place Order ({formatCurrency(totalAmount)})
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Table Modal */}
      {isChangingTable && (
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
              padding: '1.5rem',
              width: '100%',
              maxWidth: '380px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Select Your Table
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Choose your table number as shown on the physical QR table stand.
            </p>

            <form onSubmit={handleTableChange}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {['1', '2', '3', '4', '5', '6', '7', '8'].map((tbl) => (
                  <button
                    key={tbl}
                    type="button"
                    onClick={() => setNewTableInput(tbl)}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      border: '2px solid',
                      borderColor: newTableInput === tbl ? '#ea580c' : '#e2e8f0',
                      backgroundColor: newTableInput === tbl ? '#fff7ed' : '#ffffff',
                      color: newTableInput === tbl ? '#ea580c' : '#334155',
                    }}
                  >
                    Table {tbl}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsChangingTable(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Confirm Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share & PWA Install Modal */}
      {isShareModalOpen && (
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
              borderRadius: '24px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setIsShareModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: '#f1f5f9',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#fff7ed',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Share2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Share Table {tableNumber} Menu
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Send to dining friends or install app
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {/* WhatsApp Share */}
              <button
                onClick={() => {
                  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
                  const message = encodeURIComponent(
                    `🍽️ Hey! Look at the menu for Table ${tableNumber} at ${settings?.restaurantName || 'Saffron & Spice Bistro'}:\n${shareUrl}`
                  );
                  window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>💬 Share on WhatsApp</span>
              </button>

              {/* Copy Direct Link */}
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  backgroundColor: copiedLink ? '#f0fdf4' : '#f8fafc',
                  color: copiedLink ? '#16a34a' : '#1e293b',
                  border: `1px solid ${copiedLink ? '#86efac' : '#e2e8f0'}`,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                {copiedLink ? <CheckCircle size={18} /> : <Copy size={18} />}
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Menu URL'}</span>
              </button>
            </div>

            {/* PWA Install Guide */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '14px',
                padding: '1rem',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Smartphone size={16} color="#ea580c" />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                  Install as Mobile App (PWA)
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
                • <strong>iPhone / iPad</strong>: Tap Safari Share button <strong>[↑]</strong> and choose <strong>"Add to Home Screen"</strong>.<br/>
                • <strong>Android / Chrome</strong>: Tap <strong>⋮ (Menu)</strong> &gt; <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Loading digital menu...</p>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
