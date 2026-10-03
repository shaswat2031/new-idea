import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60',
    },
    foodType: {
      type: String,
      enum: ['veg', 'non-veg', 'egg'],
      default: 'veg',
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    spicyLevel: {
      type: Number,
      enum: [0, 1, 2, 3], // 0: None, 1: Mild, 2: Medium, 3: Hot
      default: 1,
    },
    preparationTime: {
      type: Number, // in minutes
      default: 15,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
