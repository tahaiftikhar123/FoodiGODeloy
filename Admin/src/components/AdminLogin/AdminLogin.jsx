// src/components/AdminLogin/AdminLogin.jsx (COMPLETE FIX)

import React, { useState } from 'react';
import './AdminLogin.css'; 
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminLogin = ({ setshowLogin, url }) => {
    const [data, setData] = useState({
        email: "",
        password: ""
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };

    const onLogin = async (event) => {
        event.preventDefault();
        
        const newUrl = `${url}/api/user/admin_login`; 

        try {
            const response = await axios.post(newUrl, data);

            if (response.data.success) {
                // 1. Store the token immediately
                localStorage.setItem("adminToken", response.data.token);
                
                // 2. Show success toast
                toast.success("Admin Logged In Successfully!");
                
                // 3. Close the modal, allowing App.jsx to detect the new token and re-render
                setshowLogin(false); 
                
                // ❌ IMPORTANT: We REMOVE window.location.reload(); 
                
            } else {
                // FAILURE: Show error message from backend
                toast.error(response.data.message || "Login failed. Invalid credentials.");
            }
        } catch (error) {
            console.error("Admin Login Error:", error);
            // Display a general error if the server is unreachable
            toast.error("Failed to connect to server or request failed.");
        }
    };

    return (
        <div className='admin-login-popup'> 
            <form onSubmit={onLogin} className="admin-login-container">
                <div className="admin-login-title">
                    <h2>Admin Panel Login</h2>
                    <img onClick={() => setshowLogin(false)} src={assets.cross_icon} alt="Close" />
                </div>
                <div className="admin-login-inputs">
                    <input 
                        name='email' 
                        onChange={onChangeHandler} 
                        value={data.email} 
                        type="email" 
                        placeholder='Your email' 
                        required 
                    />
                    <input 
                        name='password' 
                        onChange={onChangeHandler} 
                        value={data.password} 
                        type="password" 
                        placeholder='Password' 
                        required 
                    />
                </div>
                <button type='submit'>Login</button>
            </form>
        </div>
    );
};

export default AdminLogin;