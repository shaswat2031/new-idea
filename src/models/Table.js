import mongoose from 'mongoose';

const TableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: [true, 'Table number/name is required'],
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      default: '',
    },
    capacity: {
      type: Number,
      default: 4,
    },
    location: {
      type: String,
      enum: ['Main Hall', 'Terrace', 'Balcony', 'Private Dining', 'Bar Lounge', 'Outdoor Garden'],
      default: 'Main Hall',
    },
    qrCodeDataUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'inactive'],
      default: 'available',
    },
    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Table || mongoose.model('Table', TableSchema);
