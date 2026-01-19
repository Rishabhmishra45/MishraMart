import React, { createContext, useContext, useEffect, useState } from "react";
import { authDataContext } from "./AuthContext";
import axios from "axios";

export const shopDataContext = createContext();

const ShopContext = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { serverUrl } = useContext(authDataContext);

  const currency = "₹";
  const delivery_fee = 50;

  const getProducts = async () => {
    try {
      setLoadingProducts(true);

      const result = await axios.get(serverUrl + "/api/product/list");

      // ✅ Backend: { success, products }
      const list = Array.isArray(result?.data?.products)
        ? result.data.products
        : [];

      setProducts(list);
    } catch (error) {
      console.log("getProducts error:", error.message);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    products,
    loadingProducts,
    currency,
    delivery_fee,
    getProducts,
    search,
    setSearch,
    showSearch,
    setShowSearch,
  };

  return (
    <shopDataContext.Provider value={value}>
      {children}
    </shopDataContext.Provider>
  );
};

export default ShopContext;
