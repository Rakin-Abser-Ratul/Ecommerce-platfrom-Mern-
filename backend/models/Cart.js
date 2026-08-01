import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One active cart per user
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

cartSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export default mongoose.model('Cart', cartSchema);