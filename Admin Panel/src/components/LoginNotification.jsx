// components/LoginNotification.jsx
import React, { useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const LoginNotification = ({ isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000); // Auto close after 4 seconds

            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-22 right-4 z-50 animate-fade-in">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 shadow-2xl shadow-green-500/30 border border-green-400 max-w-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <FaCheckCircle className="text-white text-lg" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">Login Successful!</p>
                        <p className="text-white/90 text-xs">Welcome to Admin Panel</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white text-lg transition-colors"
                    >
                        ×
                    </button>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
                    <span>You have successfully logged in to MishraMart Admin</span>
                </div>
            </div>
        </div>
    );
};

export default LoginNotification;