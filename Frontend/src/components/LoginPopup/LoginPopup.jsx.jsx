// src/components/LoginPopup/LoginPopup.jsx
import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/storecontext";
import axios from "axios";
import { toast } from 'react-toastify'; // 🔥 FIX: Import toast

const LoginPopup = ({ setshowlogin }) => {
    const { url, setToken } = useContext(StoreContext); 
    const [currentstate, setcurrentstate] = useState("Login");
    const [data, setData] = useState({
        name: "", email: "", password: "",
    });

    const onchangeHandler = (event) => {
        const { name, value } = event.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const onlogin = async (event) => {
        event.preventDefault();

        let newUrl = url + (currentstate === "Login" ? "/api/user/login" : "/api/user/register");

        try {
            const response = await axios.post(newUrl, data);

            if (response.data.success) {
                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);
                setshowlogin(false);
                
                // 🚀 FIX: Show success notification
                toast.success(`${currentstate} successful!`); 
            } else {
                // 🚀 FIX: Show error notification
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <form
                onSubmit={onlogin}
                className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-md relative"
            >
                {/* Header with close button */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-orange-500">{currentstate}</h2>
                    <button
                        type="button"
                        onClick={() => setshowlogin(false)}
                        className="p-1 rounded-full hover:bg-gray-100 transition"
                    >
                         <img src={assets.cross_icon} alt="Close" className="w-6 h-6 cursor-pointer hover:rotate-90 transition-transform"/>
                    </button>
                </div>

                {/* Inputs */}
                <div className="flex flex-col gap-3 mb-4">
                    {currentstate === "Sign Up" && (
                        <input name="name" onChange={onchangeHandler} value={data.name} type="text" placeholder="Your Name" required className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                    )}
                    <input name="email" onChange={onchangeHandler} value={data.email} type="email" placeholder="Your Email" required className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                    <input name="password" onChange={onchangeHandler} value={data.password} type="password" placeholder="Password" required className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                </div>

                {/* Button */}
                <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition">
                    {currentstate === "Sign Up" ? "Create Account" : "Login"}
                </button>

                {/* Terms and Toggle */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                    <input type="checkbox" required className="w-4 h-4" />
                    <p>By continuing, you agree to our Terms & Privacy Policy.</p>
                </div>

                {currentstate === "Login" ? (
                    <p className="text-sm mt-4 text-gray-700">
                        Don’t have an account?{" "}
                        <span onClick={() => setcurrentstate("Sign Up")} className="!text-orange-500 font-semibold cursor-pointer hover:underline">
                            Sign up here
                        </span>
                    </p>
                ) : (
                    <p className="text-sm mt-4 text-gray-700">
                        Already have an account?{" "}
                        <span onClick={() => setcurrentstate("Login")} className="!text-orange-500 font-semibold cursor-pointer hover:underline">
                            Login here
                        </span>
                    </p>
                )}
            </form>
        </div>
    );
};

export default LoginPopup;