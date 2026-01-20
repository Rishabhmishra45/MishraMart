import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthContextProvider from "./context/AuthContext.jsx";
import UserContextProvider from "./context/UserContext.jsx";
import ShopContext from "./context/ShopContext.jsx";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

// ✅ NEW Theme Provider
import ThemeProvider from "./context/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthContextProvider>
          <UserContextProvider>
            <ShopContext>
              <CartProvider>
                <WishlistProvider>
                  <App />
                </WishlistProvider>
              </CartProvider>
            </ShopContext>
          </UserContextProvider>
        </AuthContextProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
