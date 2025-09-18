import React, { use, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from "../assets/logo.png";
import google from "../assets/google.png";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { authDataContext } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    let { serverUrl } = useContext(authDataContext)

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await axios.post(serverUrl + '/api/auth/login', { email, password }, { withCredentials: true })
            console.log(result.data)
        } catch (error) {
            if (error.response) {
                alert(error.response.data.message)
            } else {
                alert("Network error")
            }
        }

        console.log('Logging in with:', { email, password });
    };

    return (
        <div className="w-screen h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] text-white flex flex-col">

            {/* Navbar / Logo */}
            <div className="w-full h-[80px] flex items-center justify-start px-8">
                <img
                    className="h-[200px] w-auto object-contain cursor-pointer"
                    src={Logo}
                    alt="Logo"
                    onClick={() => navigate("/")}
                />
            </div>

            {/* Page Title */}
            <div className="w-full text-center mt-5">
                <h1 className="text-3xl font-bold">Welcome Back</h1>
                <p className="text-gray-400 mt-2">Sign in to your MishraMart account</p>
            </div>

            {/* Login Box */}
            <div className="flex flex-1 items-center justify-center px-4 mt-0">
                <div className="max-w-md w-full bg-[#00000025] border border-[#96969635] backdrop-blur-2xl rounded-xl shadow-lg p-8">

                    {/* Google Button */}
                    <div
                        className="w-full flex items-center justify-center gap-3 bg-[#42656cae] hover:bg-[#42656c] rounded-lg py-3 cursor-pointer transition mb-6"
                    >
                        <img src={google} alt="Google" className="w-6 h-6 object-contain rounded-full" />
                        <span className="font-medium text-white">Sign in with Google</span>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center justify-center gap-2 text-gray-400 mb-6">
                        <div className="flex-1 h-[1px] bg-[#96969635]"></div>
                        <span className="text-sm">OR</span>
                        <div className="flex-1 h-[1px] bg-[#96969635]"></div>
                    </div>

                    {/* Input Fields */}
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full h-12 px-4 rounded-lg bg-[#ffffff15] border border-[#96969635] focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-400"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        {/* Password Field with Eye Icon */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full h-12 px-4 pr-10 rounded-lg bg-[#ffffff15] border border-[#96969635] focus:outline-none focus:border-[#4aa4b5] text-white placeholder-gray-400"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                            </button>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="text-right mt-2">
                            <span
                                className="text-[#5555f6cf] text-sm font-semibold cursor-pointer hover:underline"
                                onClick={() => navigate("/forgot-password")}
                            >
                                Forgot Password?
                            </span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full h-12 bg-[#4aa4b5] hover:bg-[#3a8c9a] rounded-lg text-white font-semibold mt-4 transition"
                        >
                            Sign In
                        </button>

                        {/* Registration Link */}
                        <p className="text-center text-gray-400 mt-2">
                            Don't have an account?{" "}
                            <span
                                className="text-[#5555f6cf] font-semibold cursor-pointer hover:underline"
                                onClick={() => navigate("/signup")}
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