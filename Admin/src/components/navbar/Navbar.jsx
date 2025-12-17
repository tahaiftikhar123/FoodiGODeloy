// src/components/navbar/navbar.jsx

import React from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import './Navbar.css'; // 🎯 Import the CSS file

const Navbar = () => {

    // 🎯 Logout function
    const logout = () => {
        // 1. Remove the token
        localStorage.removeItem("adminToken");
        
        // 2. Display toast
        toast.success("Logged out successfully!");
        
        // 3. Force a reload to reset the state and show the login modal
        // Note: For simplicity and certainty of state reset, a full reload is best for logout.
        window.location.reload(); 
    }

    return (
        <div
            className="w-full flex items-center justify-between bg-white shadow-md navbar-custom"
            style={{ paddingTop: '18px', paddingBottom: '26px' }}
        >
            {/* Logo */}
            <img
                className="h-12 w-auto cursor-pointer hover:scale-105 transition-transform duration-300"
                src={assets.logo}
                alt="FoodiGO Logo"
            />

            {/* Profile Picture and Dropdown Container */}
            <div className="navbar-profile relative"> {/* Added relative for the dropdown position */}
                <img
                    className="h-10 w-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-300"
                    src={assets.profile_image}
                    alt="Profile"
                />
                
                {/* 🎯 The Logout Dropdown */}
                <ul className="nav-profile-dropdown absolute">
                    <li onClick={logout}>Logout</li> 
                </ul>
            </div>
        </div>
    );
};

export default Navbar;