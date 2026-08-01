import express from 'express';
import {
  getProducts,
  getMyProducts, // <--- Added import
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrUpdateReview,
} from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);

// User-specific route (MUST be defined BEFORE /:id)
router.get('/me', authenticateToken, getMyProducts);

router.get('/:id', getProductById);

// Protected routes (JWT required)
router.post('/', authenticateToken, upload.single('image'), createProduct);
router.put('/:id', authenticateToken, upload.single('image'), updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);

// Review route
router.post('/:id/reviews', authenticateToken, createOrUpdateReview);

export default router;