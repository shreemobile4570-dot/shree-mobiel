import { getStoredCustomer } from "./axiosConfig";

export const getCurrentUserRole = () => getStoredCustomer()?.role || "user";

export const getRolePrice = (product, role = getCurrentUserRole()) => {
  if (role === "wholeseller" && Number(product?.wholesellerPrice) > 0) {
    return Number(product.wholesellerPrice);
  }
  if (role === "retailer" && Number(product?.retailerPrice) > 0) {
    return Number(product.retailerPrice);
  }
  return Number(product?.price || 0);
};
