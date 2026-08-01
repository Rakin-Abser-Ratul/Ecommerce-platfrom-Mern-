import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All cart endpoints require authentication
router.use(authenticateToken);

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:item_id', updateCartItem);
router.delete('/items/:item_id', removeCartItem);
router.delete('/', clearCart);

export default router;