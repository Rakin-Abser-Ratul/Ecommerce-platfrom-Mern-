import API from './api';

export const getProducts = async () => {
  const res = await API.get('/products/');
  return res.data;
};

export const getProductById = async (id) => {
  const res = await API.get(`/products/${id}`);
  return res.data;
};

export const createProduct = async (productData) => {
  const res = await API.post('/products/', productData);
  return res.data;
};

export const addReview = async (productId, reviewData) => {
  const res = await API.post(`/products/${productId}/reviews`, reviewData);
  return res.data;
};