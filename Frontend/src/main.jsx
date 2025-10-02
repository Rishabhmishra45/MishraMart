import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthContextProvider from "./context/AuthContext.jsx";
import UserContextProvider from "./context/UserContext.jsx";
import ShopContext from "./context/ShopContext.jsx";
import { CartProvider } from './context/CartContext';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <UserContextProvider>
          <ShopContext>
            <CartProvider>
              <App />
            </CartProvider>
          </ShopContext>
        </UserContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>
);
