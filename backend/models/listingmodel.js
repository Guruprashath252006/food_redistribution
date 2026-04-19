import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverName: { type: String, required: true },
    receiverEmail: { type: String },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
    },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acceptedAt: { type: Date },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Fresh Produce', 'Bakery & Grains', 'Prepared Meals', 'Pantry'],
      default: 'Fresh Produce',
    },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ['KG', 'L', 'PCS'], default: 'KG' },
    expiry: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donorName: { type: String, required: true },
    donorType: { type: String, default: 'RETAILER' },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ACCEPTED', 'CANCELLED'],
      default: 'AVAILABLE',
    },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    receiverName: { type: String, default: null },
    acceptedRequestId: { type: mongoose.Schema.Types.ObjectId, default: null },
    acceptedAt: { type: Date, default: null },
    theme: { type: Object, default: {} },
    requests: [requestSchema],
  },
  { timestamps: true }
);

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
