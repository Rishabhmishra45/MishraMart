import React, { useState, useContext, useEffect } from 'react';
import { userDataContext } from '../context/UserContext';
import { authDataContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    FaUser, 
    FaEnvelope, 
    FaPhone, 
    FaMapMarkerAlt, 
    FaEdit, 
    FaSave, 
    FaTimes,
    FaShoppingBag,
    FaBox,
    FaTruck,
    FaCheckCircle,
    FaClock,
    FaArrowLeft,
    FaCamera,
    FaTrash
} from 'react-icons/fa';
import axios from 'axios';

const Profile = () => {
    const { userData, setUserData } = useContext(userDataContext);
    const { serverUrl } = useContext(authDataContext);
    const navigate = useNavigate();
    
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userOrders, setUserOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);

    // Initialize form data and profile image when userData changes
    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                address: userData.address || '',
                city: userData.city || '',
                state: userData.state || '',
                pincode: userData.pincode || ''
            });

            // Load profile image from localStorage
            const savedImage = localStorage.getItem(`userProfileImage_${userData.id}`);
            if (savedImage) {
                setProfileImage(savedImage);
                setImagePreview(savedImage);
            }
        }
    }, [userData]);

    // Fetch user orders
    useEffect(() => {
        if (userData && activeTab === 'orders') {
            fetchUserOrders();
        }
    }, [userData, activeTab]);

    const fetchUserOrders = async () => {
        try {
            const response = await axios.get(`${serverUrl}/api/orders/my-orders`, {
                withCredentials: true,
                timeout: 10000
            });
            
            if (response.data.success) {
                setUserOrders(response.data.orders || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveProfile = async () => {
        try {
            setIsLoading(true);
            
            // Basic validation
            if (!formData.name.trim()) {
                alert('Name is required');
                return;
            }

            const response = await axios.put(
                `${serverUrl}/api/user/update-profile`,
                {
                    name: formData.name.trim(),
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode
                },
                { 
                    withCredentials: true,
                    timeout: 10000
                }
            );

            if (response.data.success) {
                setUserData(response.data.user);
                setIsEditing(false);
                alert('Profile updated successfully!');
            } else {
                throw new Error(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(`Failed to update profile: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            city: userData.city || '',
            state: userData.state || '',
            pincode: userData.pincode || ''
        });
        setIsEditing(false);
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file (JPEG, PNG, etc.)');
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            setSelectedImage(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = async () => {
        if (!selectedImage && !imagePreview) {
            alert('Please select an image first');
            return;
        }

        try {
            setIsImageLoading(true);
            
            // Save to localStorage and trigger storage event
            if (userData) {
                localStorage.setItem(`userProfileImage_${userData.id}`, imagePreview);
                setProfileImage(imagePreview);
                
                // Trigger storage event to update navbar in real-time
                window.dispatchEvent(new Event('storage'));
                
                alert('Profile image updated successfully!');
                setIsImageUploadOpen(false);
                setSelectedImage(null);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setIsImageLoading(false);
        }
    };

    const removeProfileImage = () => {
        if (userData) {
            localStorage.removeItem(`userProfileImage_${userData.id}`);
            setProfileImage(null);
            setImagePreview(null);
            setSelectedImage(null);
            
            // Trigger storage event to update navbar in real-time
            window.dispatchEvent(new Event('storage'));
            
            alert('Profile image removed');
        }
    };

    const triggerFileInput = () => {
        document.getElementById('profileImageInput')?.click();
    };

    const openImageUpload = () => {
        setImagePreview(profileImage);
        setSelectedImage(null);
        setIsImageUploadOpen(true);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <FaCheckCircle className="text-green-400" />;
            case 'shipped':
                return <FaTruck className="text-blue-400" />;
            case 'processing':
                return <FaBox className="text-yellow-400" />;
            default:
                return <FaClock className="text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-500/20 text-green-400 border-green-400/30';
            case 'shipped':
                return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
            case 'processing':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getProductImage = (item) => {
        const productImages = item.productId?.images || [];
        const productImage1 = item.productId?.image1;
        return productImages[0] || productImage1 || 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
    };

    if (!userData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-[70px] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-cyan-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Image Upload Modal */}
            {isImageUploadOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-white">Update Profile Image</h3>
                        
                        <div className="flex flex-col items-center mb-6">
                            {imagePreview ? (
                                <div className="relative mb-4">
                                    <img 
                                        src={imagePreview} 
                                        alt="Profile Preview" 
                                        className="w-32 h-32 rounded-full object-cover border-4 border-cyan-400 shadow-lg"
                                    />
                                    <button
                                        onClick={triggerFileInput}
                                        className="absolute bottom-2 right-2 bg-cyan-500 text-white rounded-full p-2 hover:bg-cyan-600 transition duration-300"
                                    >
                                        <FaCamera size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer border-4 border-dashed border-gray-500 hover:border-cyan-400 transition duration-300 mb-4"
                                    onClick={triggerFileInput}
                                >
                                    <FaCamera className="text-gray-400 text-3xl" />
                                </div>
                            )}
                            
                            <input
                                type="file"
                                id="profileImageInput"
                                onChange={handleImageSelect}
                                accept="image/*"
                                className="hidden"
                            />
                            
                            <button
                                onClick={triggerFileInput}
                                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition duration-300"
                            >
                                {imagePreview ? 'Change Image' : 'Select Image'}
                            </button>
                        </div>

                        <div className="flex justify-between gap-3">
                            <button
                                onClick={() => {
                                    setIsImageUploadOpen(false);
                                    setSelectedImage(null);
                                    setImagePreview(profileImage);
                                }}
                                className="flex-1 px-4 py-3 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition duration-300 flex items-center justify-center gap-2"
                            >
                                <FaTimes />
                                Cancel
                            </button>
                            
                            <div className="flex gap-2">
                                {imagePreview && (
                                    <button
                                        onClick={removeProfileImage}
                                        className="px-4 py-3 text-red-400 border border-red-600 rounded-lg hover:bg-red-900/20 transition duration-300 flex items-center gap-2"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                                
                                <button
                                    onClick={handleImageUpload}
                                    disabled={isImageLoading || (!selectedImage && !profileImage)}
                                    className="flex-1 px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition duration-300 flex items-center justify-center gap-2"
                                >
                                    {isImageLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave />
                                            Save
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-[70px]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    
                    {/* Header with Back Button */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Profile</h1>
                            <p className="text-gray-400">Manage your account and track orders</p>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
                        >
                            <FaArrowLeft />
                            Back
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-700 mb-8 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-6 py-3 font-medium transition duration-300 border-b-2 whitespace-nowrap ${
                                activeTab === 'profile'
                                    ? 'border-cyan-400 text-cyan-400'
                                    : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                        >
                            <FaUser className="inline mr-2 mb-1" />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-6 py-3 font-medium transition duration-300 border-b-2 whitespace-nowrap ${
                                activeTab === 'orders'
                                    ? 'border-cyan-400 text-cyan-400'
                                    : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                        >
                            <FaShoppingBag className="inline mr-2 mb-1" />
                            My Orders ({userOrders.length})
                        </button>
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                            {/* Profile Header with Image */}
                            <div className="flex flex-col lg:flex-row items-center gap-6 mb-8">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-cyan-400 shadow-lg">
                                        {profileImage ? (
                                            <img 
                                                src={profileImage} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                                {userData.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={openImageUpload}
                                        className="absolute bottom-0 right-0 bg-cyan-500 text-white rounded-full p-2 hover:bg-cyan-600 transition duration-300 shadow-lg"
                                    >
                                        <FaCamera size={14} />
                                    </button>
                                </div>
                                <div className="text-center lg:text-left flex-1">
                                    <h2 className="text-2xl font-bold mb-2">{userData.name}</h2>
                                    <p className="text-gray-400 mb-1">{userData.email}</p>
                                    <p className="text-gray-400">{userData.phone || 'No phone number'}</p>
                                    <button
                                        onClick={openImageUpload}
                                        className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition duration-300 flex items-center gap-2 justify-center lg:justify-start"
                                    >
                                        <FaCamera />
                                        {profileImage ? 'Change Photo' : 'Add Profile Photo'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                                <h2 className="text-2xl font-bold">Personal Information</h2>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
                                    >
                                        <FaEdit />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isLoading}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-800 text-white rounded-lg transition duration-300 flex items-center gap-2 flex-1 sm:flex-none justify-center"
                                        >
                                            <FaSave />
                                            {isLoading ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition duration-300 flex items-center gap-2 flex-1 sm:flex-none justify-center"
                                        >
                                            <FaTimes />
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Personal Info */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            <FaUser className="inline mr-2 text-cyan-400" />
                                            Full Name *
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        ) : (
                                            <p className="px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white">
                                                {userData.name || 'Not provided'}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            <FaEnvelope className="inline mr-2 text-cyan-400" />
                                            Email Address
                                        </label>
                                        <p className="px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white opacity-80">
                                            {userData.email}
                                        </p>
                                        <p className="text-gray-400 text-xs mt-1">Email cannot be changed</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            <FaPhone className="inline mr-2 text-cyan-400" />
                                            Phone Number
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+91 1234567890"
                                                className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                                            />
                                        ) : (
                                            <p className="px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white">
                                                {userData.phone || 'Not provided'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Address Info */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            <FaMapMarkerAlt className="inline mr-2 text-cyan-400" />
                                            Address
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows="3"
                                                placeholder="Enter your complete address (House No., Street, Area)"
                                                className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300 resize-none"
                                            />
                                        ) : (
                                            <p className="px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white min-h-[80px]">
                                                {userData.address || 'Not provided'}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                City
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter city"
                                                    className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                                                />
                                            ) : (
                                                <p className="px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white">
                                                    {userData.city || 'Not provided'}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                State
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter state"
                                                    className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                                                />
                                            ) : (
                                                <p className="px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white">
                                                    {userData.state || 'Not provided'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            PIN Code
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleInputChange}
                                                placeholder="Enter PIN code"
                                                className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                                            />
                                        ) : (
                                            <p className="px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white">
                                                {userData.pincode || 'Not provided'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Account Stats */}
                            <div className="mt-8 pt-6 border-t border-gray-700">
                                <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-[#141414] p-4 rounded-lg border border-gray-600 text-center">
                                        <div className="text-2xl font-bold text-cyan-400">{userOrders.length}</div>
                                        <div className="text-gray-400 text-sm">Total Orders</div>
                                    </div>
                                    <div className="bg-[#141414] p-4 rounded-lg border border-gray-600 text-center">
                                        <div className="text-2xl font-bold text-green-400">
                                            {userOrders.filter(order => order.status === 'delivered').length}
                                        </div>
                                        <div className="text-gray-400 text-sm">Delivered</div>
                                    </div>
                                    <div className="bg-[#141414] p-4 rounded-lg border border-gray-600 text-center">
                                        <div className="text-2xl font-bold text-blue-400">
                                            {userOrders.filter(order => order.status === 'shipped').length}
                                        </div>
                                        <div className="text-gray-400 text-sm">Shipped</div>
                                    </div>
                                    <div className="bg-[#141414] p-4 rounded-lg border border-gray-600 text-center">
                                        <div className="text-2xl font-bold text-yellow-400">
                                            {userOrders.filter(order => order.status === 'processing').length}
                                        </div>
                                        <div className="text-gray-400 text-sm">Processing</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            {userOrders.length === 0 ? (
                                <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-12 text-center shadow-2xl shadow-blue-900/20">
                                    <FaShoppingBag className="text-6xl text-gray-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
                                    <p className="text-gray-400 mb-6">
                                        You haven't placed any orders yet. Start shopping to see your orders here.
                                    </p>
                                    <button
                                        onClick={() => navigate('/collections')}
                                        className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition duration-300"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                userOrders.map((order) => (
                                    <div key={order._id} className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                                        {/* Order Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-white">
                                                        Order #{order.orderId}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} flex items-center gap-1`}>
                                                        {getStatusIcon(order.status)}
                                                        {order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-sm">
                                                    Placed on {formatDate(order.createdAt)}
                                                </p>
                                                {order.deliveredAt && order.status === 'delivered' && (
                                                    <p className="text-green-400 text-sm">
                                                        Delivered on {formatDate(order.deliveredAt)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="mt-2 sm:mt-0">
                                                <span className="text-xl font-bold text-cyan-400">
                                                    ₹ {order.totalAmount?.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Order Items Preview */}
                                        <div className="mb-6">
                                            <div className="flex gap-4 overflow-x-auto pb-2">
                                                {order.items?.map((item, index) => (
                                                    <div key={item._id || index} className="flex-shrink-0 w-16 h-16 bg-gray-800 rounded-lg overflow-hidden">
                                                        <img
                                                            src={getProductImage(item)}
                                                            alt={item.productId?.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.src = 'https://images.unsplash.com/photo-1560769684-5507c64551f9?w=150';
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-gray-400 text-sm mt-2">
                                                {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>

                                        {/* Order Actions */}
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => navigate('/orders')}
                                                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm"
                                            >
                                                View Details
                                            </button>
                                            
                                            {order.status === 'delivered' && (
                                                <button
                                                    onClick={() => navigate('/orders')}
                                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-300 flex items-center gap-2 text-sm"
                                                >
                                                    Download Invoice
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Profile;