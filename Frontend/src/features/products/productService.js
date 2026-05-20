import axios from "axios";
import { base_url, getAuthConfig, getStoredCustomer } from "../../utils/axiosConfig";

const requireCustomerToken = () => {
  const customer = getStoredCustomer();
  if (customer?.token) return true;

  localStorage.removeItem("customer");
  localStorage.removeItem("token");
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
  return false;
};

const handleProductAuthError = (error) => {
  if ([401, 403].includes(error?.response?.status)) {
    localStorage.removeItem("customer");
    localStorage.removeItem("token");
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }
  throw error;
};

const getProducts = async (data) => {
  if (!requireCustomerToken()) return [];

  const params = new URLSearchParams();

  if (data?.brand) params.append("brand", data.brand);
  if (data?.tag) params.append("tags", data.tag);
  if (Array.isArray(data?.category)) {
    params.append("category", data.category.join(","));
  } else if (data?.category) {
    params.append("category", data.category);
  }
  if (data?.minPrice) params.append("price[gte]", data.minPrice);
  if (data?.maxPrice) params.append("price[lte]", data.maxPrice);
  if (data?.sort) params.append("sort", data.sort);
  if (data?.limit) params.append("limit", data.limit);
  if (data?.page) params.append("page", data.page);
  if (data?.fields) params.append("fields", data.fields);

  const response = await axios
    .get(`${base_url}product?${params.toString()}`, getAuthConfig())
    .catch(handleProductAuthError);

  if (response.data) {
    return response.data;
  }
};

const getSingleProduct = async (id) => {
  if (!requireCustomerToken()) return null;

  const response = await axios
    .get(`${base_url}product/${id}`, getAuthConfig())
    .catch(handleProductAuthError);
  if (response.data) {
    return response.data;
  }
};

const addToWishlist = async (prodId) => {
  const response = await axios.put(
    `${base_url}product/Wishlist`,
    { prodId },
    getAuthConfig()
  );
  if (response.data) {
    return response.data;
  }
};

const rateProduct = async (data) => {
  const response = await axios.put(`${base_url}product/rating`, data, getAuthConfig());
  if (response.data) {
    return response.data;
  }
};

export const productSevice = {
  getProducts,
  addToWishlist,
  getSingleProduct,
  rateProduct,
};
