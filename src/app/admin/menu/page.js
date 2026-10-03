'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Flame,
  Clock,
  UtensilsCrossed,
  Image as ImageIcon,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { formatCurrency } from '@/lib/format';

export default function AdminMenuPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    foodType: 'veg',
    image: '',
    isAvailable: true,
    isBestseller: false,
    spicyLevel: 1,
    preparationTime: 15,
    tags: '',
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchMenuAndCategories = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/categories'),
      ]);
      const menuData = await menuRes.json();
      const catData = await catRes.json();

      if (menuData.success) setItems(menuData.items || []);
      if (catData.success) setCategories(catData.categories || []);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuAndCategories();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      categoryId: categories[0]?._id || categories[0]?.slug || '',
      foodType: 'veg',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isBestseller: false,
      spicyLevel: 1,
      preparationTime: 15,
      tags: 'Chef Special',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      originalPrice: item.originalPrice || '',
      categoryId: item.categoryId?._id || item.categoryId || '',
      foodType: item.foodType || 'veg',
      image: item.image || '',
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      isBestseller: !!item.isBestseller,
      spicyLevel: item.spicyLevel || 1,
      preparationTime: item.preparationTime || 15,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.name || !formData.price || !formData.categoryId) {
      setModalError('Name, price and category are required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        spicyLevel: Number(formData.spicyLevel),
        preparationTime: Number(formData.preparationTime),
        tags: formData.tags
          ? formData.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      const url = editingItem ? `/api/menu/${editingItem._id}` : '/api/menu';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save food item');
      }

      setIsModalOpen(false);
      fetchMenuAndCategories();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await fetch(`/api/menu/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      fetchMenuAndCategories();
    } catch (e) {}
  };

  const handleToggleBestseller = async (item) => {
    try {
      await fetch(`/api/menu/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBestseller: !item.isBestseller }),
      });
      fetchMenuAndCategories();
    } catch (e) {}
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu dish?')) return;
    try {
      await fetch(`/api/menu/${itemId}`, { method: 'DELETE' });
      fetchMenuAndCategories();
    } catch (e) {}
  };

  const filteredItems = items.filter((it) => {
    if (selectedCategory !== 'all') {
      const catId = it.categoryId?._id || it.categoryId;
      if (catId !== selectedCategory) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!it.name.toLowerCase().includes(q) && !it.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Menu Items Catalog</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Add, update dishes, modify prices, toggle out-of-stock items and chef recommendations.
          </p>
        </div>

        <button onClick={openAddModal} className="btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
          <Plus size={18} />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              padding: '0.5rem 0.85rem',
              border: '1px solid #e2e8f0',
              flex: 1,
            }}
          >
            <Search size={16} color="#94a3b8" style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Search dish name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155',
              outline: 'none',
            }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
          Showing {filteredItems.length} items
        </span>
      </div>

      {/* Dishes Cards Grid */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading menu catalog...</p>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <UtensilsCrossed size={40} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>No food items found</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Try modifying your filters or click "Add New Dish".</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredItems.map((item) => (
            <div
              key={item._id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Image & Badges */}
              <div style={{ position: 'relative', height: '160px', backgroundColor: '#f1f5f9' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    padding: '4px',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    display: 'flex',
                  }}
                >
                  <span className={item.foodType === 'veg' ? 'diet-badge-veg' : 'diet-badge-nonveg'} />
                </div>

                {!item.isAvailable && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(15, 23, 42, 0.65)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '1rem',
                      letterSpacing: '0.05em',
                    }}
                  >
                    OUT OF STOCK
                  </div>
                )}
              </div>

              {/* Dish Info */}
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{item.name}</h3>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ea580c' }}>
                      {formatCurrency(item.price)}
                    </span>
                    {item.originalPrice && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                        {formatCurrency(item.originalPrice)}
                      </div>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4, marginBottom: '0.75rem', flex: 1 }}>
                  {item.description}
                </p>

                {/* Quick Toggle Controls */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: item.isAvailable ? '#f0fdf4' : '#fef2f2',
                      color: item.isAvailable ? '#16a34a' : '#dc2626',
                      border: '1px solid',
                      borderColor: item.isAvailable ? '#bbf7d0' : '#fecaca',
                    }}
                  >
                    {item.isAvailable ? '✓ In Stock' : '✕ Out of Stock'}
                  </button>

                  <button
                    onClick={() => handleToggleBestseller(item)}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: item.isBestseller ? '#fff7ed' : '#f8fafc',
                      color: item.isBestseller ? '#ea580c' : '#64748b',
                      border: '1px solid',
                      borderColor: item.isBestseller ? '#fed7aa' : '#e2e8f0',
                    }}
                  >
                    {item.isBestseller ? '★ Bestseller' : '☆ Normal'}
                  </button>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => openEditModal(item)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
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
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Name */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paneer Tikka Angara"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              {/* Category & Food Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Dietary Type *
                  </label>
                  <select
                    value={formData.foodType}
                    onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  >
                    <option value="veg">Veg (🟢)</option>
                    <option value="non-veg">Non-Veg (🔴)</option>
                    <option value="egg">Egg (🟡)</option>
                  </select>
                </div>
              </div>

              {/* Price & Original Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="320"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Original Price (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="360"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short, delicious description for customers..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              {/* Image URL */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Food Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              {/* Spice Level & Prep Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Spice Level
                  </label>
                  <select
                    value={formData.spicyLevel}
                    onChange={(e) => setFormData({ ...formData, spicyLevel: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  >
                    <option value={0}>0 - No Spice</option>
                    <option value={1}>1 - Mild</option>
                    <option value={2}>2 - Medium</option>
                    <option value={3}>3 - Extra Hot</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Prep Time (Mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="15"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tandoor, Gluten Free, Chef Choice"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Available in Stock</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isBestseller}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Chef Bestseller</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  <span>{saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Dish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
