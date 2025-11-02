// Card.jsx - Simple Animation with Page Refresh Trigger
import React, { useContext, useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopDataContext } from '../context/ShopContext';
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';

const Card = ({ name, image, id, price, category }) => {
    let { currency } = useContext(shopDataContext);
    const navigate = useNavigate();
    const cardRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    // Generate unique but fixed discount based on product ID
    const generateFixedDiscount = (productId) => {
        const hash = productId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        const discounts = [15, 20, 25, 30, 35, 40, 45, 50];
        const index = Math.abs(hash) % discounts.length;
        return discounts[index];
    };

    const discountPercentage = generateFixedDiscount(id);
    const discountedPrice = price - (price * discountPercentage / 100);

    // Simple animation on component mount (page refresh)
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const handleClick = () => {
        navigate(`/product/${id}`, { 
            state: { 
                discountPercentage: discountPercentage,
                discountedPrice: discountedPrice
            } 
        });
    };

    // Category-based colors
    const getCategoryColor = () => {
        const colorMap = {
            'electronics': 'from-blue-500/20 to-cyan-600/20 border-blue-500/30',
            'clothing': 'from-purple-500/20 to-pink-600/20 border-purple-500/30',
            'home': 'from-orange-500/20 to-amber-600/20 border-orange-500/30',
            'beauty': 'from-rose-500/20 to-pink-600/20 border-rose-500/30',
            'sports': 'from-green-500/20 to-emerald-600/20 border-green-500/30',
            'books': 'from-indigo-500/20 to-blue-600/20 border-indigo-500/30',
            'default': 'from-gray-500/20 to-slate-600/20 border-gray-500/30'
        };
        return colorMap[category] || colorMap.default;
    };

    const cardColor = getCategoryColor();

    return (
        <div 
            ref={cardRef}
            onClick={handleClick}
            className={`group w-72 h-80 bg-gradient-to-br from-[#1a1a1a] to-[#0f1a1d] rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 flex flex-col border border-gray-700 relative
                ${isVisible 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-10 scale-95'
                }`}
            style={{
                transition: 'all 0.9s ease-out'
            }}
        >
            {/* Discount Badge */}
            <div className="absolute top-3 left-3 z-10">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold py-1.5 px-3 rounded-full shadow-lg border border-red-300/30">
                    {discountPercentage}% OFF
                </div>
            </div>

            {/* Wishlist Button */}
            <button 
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:text-red-400 transition-all duration-300 hover:scale-110 hover:bg-black/80 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                    e.stopPropagation();
                    console.log('Add to wishlist:', id);
                }}
            >
                <FaHeart className="text-sm" />
            </button>

            {/* Image Container */}
            <div className="relative w-full h-48 overflow-hidden bg-gray-800">
                <img 
                    src={image} 
                    alt={name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Quick Add to Cart Button */}
                <button 
                    className="absolute bottom-3 right-3 w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log('Quick add to cart:', id);
                    }}
                >
                    <FaShoppingCart className="text-sm" />
                </button>

                {/* Rating Badge */}
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                    <FaStar className="text-yellow-400 text-xs" />
                    <span className="text-white text-xs font-medium">4.8</span>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                    {/* Product Name */}
                    <h3 className="text-white font-semibold text-[15px] mb-2 line-clamp-2 leading-tight group-hover:text-cyan-100 transition-colors duration-300">
                        {name}
                    </h3>
                    
                    {/* Price Section */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-bold text-cyan-400">
                            {currency} {discountedPrice.toFixed(0)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                            {currency} {price}
                        </span>
                    </div>

                    {/* Savings Badge */}
                    <div className="text-xs text-green-400 font-medium bg-green-400/10 py-1 px-2 rounded-full inline-block">
                        Save {currency} {(price * discountPercentage / 100).toFixed(0)}
                    </div>
                </div>

                {/* Category Tag */}
                <div className={`mt-2 text-xs py-1.5 px-3 rounded-full bg-gradient-to-r ${cardColor} text-gray-300 border inline-block self-start`}>
                    {category || 'Product'}
                </div>
            </div>

            {/* Hover Border Effect */}
            <div className={`absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/40 rounded-2xl transition-all duration-300 pointer-events-none`}></div>
        </div>
    );
};

export default Card;