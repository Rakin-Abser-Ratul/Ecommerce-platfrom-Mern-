import Product from '../models/Product.js';
import Review from '../models/Review.js';
import cloudinary from '../config/cloudinary.js';

// Helper: Extract Cloudinary public_id from secure URL
const extractCloudinaryPublicId = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) return null;
  const match = imageUrl.match(/\/(?:v\d+\/)?(products\/[^/.]+)/);
  return match ? match[1] : null;
};

// Helper: Format product response with average_rating and review_count
const formatProductResponse = async (productDoc) => {
  const productObj = productDoc.toJSON ? productDoc.toJSON() : productDoc;
  
  // Aggregate reviews for average_rating and review_count
  const reviews = await Review.find({ product_id: productObj.id });
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0 
    ? Number((reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount).toFixed(1))
    : 0.0;

  return {
    ...productObj,
    average_rating: avgRating,
    review_count: reviewCount,
  };
};

// @desc    Fetch All Products
// @route   GET /api/products
export const getProducts = async (req, res) => {
  const skip = parseInt(req.query.skip, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 50;

  try {
    const products = await Product.find().skip(skip).limit(limit);
    const formattedProducts = await Promise.all(
      products.map((p) => formatProductResponse(p))
    );
    return res.status(200).json(formattedProducts);
  } catch (err) {
    return res.status(500).json({ detail: err.message });
  }
};

// @desc    Fetch Single Product
// @route   GET /api/products/:id
// @desc    Fetch Single Product (With populated reviews)
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ detail: 'Product not found' });
    }

    // 1. Fetch reviews associated with this product
    const reviews = await Review.find({ product_id: product._id }).lean();

    // 2. Format base product (adds average_rating and review_count)
    const formattedProduct = await formatProductResponse(product);

    // 3. Attach reviews array transformed with string 'id'
    const formattedReviews = reviews.map((r) => ({
      id: r._id.toString(),
      rating: r.rating,
      comment: r.comment,
      product_id: r.product_id.toString(),
      user_id: r.user_id ? r.user_id.toString() : null,
      created_at: r.createdAt || r.created_at,
    }));

    return res.status(200).json({
      ...formattedProduct,
      reviews: formattedReviews, // <--- Attach reviews list here
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ detail: 'Product not found' });
    }
    return res.status(500).json({ detail: err.message });
  }
};

// @desc    Create Product with Cloudinary Image Upload
// @route   POST /api/products
export const createProduct = async (req, res) => {
  const { title, price, description, custom_fields } = req.body;
  let imageUrl = null;

  try {
    // Handle Cloudinary Image Upload
    if (req.file) {
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ detail: 'Uploaded file must be an image.' });
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'products' },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.file.buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    // Parse custom_fields JSON string
    let parsedCustomFields = [];
    if (custom_fields) {
      try {
        parsedCustomFields = typeof custom_fields === 'string' ? JSON.parse(custom_fields) : custom_fields;
      } catch (e) {
        parsedCustomFields = [];
      }
    }

    const newProduct = await Product.create({
      title,
      price: parseFloat(price),
      description: description || null,
      custom_fields: parsedCustomFields,
      image_url: imageUrl,
      user_id: req.user.id,
    });

    const response = await formatProductResponse(newProduct);
    return res.status(201).json(response);
  } catch (err) {
    return res.status(500).json({ detail: `Failed to upload image or create product: ${err.message}` });
  }
};

// @desc    Update Product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ detail: 'Product not found' });
    }

    // Check ownership
    if (product.user_id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ detail: 'Not authorized to edit this product' });
    }

    const { title, price, description, custom_fields } = req.body;

    if (title !== undefined) product.title = title;
    if (price !== undefined) product.price = parseFloat(price);
    if (description !== undefined) product.description = description;

    if (custom_fields !== undefined) {
      try {
        product.custom_fields = typeof custom_fields === 'string' ? JSON.parse(custom_fields) : custom_fields;
      } catch (e) {
        // Leave custom_fields unchanged on JSON parse failure
      }
    }

    // Handle new image upload & destroy old one
    if (req.file) {
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ detail: 'Uploaded file must be an image.' });
      }

      const oldPublicId = extractCloudinaryPublicId(product.image_url);
      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId).catch(() => {});
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'products' },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.file.buffer);
      });

      product.image_url = uploadResult.secure_url;
    }

    await product.save();
    const response = await formatProductResponse(product);
    return res.status(200).json(response);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ detail: 'Product not found' });
    }
    return res.status(500).json({ detail: err.message });
  }
};

// @desc    Delete Product & Associated Cloudinary Image
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ detail: 'Product not found' });
    }

    // Check ownership
    if (product.user_id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ detail: 'Not authorized to delete this product' });
    }

    // Delete image from Cloudinary
    if (product.image_url) {
      const publicId = extractCloudinaryPublicId(product.image_url);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId).catch(() => {});
      }
    }

    // Delete associated reviews (Cascade)
    await Review.deleteMany({ product_id: product._id });

    await Product.findByIdAndDelete(req.params.id);
    return res.status(204).send();
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ detail: 'Product not found' });
    }
    return res.status(500).json({ detail: err.message });
  }
};

// @desc    Add or Update Review
// @route   POST /api/products/:id/reviews
export const createOrUpdateReview = async (req, res) => {
  const productId = req.params.id;
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ detail: 'Product not found' });
    }

    let review = await Review.findOne({
      product_id: productId,
      user_id: req.user.id,
    });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        rating,
        comment,
        product_id: productId,
        user_id: req.user.id,
      });
    }

    return res.status(200).json(review);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ detail: 'Product not found' });
    }
    return res.status(500).json({ detail: err.message });
  }
};

// @desc    Get Current User's Products
// @route   GET /api/products/me
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ user_id: req.user.id });
    const formattedProducts = await Promise.all(
      products.map((p) => formatProductResponse(p))
    );
    return res.status(200).json(formattedProducts);
  } catch (err) {
    return res.status(500).json({ detail: err.message });
  }
};