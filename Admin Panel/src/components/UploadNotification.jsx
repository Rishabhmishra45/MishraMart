import React, { useEffect, useState } from 'react';

const UploadNotification = ({ isVisible, type, productName, onClose }) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [animationClass, setAnimationClass] = useState('');

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            setAnimationClass('upload-notification-slide-in');
        } else {
            setAnimationClass('upload-notification-slide-out');
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    if (!shouldRender) return null;

    const config = {
        uploading: {
            title: "Uploading Product...",
            message: "Please wait while we upload your product",
            gradient: "from-blue-500 to-cyan-500",
            icon: (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )
        },
        success: {
            title: "Product Added Successfully! ✅",
            message: `${productName} has been added to your store`,
            gradient: "from-green-500 to-emerald-600",
            icon: "✓"
        },
        error: {
            title: "Failed to Add Product ❌",
            message: "Please try again later",
            gradient: "from-red-500 to-pink-600",
            icon: "✕"
        }
    };

    const { title, message, gradient, icon } = config[type];

    return (
        <div className={`fixed top-22 right-4 z-50 ${animationClass}`}>
            <div className={`bg-gradient-to-r ${gradient} text-white rounded-2xl p-4 shadow-2xl shadow-current/30 border border-current/40 max-w-sm`}>
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        {typeof icon === "string" ? (
                            <span className="text-white text-lg font-bold">{icon}</span>
                        ) : (
                            icon
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">{title}</p>
                        <p className="text-white/90 text-xs">{message}</p>
                    </div>
                    {type !== "uploading" && (
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white text-lg font-bold transition-colors duration-200"
                        >
                            ×
                        </button>
                    )}
                </div>
                {type === "uploading" && (
                    <div className="mt-2 w-full bg-white/20 rounded-full h-1">
                        <div className="bg-white h-1 rounded-full animate-pulse"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadNotification;