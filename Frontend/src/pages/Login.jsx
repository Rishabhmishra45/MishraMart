import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from "../assets/logo.png";
import google from "../assets/google.png";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { authDataContext } from '../context/AuthContext';
import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../utils/Firebase';
import { userDataContext } from '../context/UserContext';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    let { serverUrl } = useContext(authDataContext);
    let { getCurrentUser } = useContext(userDataContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(
                serverUrl + '/api/auth/login',
                { email, password },
                { withCredentials: true }
            );
            await getCurrentUser(); // ✅ ensure context updates
            navigate("/");          // ✅ redirect after update
        } catch (error) {
            if (error.response) {
                alert(error.response.data.message);
            } else {
                alert("Network error");
            }
        } finally {
            setLoading(false);
        }
    };

    const googlelogin = async () => {
        try {
            setLoading(true);
            const response = await signInWithPopup(auth, provider);
            const user = response.user;

            const name = user.displayName;
            const email = user.email;

            await axios.post(
                serverUrl + "/api/auth/googlelogin",
                { name, email },
                { withCredentials: true }
            );

            await getCurrentUser(); // ✅ update user in context
            navigate("/");
        } catch (error) {
            console.error("Google login error:", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] text-white flex flex-col">
            {/* Navbar / Logo */}
            <div className="w-full h-[70px] sm:h-[80px] flex items-center justify-start px-4 sm:px-8">
                <img
                    className="h-[120px] sm:h-[200px] w-auto object-contain cursor-pointer"
                    src={Logo}
                    alt="Logo"
                    onClick={() => !loading && navigate("/")}
                />
            </div>

            {/* Page Title */}
            <div className="w-full text-center mt-4 sm:mt-5 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold">Welcome Back</h1>
                <p className="text-gray-400 mt-2 text-sm sm:text-base">
                    Sign in to your MishraMart account
                </p>
            </div>

            {/* Login Box */}
            <div className="flex flex-1 items-center justify-center px-3 sm:px-4 py-6">
                <div className="w-full max-w-sm sm:max-w-md bg-[#00000025] border border-[#96969635] backdrop-blur-2xl rounded-xl shadow-lg p-6 sm:p-8">

                    {/* Google Button */}
                    <div
                        className={`w-full flex items-center justify-center gap-3 bg-[#42656cae] rounded-lg py-3 mb-6 transition 
                        ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#42656c] cursor-pointer"}`}
                        onClick={googlelogin}
                    >
                        <img src={google} alt="Google" className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded-full" />
                        <span className="font-medium text-white text-sm sm:text-base">
                            Sign in with Google
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center justify-center gap-2 text-gray-400 mb-6">
                        <div className="flex-1 h-[1px] bg-[#96969635]"></div>
                        <span className="text-xs sm:text-sm">OR</span>
                        <div className="flex-1 h-[1px] bg-[#96969635]"></div>
                    </div>

                    {/* Input Fields */}
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full h-11 sm:h-12 px-4 rounded-lg bg-[#ffffff15] border border-[#96969635] 
                            focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-400 text-sm sm:text-base"
                            required
                            value={email}
                            disabled={loading}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        {/* Password Field */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full h-11 sm:h-12 px-4 pr-10 rounded-lg bg-[#ffffff15] border border-[#96969635] 
                                focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-400 text-sm sm:text-base"
                                required
                                value={password}
                                disabled={loading}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                disabled={loading}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                                hover:text-white transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                            </button>
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right mt-1 sm:mt-2">
                            <span
                                className={`text-[#5555f6cf] text-xs sm:text-sm font-semibold ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:underline"}`}
                                onClick={() => !loading && navigate("/forgot-password")}
                            >
                                Forgot Password?
                            </span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-11 sm:h-12 rounded-lg text-white font-semibold mt-4 transition
                                ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-[#4aa4b5] hover:bg-[#3a8c9a]"}`}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                        {/* Registration Link */}
                        <p className="text-center text-gray-400 mt-2 text-xs sm:text-sm">
                            Don't have an account?{" "}
                            <span
                                className={`text-[#5555f6cf] font-semibold ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:underline"}`}
                                onClick={() => !loading && navigate("/signup")}
                            >
                                Create Account
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
