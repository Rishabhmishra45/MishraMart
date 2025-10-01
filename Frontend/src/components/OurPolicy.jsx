import React from "react";
import {
    FaTruck,
    FaUndo,
    FaShieldAlt,
    FaHeadset
} from "react-icons/fa";

const OurPolicy = () => {
    const policies = [
        {
            icon: <FaTruck className="text-3xl sm:text-4xl" />,
            title: "Free Shipping",
            description: "Enjoy free shipping on all orders above ₹999. Fast and reliable delivery across India.",
            color: "from-blue-500 to-cyan-400"
        },
        {
            icon: <FaUndo className="text-3xl sm:text-4xl" />,
            title: "Easy Returns",
            description: "Not satisfied? Return within 30 days for easy refunds or exchanges. No questions asked.",
            color: "from-green-500 to-emerald-400"
        },
        {
            icon: <FaShieldAlt className="text-3xl sm:text-4xl" />,
            title: "Secure Payments",
            description: "Your payments are 100% secure with SSL encryption. Multiple payment options available.",
            color: "from-purple-500 to-pink-400"
        },
        {
            icon: <FaHeadset className="text-3xl sm:text-4xl" />,
            title: "24/7 Support",
            description: "Our customer support team is available round the clock to help you with any queries.",
            color: "from-orange-500 to-yellow-400"
        }
    ];

    return (
        <section className="w-full py-12 sm:py-16 lg:py-20 bg-gradient-to-l from-[#141414] to-[#0c2025]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                        Why <span className="text-[#00D3F3]">Shop</span> With <span className="text-[#00D3F3]">Us</span>?
                    </h2>
                    <p className="text-blue-100 text-sm lg:text-[20px] sm:text-base max-w-2xl mx-auto">
                        We are committed to providing you with the best shopping experience,
                        from secure payments to fast delivery and excellent customer service.
                    </p>
                </div>

                {/* Policies Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {policies.map((policy, index) => (
                        <div
                            key={index}
                            className="group relative bg-[#0f1b1d] border border-gray-700 rounded-xl p-6 sm:p-8 
                         hover:border-blue-400 transition-all duration-300 hover:transform hover:-translate-y-2
                         hover:shadow-lg hover:shadow-blue-500/10"
                        >

                            {/* Background Gradient Effect */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${policy.color} opacity-0 
                              group-hover:opacity-5 rounded-xl transition-opacity duration-300`} />

                            {/* Icon Container */}
                            <div className={`mb-4 sm:mb-6 inline-flex items-center justify-center p-3 
                             bg-gradient-to-br ${policy.color} rounded-lg text-white 
                             group-hover:scale-110 transition-transform duration-300`}>
                                {policy.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">
                                {policy.title}
                            </h3>

                            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                {policy.description}
                            </p>

                            {/* Hover Border Effect */}
                            <div className={`absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r ${policy.color} 
                              group-hover:w-full transition-all duration-500 rounded-full`} />
                        </div>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="text-center mt-12 sm:mt-16 pt-8 border-t border-gray-700">
                    <p className="text-gray-400 text-sm sm:text-base">
                        Trusted by thousands of customers nationwide • 100% Satisfaction Guarantee • Fast & Reliable Service
                    </p>
                </div>
            </div>
        </section>
    );
};

export default OurPolicy;