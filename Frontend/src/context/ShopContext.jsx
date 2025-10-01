import React, { createContext, useContext, useEffect, useState } from "react";
import { authDataContext } from "./AuthContext";
import axios from "axios";

export const shopDataContext = createContext();

const ShopContext = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const { serverUrl } = useContext(authDataContext);

    const currency = "₹";
    const delivery_fee = 50;

    const getProducts = async () => {
        try {
            const result = await axios.get(serverUrl + "/api/product/list");
            setProducts(result.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getProducts();
    }, []);

    const value = {
        products,
        currency,
        delivery_fee,
        getProducts,
        search,
        setSearch,
        showSearch,
        setShowSearch
    };

    return (
        <shopDataContext.Provider value={value}>
            {children}
        </shopDataContext.Provider>
    );
};

export default ShopContext;