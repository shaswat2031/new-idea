# 🍽️ Saffron & Spice Bistro — Modern QR-Based Restaurant Ordering System

A production-ready, mobile-first QR table ordering and restaurant management platform built with **Next.js 14 (JavaScript)** and **MongoDB (Mongoose)** with **Razorpay** payment gateway integration.

---

## ✨ Key Features & Architecture

### 📱 1. Customer Dine-In Experience (Mobile-First)
- **Table QR Auto-Detection**: Scanning table QR codes automatically opens `/menu?table=X` and persists table numbers throughout the dining session.
- **Interactive Sticky Categories**: Starters, Main Course, Biryani, Breads, Beverages, Desserts with smooth horizontal scrolling.
- **Search & Dietary Filters**: Instant search across dishes, ingredients, and tags with 1-click filters for **Veg Only (🟢)**, **Non-Veg (🔴)**, and **Chef Bestsellers (★)**.
- **Food Details**: High-res dish images, spice meter (🌶️ Mild/Medium/Hot), estimated kitchen prep times, and dietary labels.
- **Item Customization & Notes**: Add specific kitchen requests per dish (e.g. *"Less spicy"*, *"No onion"*, *"Extra crispy"*).
- **Floating Sticky Cart**: Live subtotal and item counter (`🛒 Cart (3 items) • ₹650`) with slide-up checkout drawer.
- **Dual Payment Options**:
  - **Pay Online (Razorpay)**: UPI, Credit/Debit cards, NetBanking with real-time signature verification.
  - **Pay at Counter (Cash/Card)**: Settle bill with front desk after dining.
- **Live Order Timeline & Confirmation**: Real-time progress tracker (`Order Placed` ➔ `Accepted` ➔ `Cooking in Kitchen` ➔ `Food Ready` ➔ `Served`) with **Call Waiter** notification.

---

### 👨‍🍳 2. Kitchen Display System (KDS)
- High-visibility kitchen dashboard designed for line cooks and chefs.
- **Live Cooking Timers**: Automatic elapsed timers with color-coded urgency indicators (green ➔ red if waiting >15m).
- **Interactive Checklist**: Chefs can tap individual dishes to mark them prepared as they cook.
- **Audio Chime Alerts**: Pleasant chime sound generated via the Web Audio API on newly placed orders.

---

### 💼 3. Admin & Staff Operations Portal
- **Executive Analytics Dashboard**: Gross sales, online vs cash breakdown, active tickets, and top 5 bestsellers.
- **Live Orders Stream**: Instant status transitions (`Accept` ➔ `Send to Kitchen` ➔ `Mark Ready` ➔ `Mark Served` or `Cancel`).
- **Printable Receipts & KOT**: Print-ready Kitchen Order Tickets and guest dining bills.
- **Table & QR Code Studio**:
  - Auto-generates high-resolution QR codes for all tables.
  - 1-click PNG QR download.
  - **Printable Table Stand Cards**: Print stylish table tent cards with restaurant branding, Table number, and QR code instructions.
- **Menu Items Manager**: Create, edit, set pricing, original price strike-through, image URLs, and instant **In-Stock / Out-of-Stock** toggles.
- **Category Manager**: Add courses and configure display sorting order.
- **Settings & Config**: Toggle Razorpay, Cash at Counter, configure GST/Tax rates, and edit announcement banners.

---

## 🔐 Default Admin Credentials

| Field | Value |
|---|---|
| **Login URL** | `/admin/login` |
| **Email** | `admin@restaurant.com` |
| **Password** | `admin123` |

*(A 1-click "Auto Fill Credentials" button is also provided on the login page for convenience)*

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) — **100% JavaScript (`.js` / `.jsx`)**
- **Database**: MongoDB with Mongoose (with built-in zero-setup memory fallback for instant offline development)
- **Styling**: Vanilla CSS Design System with CSS variables and glassmorphism (`globals.css`)
- **Payments**: Razorpay Checkout SDK + Backend HMAC SHA256 Signature Verification
- **Icons**: Lucide React
- **QR Engine**: QRCode canvas generator
- **Audio Alerts**: Web Audio API Sound Synthesizer (zero external audio file dependencies)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env.local`)
```env
MONGODB_URI=mongodb://127.0.0.1:27017/qr_restaurant
JWT_SECRET=super_secret_restaurant_jwt_key_2026_xyz
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=rzp_secret_dummy_replace_with_yours
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 URL Routes Overview

- **Customer Homepage**: `/`
- **Dine-In Digital Menu**: `/menu?table=1` (or any table e.g. `?table=5`)
- **Live Order Tracking**: `/order/[orderId]`
- **Admin Login**: `/admin/login`
- **Admin Dashboard**: `/admin`
- **Admin Live Orders**: `/admin/orders`
- **Kitchen Display (KDS)**: `/admin/kitchen`
- **Menu Catalog**: `/admin/menu`
- **Categories**: `/admin/categories`
- **Table & QR Studio**: `/admin/tables`
- **Restaurant Settings**: `/admin/settings`
