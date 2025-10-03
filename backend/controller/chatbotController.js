import axios from 'axios';

// Simple AI responses for e-commerce
const chatbotResponses = {
    greetings: [
        "Hello! Welcome to MishraMart 👋 How can I help you today?",
        "Hi there! 🛍️ Welcome to MishraMart. What can I assist you with?",
        "Hey! Welcome to MishraMart. How can I make your shopping experience better?",
        "Namaste! 🙏 Welcome to MishraMart. How may I assist you?"
    ],

    help: [
        "I can help you with: • Order tracking • Product information • Returns & refunds • Payment issues • Account help",
        "I'm here to help with: Order status, Product queries, Return policies, Payment problems, and Account issues!",
        "You can ask me about: Your orders, Products, Delivery, Returns, Payments, or any other shopping queries!"
    ],

    orders: [
        "You can check your order status in the 'My Orders' section. Need help with a specific order?",
        "Track your orders from the Orders page. For detailed order issues, provide your order ID.",
        "All your orders are available in the Orders section. Any specific order concern?"
    ],

    delivery: [
        "We deliver across India! 🚚 Standard delivery: 3-5 days, Express: 1-2 days. Free delivery on orders above ₹499!",
        "Delivery time: Standard 3-5 days, Express 1-2 days. Free shipping on orders over ₹499!",
        "We ship nationwide! Standard: 3-5 days, Express: 1-2 days. Enjoy free delivery for orders above ₹499!"
    ],

    returns: [
        "Easy 7-day return policy! 📦 Items can be returned within 7 days of delivery. Some conditions apply.",
        "We offer 7-day returns on most products. Please check product page for specific return policies.",
        "7-day return window from delivery date. Original tags and packaging should be intact."
    ],

    payment: [
        "We accept: 💳 Credit/Debit Cards, UPI, Net Banking, Wallet, and Cash on Delivery!",
        "Payment methods: Cards, UPI, Net Banking, Digital Wallets, and COD available!",
        "You can pay via Cards, UPI, Internet Banking, Wallets, or Cash on Delivery!"
    ],

    products: [
        "We have a wide range of fashion, electronics, home essentials and more! Browse our collections.",
        "Explore our categories: Fashion, Electronics, Home & Kitchen, Beauty, and more!",
        "Check out our latest collections in fashion, electronics, home goods, and lifestyle products!"
    ],

    contact: [
        "📞 Call us: 1800-123-4567 | 📧 Email: support@mishramart.com | 💬 Live Chat: 9AM-9PM",
        "Contact us: Phone: 1800-123-4567, Email: support@mishramart.com, Live Chat available!",
        "Reach us at: Phone 1800-123-4567, Email support@mishramart.com, or chat with us here!"
    ],

    default: [
        "I'm still learning! For now, I can help with orders, delivery, returns, payments, and product info. 😊",
        "I specialize in order tracking, delivery info, returns, payments, and product queries. Ask me anything about these!",
        "As your shopping assistant, I can help with orders, delivery, returns, and payments. What would you like to know?"
    ]
};

// Function to classify user message
const classifyMessage = (message) => {
    const lowerMessage = message.toLowerCase();

    if (/(hello|hi|hey|namaste|good morning|good afternoon|good evening)/.test(lowerMessage)) {
        return 'greetings';
    } else if (/(help|support|assist|can you help)/.test(lowerMessage)) {
        return 'help';
    } else if (/(order|track|status|delivery|shipped|dispatch)/.test(lowerMessage)) {
        return 'orders';
    } else if (/(deliver|shipping|ship|when will i get|delivery time)/.test(lowerMessage)) {
        return 'delivery';
    } else if (/(return|refund|exchange|replace|wrong item|damaged)/.test(lowerMessage)) {
        return 'returns';
    } else if (/(payment|pay|card|upi|cod|cash|money)/.test(lowerMessage)) {
        return 'payment';
    } else if (/(product|item|collection|category|what do you have)/.test(lowerMessage)) {
        return 'products';
    } else if (/(contact|call|email|phone number|customer care)/.test(lowerMessage)) {
        return 'contact';
    } else {
        return 'default';
    }
};

// Get random response from category
const getRandomResponse = (category) => {
    const responses = chatbotResponses[category];
    return responses[Math.floor(Math.random() * responses.length)];
};

// Main chatbot function
export const chatWithBot = async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Classify the message and get response
        const category = classifyMessage(message);
        const response = getRandomResponse(category);

        // Add some delay to simulate thinking
        await new Promise(resolve => setTimeout(resolve, 1000));

        res.status(200).json({
            success: true,
            response: response,
            category: category,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            success: false,
            response: "I'm having trouble responding right now. Please try again later.",
            timestamp: new Date().toISOString()
        });
    }
};

// Get chatbot suggestions
export const getChatSuggestions = (req, res) => {
    const suggestions = [
        "Track my order",
        "Return policy",
        "Delivery time",
        "Payment methods",
        "Contact customer care",
        "What products do you have?",
        "Order status help",
        "How to return an item?",
        "Delivery charges",
        "Payment failed issue"
    ];

    res.status(200).json({
        success: true,
        suggestions
    });
};