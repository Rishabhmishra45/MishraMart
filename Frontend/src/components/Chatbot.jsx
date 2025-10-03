import React, { useState, useRef, useEffect } from 'react';
import { authDataContext } from '../context/AuthContext';
import {
    FaRobot,
    FaTimes,
    FaPaperPlane,
    FaCommentDots,
    FaShoppingCart,
    FaTruck,
    FaUndo,
    FaCreditCard,
    FaBox,
    FaHeadset,
    FaVolumeUp,
    FaVolumeMute,
    FaExpand,
    FaPaperclip,
    FaCompress
} from 'react-icons/fa';
import axios from 'axios';

const Chatbot = () => {
    const { serverUrl } = React.useContext(authDataContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [soundOn, setSoundOn] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Initial bot message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 1,
                    text: "Hello! I'm your MishraMart assistant 🤖 How can I help you with your shopping today?",
                    sender: 'bot',
                    timestamp: new Date()
                }
            ]);
            fetchSuggestions();
        }
    }, [isOpen]);

    // Scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchSuggestions = async () => {
        try {
            const response = await axios.get(`${serverUrl}/api/chatbot/suggestions`);
            if (response.data.success) {
                setSuggestions(response.data.suggestions);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const sendMessage = async (messageText = inputMessage) => {
        if (!messageText.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: messageText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${serverUrl}/api/chatbot/chat`, {
                message: messageText
            }, {
                timeout: 10000
            });

            if (response.data.success) {
                const botMessage = {
                    id: Date.now() + 1,
                    text: response.data.response,
                    sender: 'bot',
                    timestamp: new Date(response.data.timestamp)
                };
                setMessages(prev => [...prev, botMessage]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting. Please try again later.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    };

    const handleSuggestionClick = (suggestion) => {
        sendMessage(suggestion);
    };

    const quickActions = [
        { icon: FaShoppingCart, text: 'Order Status', query: 'Where is my order?' },
        { icon: FaTruck, text: 'Delivery', query: 'What is the delivery time?' },
        { icon: FaUndo, text: 'Returns', query: 'What is your return policy?' },
        { icon: FaCreditCard, text: 'Payments', query: 'What payment methods do you accept?' },
        { icon: FaBox, text: 'Products', query: 'What products do you have?' },
        { icon: FaHeadset, text: 'Contact', query: 'How can I contact customer service?' }
    ];

    const handleQuickAction = (query) => {
        sendMessage(query);
    };

    const clearChat = () => {
        setMessages([
            {
                id: 1,
                text: "Hello! I'm your MishraMart assistant 🤖 How can I help you with your shopping today?",
                sender: 'bot',
                timestamp: new Date()
            }
        ]);
    };

    const toggleSound = () => {
        setSoundOn(!soundOn);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const downloadChatTranscript = () => {
        const chatText = messages.map(msg =>
            `${msg.sender === 'user' ? 'You' : 'Assistant'}: ${msg.text} (${msg.timestamp.toLocaleString()})`
        ).join('\n\n');

        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-transcript-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const userMessage = {
                id: Date.now(),
                text: `Attached file: ${file.name}`,
                sender: 'user',
                timestamp: new Date(),
                attachment: file
            };
            setMessages(prev => [...prev, userMessage]);
            event.target.value = '';
        }
    };

    return (
        <>
            {/* Chat Bot Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-4 xs:right-5 sm:right-6 z-40 w-12 h-12 xs:w-14 xs:h-14 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-full shadow-2xl shadow-cyan-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 mb-[30px] sm:mb-0"
                aria-label="Open chatbot"
            >
                <FaCommentDots className="text-lg xs:text-xl" />
            </button>

            {/* Chat Bot Modal */}
            {isOpen && (
                <div className={`fixed z-50 flex items-end justify-end ${isExpanded ? 'inset-0 p-0' : 'bottom-4 right-4 xs:bottom-5 xs:right-5 sm:bottom-6 sm:right-6'} transition-all duration-300`}>

                    {/* Backdrop for mobile */}
                    <div
                        className={`fixed inset-0 bg-black/50 ${isExpanded ? 'block' : 'hidden sm:block'}`}
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Chat Window */}
                    <div className={`relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 flex flex-col transition-all duration-300 ${isExpanded
                            ? 'w-full h-full m-0 rounded-none'
                            : 'w-[95vw] max-w-md h-[85vh] max-h-[600px] xs:w-[90vw] sm:w-full'
                        }`}>

                        {/* Header */}
                        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-3 xs:px-4 py-3 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-2 xs:gap-3">
                                <div className="w-8 h-8 xs:w-10 xs:h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                    <FaRobot className="text-cyan-600 text-base xs:text-xl" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-white font-semibold text-sm xs:text-base truncate">MishraMart Assistant</h3>
                                    <p className="text-cyan-100 text-xs truncate">Online • Ready to help</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 xs:gap-3 flex-shrink-0">
                                {/* Sound Toggle */}
                                <button
                                    onClick={toggleSound}
                                    className="text-white hover:text-cyan-200 transition p-1"
                                    title={soundOn ? 'Sound On' : 'Sound Off'}
                                >
                                    {soundOn ? <FaVolumeUp className="text-xs xs:text-sm" /> : <FaVolumeMute className="text-xs xs:text-sm" />}
                                </button>

                                {/* Expand Toggle */}
                                <button
                                    onClick={toggleExpand}
                                    className="text-white hover:text-cyan-200 transition p-1"
                                    title={isExpanded ? 'Minimize' : 'Expand'}
                                >
                                    {isExpanded ? <FaCompress className="text-xs xs:text-sm" /> : <FaExpand className="text-xs xs:text-sm" />}
                                </button>

                                {/* Download Transcript */}
                                <button
                                    onClick={downloadChatTranscript}
                                    className="text-white hover:text-cyan-200 transition text-xs xs:text-sm p-1"
                                    title="Download Chat Transcript"
                                >
                                    Export
                                </button>

                                <button
                                    onClick={clearChat}
                                    className="text-white hover:text-cyan-200 transition text-xs xs:text-sm p-1"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-white hover:text-cyan-200 transition p-1"
                                >
                                    <FaTimes className="text-base xs:text-lg" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Container */}
                        <div
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto p-3 xs:p-4 space-y-3 xs:space-y-4"
                        >
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] xs:max-w-[80%] rounded-2xl px-3 py-2 xs:px-4 xs:py-3 ${message.sender === 'user'
                                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-none'
                                                : 'bg-gray-700 text-gray-100 rounded-bl-none'
                                            }`}
                                    >
                                        <p className="text-xs xs:text-sm whitespace-pre-wrap break-words">{message.text}</p>
                                        {message.attachment && (
                                            <div className="mt-1 xs:mt-2 p-1 xs:p-2 bg-black bg-opacity-30 rounded-lg">
                                                <FaPaperclip className="inline mr-1 xs:mr-2 text-xs" />
                                                <span className="text-xs">{message.attachment.name}</span>
                                            </div>
                                        )}
                                        <p className="text-xs opacity-70 mt-1 xs:mt-1">
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-700 text-gray-100 rounded-2xl rounded-bl-none px-3 py-2 xs:px-4 xs:py-3">
                                        <div className="flex space-x-1 xs:space-x-2">
                                            <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        {messages.length <= 2 && (
                            <div className="px-3 xs:px-4 pb-2 xs:pb-3">
                                <p className="text-gray-400 text-xs xs:text-sm mb-1 xs:mb-2">Quick help:</p>
                                <div className="grid grid-cols-3 gap-1 xs:gap-2">
                                    {quickActions.map((action, index) => {
                                        const IconComponent = action.icon;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleQuickAction(action.query)}
                                                className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-1 xs:p-2 text-xs transition duration-200 flex flex-col items-center gap-0.5 xs:gap-1"
                                            >
                                                <IconComponent className="text-cyan-400 text-xs xs:text-sm" />
                                                <span className="text-[10px] xs:text-xs">{action.text}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {suggestions.length > 0 && messages.length > 1 && (
                            <div className="px-3 xs:px-4 pb-2 xs:pb-3">
                                <div className="flex flex-wrap gap-1 xs:gap-2">
                                    {suggestions.slice(0, 3).map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-300 rounded-full px-2 py-1 text-[10px] xs:text-xs transition duration-200 border border-cyan-700/30"
                                        >
                                            {suggestion.length > 20 ? suggestion.substring(0, 20) + '...' : suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="border-t border-gray-700 p-3 xs:p-4">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                {/* File Attachment Button */}
                                <label className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full w-10 h-10 xs:w-12 xs:h-12 flex items-center justify-center transition duration-300 cursor-pointer flex-shrink-0">
                                    <FaPaperclip className="text-xs xs:text-sm" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                    />
                                </label>

                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-gray-700 border border-gray-600 rounded-full px-3 xs:px-4 py-2 xs:py-3 text-white placeholder-gray-400 outline-none focus:border-cyan-500 transition duration-300 text-xs xs:text-sm"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !inputMessage.trim()}
                                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-full w-10 h-10 xs:w-12 xs:h-12 flex items-center justify-center transition duration-300 disabled:cursor-not-allowed flex-shrink-0"
                                >
                                    <FaPaperPlane className="text-xs xs:text-sm" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;