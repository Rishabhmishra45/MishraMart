import React from 'react';
import { FaCheck, FaShoppingCart } from 'react-icons/fa';

const CartNotification = ({ product, isVisible, onClose }) => {
    if (!isVisible || !product) return null;

    return (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 shadow-2xl shadow-green-500/30 border border-green-400 max-w-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <FaCheck className="text-white text-lg" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">Added to Cart!</p>
                        <p className="text-white/90 text-xs">{product.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white text-lg"
                    >
                        ×
                    </button>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
                    <FaShoppingCart className="text-xs" />
                    <span>Item successfully added to your shopping cart</span>
                </div>
            </div>
        </div>
    );
};

export default CartNotification;