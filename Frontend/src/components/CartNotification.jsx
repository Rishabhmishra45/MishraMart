import React from 'react';
import { FaCheck, FaShoppingCart, FaTimes } from 'react-icons/fa';

const CartNotification = ({ product, isVisible, onClose }) => {
    if (!isVisible || !product) return null;

    return (
        <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 shadow-2xl shadow-green-500/30 border border-green-400 max-w-sm backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <FaCheck className="text-white text-lg" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">Added to Cart! 🎉</p>
                        <p className="text-white/90 text-xs mt-1">{product.name}</p>
                        {product.size && (
                            <p className="text-white/80 text-xs">Size: {product.size}</p>
                        )}
                        <p className="text-white/80 text-xs mt-1">
                            ₹{product.price} × {product.quantity || 1}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white text-lg transition-colors duration-200 hover:scale-110"
                    >
                        <FaTimes />
                    </button>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
                    <FaShoppingCart className="text-xs" />
                    <span>Item successfully added to your shopping cart</span>
                </div>
                
                {/* Progress Bar for auto-close */}
                <div className="mt-2 w-full bg-white/20 rounded-full h-1">
                    <div 
                        className="bg-white h-1 rounded-full transition-all duration-3000 ease-linear"
                        style={{ 
                            width: '100%',
                            animation: 'progress 3s linear forwards'
                        }}
                    ></div>
                </div>
            </div>

            <style jsx>{`
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default CartNotification;