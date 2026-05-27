const DB_NAME = "shree-mobile-offline";
const DB_VERSION = 1;
const PRODUCT_STORE = "products";
const META_STORE = "meta";
const PRODUCT_SYNC_KEY = "productLastSync";

const isBrowser = typeof window !== "undefined" && "indexedDB" in window;

const openDb = () =>
  new Promise((resolve, reject) => {
    if (!isBrowser) {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(PRODUCT_STORE)) {
        const productStore = db.createObjectStore(PRODUCT_STORE, { keyPath: "_id" });
        productStore.createIndex("updatedAt", "updatedAt", { unique: false });
        productStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const runStore = async (storeName, mode, callback) => {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = callback(store);

    transaction.oncomplete = () => {
      db.close();
      resolve(request?.result);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

export const getCachedProducts = async () => {
  try {
    return await runStore(PRODUCT_STORE, "readonly", (store) => store.getAll());
  } catch (error) {
    return [];
  }
};

export const getCachedProduct = async (id) => {
  try {
    return await runStore(PRODUCT_STORE, "readonly", (store) => store.get(id));
  } catch (error) {
    return null;
  }
};

export const saveProducts = async (products = []) => {
  if (!Array.isArray(products) || products.length === 0) return;

  try {
    await runStore(PRODUCT_STORE, "readwrite", (store) => {
      products.forEach((product) => {
        if (product?._id) store.put(product);
      });
      return null;
    });
  } catch (error) {
    // Offline cache should never break the shopping flow.
  }
};

export const saveProduct = async (product) => {
  if (!product?._id) return;
  await saveProducts([product]);
};

export const replaceProducts = async (products = []) => {
  if (!Array.isArray(products)) return;

  try {
    await runStore(PRODUCT_STORE, "readwrite", (store) => {
      store.clear();
      products.forEach((product) => {
        if (product?._id) store.put(product);
      });
      return null;
    });
  } catch (error) {
    // A failed cache refresh should not block live product data.
  }
};

export const removeCachedProduct = async (id) => {
  if (!id) return;

  try {
    await runStore(PRODUCT_STORE, "readwrite", (store) => store.delete(id));
  } catch (error) {
    // Ignore cache cleanup failures.
  }
};

export const getProductLastSync = async () => {
  try {
    const meta = await runStore(META_STORE, "readonly", (store) =>
      store.get(PRODUCT_SYNC_KEY)
    );
    return meta?.value || "";
  } catch (error) {
    return "";
  }
};

export const setProductLastSync = async (value) => {
  if (!value) return;

  try {
    await runStore(META_STORE, "readwrite", (store) =>
      store.put({ key: PRODUCT_SYNC_KEY, value })
    );
  } catch (error) {
    // A failed cursor write only means the next sync asks for a little more data.
  }
};
