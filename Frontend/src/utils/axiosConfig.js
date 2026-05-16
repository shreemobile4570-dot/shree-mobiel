const rawBaseUrl = process.env.REACT_APP_BASE_URL || "";

export const base_url = rawBaseUrl.endsWith("/") ? rawBaseUrl : `${rawBaseUrl}/`;

export const getStoredCustomer = () => {
  try {
    return localStorage.getItem("customer")
      ? JSON.parse(localStorage.getItem("customer"))
      : null;
  } catch (error) {
    localStorage.removeItem("customer");
    return null;
  }
};

const getCustomerFromLocalStorage = () =>
  getStoredCustomer();

export const getAuthConfig = () => {
  const customer = getCustomerFromLocalStorage();

  return {
    headers: {
      Authorization: `Bearer ${customer?.token || ""}`,
      Accept: "application/json",
    },
  };
};

export const config = {
  headers: {
    get Authorization() {
      return `Bearer ${getCustomerFromLocalStorage()?.token || ""}`;
    },
    Accept: "application/json",
  },
};
