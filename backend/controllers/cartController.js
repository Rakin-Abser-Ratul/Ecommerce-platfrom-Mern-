import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

// Helper: Get or create cart for current user
const getOrCreateUserCart = async (userId) => {
  let cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    cart = await Cart.create({ user_id: userId });
  }
  return cart;
};

// Helper: Format cart response with populated products, ratings, and total_price calculation
const formatCartResponse = async (cart) => {
  // Query CartItems using the MongoDB _id directly
  const items = await CartItem.find({ cart_id: cart._id }).populate('product_id');

  let totalPrice = 0.0;
  const formattedItems = [];

  for (const item of items) {
    const productDoc = item.product_id;
    if (!productDoc) continue; // Skip if referenced product was removed

    const productObj = productDoc.toJSON ? productDoc.toJSON() : productDoc;

    // Calculate average rating & review count for the embedded product object
    const reviews = await Review.find({ product_id: productDoc._id });
    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
        : 0.0;

    const formattedProduct = {
      ...productObj,
      average_rating: avgRating,
      review_count: reviewCount,
    };

    totalPrice += formattedProduct.price * item.quantity;

    formattedItems.push({
      id: item._id.toString(),
      product_id: productDoc._id.toString(),
      quantity: item.quantity,
      product: formattedProduct,
    });
  }

  const cartObj = cart.toJSON ? cart.toJSON() : cart;

  return {
    id: cart._id.toString(),
    user_id: cart.user_id.toString(),
    items: formattedItems,
    total_price: Number(totalPrice.toFixed(2)),
  };
};

// @desc    Get User Cart
// @route   GET /api/cart
export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateUserCart(req.user.id);
    const response = await formatCartResponse(cart);
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({ detail: err.message });
  }
};

// @desc    Add Item to Cart
// @route   POST /api/cart/items
export const addToCart = async (req, res) => {
  const { product_id, quantity } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(404).json({ detail: 'Product not found' });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ detail: 'Product not found' });
    }

    const cart = await getOrCreateUserCart(req.user.id);

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      cart_id: cart._id,
      product_id: product_id,
    });

    const parsedQty = parseInt(quantity, 10) || 1;

    if (cartItem) {
      cartItem.quantity += parsedQty;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cart_id: cart._id,
        product_id: product_id,
        quantity: parsedQty,
      });
    }

    const response = await formatCartResponse(cart);
    return res.status(200).json(response);
  } catch (err) {
    if (err.name === 'CastError' || err.kind === 'ObjectId') {
      return res.status(404).json({ detail: 'Product not found' });
    }
    return res.status(500).json({ detail: err.message });
  }
};

// @desc    Update Cart Item Quantity
// @route   PUT /api/cart/items/:item_id
export const updateCartItem = async (req, res) => {
  const { item_id } = req.params;
  const { quantity } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(item_id)) {
      return res.status(404).json({ detail: 'Cart item not found' });
    }

    const cart = await getOrCreateUserCart(req.user.id);

    const cartItem = await CartItem.findOne({
      _id: item_id,
      cart_id: cart._id,
    });

    if (!cartItem) {
      return res.status(404).json({ detail: 'Cart item not found' });
    }

    const parsedQty = parseInt(quantity, 10);

    if (parsedQty <= 0) {
      await CartItem.findByIdAndDelete(item_id);
    } else {
      cartItem.quantity = parsedQty;
      await cartItem.save();
    }

    const response = await formatCartResponse(cart);
    return res.status(200).json(response);
  } catch (err) {
    if (err.name === 'CastError' || err.kind === 'ObjectId') {
      return res.status(404).json({ detail: 'Cart item not found' });
    }
    return res.status(500).json({ detail: err.message });
  }
};

// @desc    Delete Item from Cart
// @route   DELETE /api/cart/items/:item_id
export const removeCartItem = async (req, res) => {
  const { item_id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(item_id)) {
      return res.status(404).json({ detail: 'Cart item not found' });
    }

    const cart = await getOrCreateUserCart(req.user.id);

    const cartItem = await CartItem.findOne({
      _id: item_id,
      cart_id: cart._id,
    });

    if (!cartItem) {
      return res.status(404).json({ detail: 'Cart item not found' });
    }

    await CartItem.findByIdAndDelete(item_id);

    const response = await formatCartResponse(cart);
    return res.status(200).json(response);
  } catch (err) {
    if (err.name === 'CastError' || err.kind === 'ObjectId') {
      return res.status(404).json({ detail: 'Cart item not found' });
    }
    return res.status(500).json({ detail: err.message });
  }
};

// @desc    Clear Entire Cart
// @route   DELETE /api/cart
export const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateUserCart(req.user.id);
    await CartItem.deleteMany({ cart_id: cart._id });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ detail: err.message });
  }
};