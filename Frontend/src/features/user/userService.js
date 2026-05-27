import axios from "axios";
import { base_url, getAuthConfig } from "../../utils/axiosConfig";

const privateCache = new Map();
const PRIVATE_CACHE_MS = 15 * 1000;

const getCached = (key) => {
  const cached = privateCache.get(key);
  if (!cached || cached.expiresAt < Date.now()) {
    privateCache.delete(key);
    return null;
  }
  return cached.data;
};

const setCached = (key, data, ttl = PRIVATE_CACHE_MS) => {
  privateCache.set(key, { data, expiresAt: Date.now() + ttl });
  return data;
};

const clearPrivateCache = () => privateCache.clear();

const register = async (userData) => {
  const response = await axios.post(`${base_url}user/register`, userData);
  if (response.data) {
    return response.data;
  }
};

const login = async (userData) => {
  const response = await axios.post(`${base_url}user/login`, userData);

  if (response.data) {
    localStorage.setItem("customer", JSON.stringify(response.data));
    clearPrivateCache();
  }
  return response.data;
};

const getUserWislist = async () => {
  const cached = getCached("wishlist");
  if (cached) return cached;

  const response = await axios.get(`${base_url}user/wishlist`, getAuthConfig());
  if (response.data) {
    return setCached("wishlist", response.data);
  }
};

const addToCart = async (cartData) => {
  const response = await axios.post(`${base_url}user/cart`, cartData, getAuthConfig());
  if (response.data) {
    clearPrivateCache();
    return response.data;
  }
};

const getCart = async (data) => {
  const response = await axios.get(`${base_url}user/cart`, data || getAuthConfig());
  if (response.data) {
    return response.data;
  }
};

const removeProductFromCart = async (data) => {
  const response = await axios.delete(
    `${base_url}user/delete-product-cart/${data.id}`,

    data.config2 || getAuthConfig()
  );
  if (response.data) {
    clearPrivateCache();
    return response.data;
  }
};

const updateProductFromCart = async (cartDetail) => {
  const response = await axios.delete(
    `${base_url}user/update-product-cart/${cartDetail.cartItemId}/${cartDetail.quantity}`,
    getAuthConfig()
  );
  if (response.data) {
    clearPrivateCache();
    return response.data;
  }
};

const createOrder = async (orderDetail) => {
  const response = await axios.post(
    `${base_url}user/cart/create-order/`,
    orderDetail,
    getAuthConfig()
  );
  if (response.data) {
    clearPrivateCache();
    return response.data;
  }
};

const getUserOrders = async () => {
  const cached = getCached("orders");
  if (cached) return cached;

  const response = await axios.get(`${base_url}user/getmyorders`, getAuthConfig());

  if (response.data) {
    return setCached("orders", response.data);
  }
};

const updateUser = async (data) => {
  const response = await axios.put(
    `${base_url}user/edit-user`,
    data.data,
    data.config2 || getAuthConfig()
  );

  if (response.data) {
    clearPrivateCache();
    return response.data;
  }
};

const forgotPasswordToken = async (data) => {
  const response = await axios.post(
    `${base_url}user/forgot-password-token`,
    data
  );

  if (response.data) {
    clearPrivateCache();
    return response.data;
  }
};

const resetPass = async (data) => {
  const response = await axios.put(
    `${base_url}user/reset-password/${data.token}`,
    {
      password: data?.password,
    }
  );

  if (response.data) {
    return response.data;
  }
};

const emptyCart = async (data) => {
  const response = await axios.delete(`${base_url}user/empty-cart`, data || getAuthConfig());

  if (response.data) {
    clearPrivateCache();
    return response.data;
  }
};

export const authService = {
  register,
  login,
  getUserWislist,
  addToCart,
  getCart,
  removeProductFromCart,
  updateProductFromCart,
  createOrder,
  getUserOrders,
  updateUser,
  forgotPasswordToken,
  resetPass,
  emptyCart,
};
