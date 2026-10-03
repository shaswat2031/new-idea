import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      default: 'Saffron & Spice Bistro',
    },
    tagline: {
      type: String,
      default: 'Authentic Flavors, Modern Dine-In Experience',
    },
    logo: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    email: {
      type: String,
      default: 'contact@saffronspice.com',
    },
    address: {
      type: String,
      default: '42 Culinary Avenue, Gourmet District, Bangalore 560001',
    },
    timings: {
      type: String,
      default: 'Mon - Sun: 11:30 AM to 11:00 PM',
    },
    currency: {
      type: String,
      default: 'INR',
    },
    currencySymbol: {
      type: String,
      default: '₹',
    },
    taxPercentage: {
      type: Number,
      default: 5, // 5% GST
    },
    isOnlinePaymentEnabled: {
      type: Boolean,
      default: true,
    },
    isPayAtCounterEnabled: {
      type: Boolean,
      default: true,
    },
    announcementBanner: {
      type: String,
      default: '✨ Chef Specials available today! Enjoy 10% off on all starters.',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
