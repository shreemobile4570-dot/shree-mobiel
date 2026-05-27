import axios from "axios";
import { base_url, getAuthConfig, getStoredCustomer } from "../../utils/axiosConfig";
import {
  getCachedProduct,
  getCachedProducts,
  getProductLastSync,
  saveProduct,
  saveProducts,
  setProductLastSync,
} from "../../utils/productOfflineDb";

const PRODUCT_CACHE_TTL = 15 * 60 * 1000;
const PRODUCT_IMAGE_CACHE = "shree-mobile-product-images-v1";

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

const isOnline = () => typeof navigator === "undefined" || navigator.onLine;

const normalizeSearchValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const matchesProductFilters = (product, filters = {}) => {
  if (!product) return false;

  if (filters.brand && normalizeSearchValue(product.brand) !== normalizeSearchValue(filters.brand)) {
    return false;
  }

  if (filters.tag) {
    const tags = asArray(product.tags).map(normalizeSearchValue);
    if (!tags.includes(normalizeSearchValue(filters.tag))) return false;
  }

  if (filters.category) {
    const categories = asArray(filters.category).map(normalizeSearchValue);
    if (!categories.includes(normalizeSearchValue(product.category))) return false;
  }

  const price = Number(product.price || 0);
  if (filters.minPrice && price < Number(filters.minPrice)) return false;
  if (filters.maxPrice && price > Number(filters.maxPrice)) return false;

  return true;
};

const sortProducts = (products, sort) => {
  const sortedProducts = [...products];

  if (!sort) {
    return sortedProducts.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }

  const sortFields = String(sort).split(",");
  return sortedProducts.sort((a, b) => {
    for (const field of sortFields) {
      const direction = field.startsWith("-") ? -1 : 1;
      const key = field.replace(/^-/, "");
      const aValue = a?.[key];
      const bValue = b?.[key];

      if (aValue === bValue) continue;
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * direction;
      }

      return String(aValue).localeCompare(String(bValue)) * direction;
    }

    return 0;
  });
};

const applyProductQuery = (products = [], filters = {}) => {
  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.max(Number(filters.limit) || products.length || 24, 1);
  const start = (page - 1) * limit;

  return sortProducts(products.filter((product) => matchesProductFilters(product, filters)), filters.sort)
    .slice(start, start + limit);
};

const notifyServiceWorkerToCacheImages = (products = []) => {
  const urls = products
    .flatMap((product) => product?.images || [])
    .map((image) => image?.url)
    .filter(Boolean);

  if (!urls.length) return;

  if (typeof navigator !== "undefined" && navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "CACHE_PRODUCT_IMAGES",
      urls,
    });
  }

  if (typeof window !== "undefined" && "caches" in window) {
    window.caches.open(PRODUCT_IMAGE_CACHE).then((cache) => {
      urls.forEach((url) => {
        cache.match(url).then((cachedResponse) => {
          if (cachedResponse) return;
          fetch(url, { mode: "no-cors" })
            .then((response) => cache.put(url, response))
            .catch(() => null);
        });
      });
    });
  }
};

const isProductCacheFresh = async () => {
  const lastSync = await getProductLastSync();
  if (!lastSync) return false;

  const lastSyncTime = new Date(lastSync).getTime();
  if (Number.isNaN(lastSyncTime)) return false;

  return Date.now() - lastSyncTime < PRODUCT_CACHE_TTL;
};

const syncProducts = async ({ force = false } = {}) => {
  if (!force && (await isProductCacheFresh())) {
    return [];
  }

  const since = await getProductLastSync();
  const params = new URLSearchParams();
  if (since) params.append("since", since);

  const response = await axios
    .get(`${base_url}product/sync?${params.toString()}`, getAuthConfig())
    .catch(handleProductAuthError);

  const products = response?.data?.products || [];
  await saveProducts(products);
  await setProductLastSync(response?.data?.serverTime || new Date().toISOString());
  notifyServiceWorkerToCacheImages(products);

  return products;
};

const refreshProductsInBackground = () => {
  if (!isOnline()) return;

  syncProducts()
    .then((products) => {
      if (products?.length) notifyServiceWorkerToCacheImages(products);
    })
    .catch((error) => {
      if ([401, 403].includes(error?.response?.status)) {
        handleProductAuthError(error);
      }
    });
};

const refreshSingleProductInBackground = (id) => {
  if (!isOnline()) return;

  axios
    .get(`${base_url}product/${id}`, getAuthConfig())
    .then(async (response) => {
      if (response.data) {
        await saveProduct(response.data);
        notifyServiceWorkerToCacheImages([response.data]);
      }
    })
    .catch((error) => {
      if ([401, 403].includes(error?.response?.status)) handleProductAuthError(error);
    });
};

const cacheKnownProductImages = (products = []) => {
  notifyServiceWorkerToCacheImages(products);
};

const getProducts = async (data) => {
  if (!requireCustomerToken()) return [];

  const cachedProducts = await getCachedProducts();
  if (cachedProducts.length) {
    cacheKnownProductImages(cachedProducts);
    refreshProductsInBackground();
    return applyProductQuery(cachedProducts, data);
  }

  if (!isOnline()) {
    return [];
  }

  try {
    await syncProducts({ force: true });
  } catch (error) {
    if ([401, 403].includes(error?.response?.status)) throw error;
  }

  return applyProductQuery(await getCachedProducts(), data);
};

const getSingleProduct = async (id) => {
  if (!requireCustomerToken()) return null;

  const cachedProduct = await getCachedProduct(id);
  if (cachedProduct) {
    cacheKnownProductImages([cachedProduct]);
    if (!(await isProductCacheFresh())) {
      refreshSingleProductInBackground(id);
    }
    return cachedProduct;
  }

  if (!isOnline()) {
    return null;
  }

  try {
    const response = await axios
      .get(`${base_url}product/${id}`, getAuthConfig())
      .catch(handleProductAuthError);
    if (response.data) {
      await saveProduct(response.data);
      notifyServiceWorkerToCacheImages([response.data]);
      return response.data;
    }
  } catch (error) {
    const fallbackProduct = await getCachedProduct(id);
    if (fallbackProduct) return fallbackProduct;
    throw error;
  }
};

/*
const getProductsOld = async (data) => {
  if (!requireCustomerToken()) return [];

  if (isOnline()) {
    try {
      await syncProducts();
    } catch (error) {
      if ([401, 403].includes(error?.response?.status)) throw error;
    }
  }

  const cachedProducts = await getCachedProducts();
  return applyProductQuery(cachedProducts, data);
};

const getSingleProductOld = async (id) => {
  if (!requireCustomerToken()) return null;

  if (!isOnline()) {
    return getCachedProduct(id);
  }

  try {
    const response = await axios
      .get(`${base_url}product/${id}`, getAuthConfig())
      .catch(handleProductAuthError);
    if (response.data) {
      await saveProduct(response.data);
      notifyServiceWorkerToCacheImages([response.data]);
      return response.data;
    }
  } catch (error) {
    const cachedProduct = await getCachedProduct(id);
    if (cachedProduct) return cachedProduct;
    throw error;
  }
};
*/

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
