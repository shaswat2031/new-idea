import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      default: '',
    },
    tableNumber: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      default: 'Guest',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    tags: {
      type: [String],
      default: [],
    },
    comment: {
      type: String,
      default: '',
    },
    isFlaggedToManager: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
