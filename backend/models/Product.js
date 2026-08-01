import mongoose from 'mongoose';

const customFieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false } // Prevents automatic _id creation for each custom field item
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
    },
    image_url: {
      type: String,
      default: null,
    },
    // Array of dynamic custom fields e.g., [{"name": "RAM", "value": "16GB"}]
    custom_fields: {
      type: [customFieldSchema],
      default: [],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export default mongoose.model('Product', productSchema);