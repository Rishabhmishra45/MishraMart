import React, { useEffect, useState } from 'react';
import {
    FaCheckDouble,
    FaShippingFast,
    FaBox,
    FaTimesCircle,
    FaCheckCircle,
    FaInfoCircle
} from 'react-icons/fa';

const OrderNotification = ({ isVisible, type, message, onClose }) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [animationClass, setAnimationClass] = useState('');

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            setAnimationClass('order-notification-slide-in');
        } else {
            setAnimationClass('order-notification-slide-out');
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    if (!shouldRender) return null;

    const config = {
        success: {
            icon: <FaCheckCircle className="text-white text-lg" />,
            gradient: "from-green-500 to-emerald-600",
            title: "Success!"
        },
        error: {
            icon: <FaTimesCircle className="text-white text-lg" />,
            gradient: "from-red-500 to-pink-600",
            title: "Error!"
        },
        processing: {
            icon: <FaBox className="text-white text-lg" />,
            gradient: "from-yellow-500 to-orange-600",
            title: "Processing"
        },
        shipped: {
            icon: <FaShippingFast className="text-white text-lg" />,
            gradient: "from-blue-500 to-cyan-600",
            title: "Shipped"
        },
        delivered: {
            icon: <FaCheckDouble className="text-white text-lg" />,
            gradient: "from-green-500 to-emerald-600",
            title: "Delivered"
        },
        cancelled: {
            icon: <FaTimesCircle className="text-white text-lg" />,
            gradient: "from-red-500 to-pink-600",
            title: "Cancelled"
        },
        info: {
            icon: <FaInfoCircle className="text-white text-lg" />,
            gradient: "from-cyan-500 to-blue-600",
            title: "Info"
        }
    };

    const { icon, gradient, title } = config[type] || config.info;

    return (
        <div className={`fixed top-22 right-4 z-50 ${animationClass}`}>
            <div className={`bg-gradient-to-r ${gradient} text-white rounded-2xl p-4 shadow-2xl shadow-current/30 border border-current/40 max-w-sm`}>
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        {icon}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">{title}</p>
                        <p className="text-white/90 text-xs">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white text-lg font-bold transition-colors duration-200"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderNotification;