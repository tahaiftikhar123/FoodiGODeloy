// src/pages/Orders/Orders.jsx (Notification/Polling Added)

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify"; // Ensure you have this import
import axios from "axios";
import { FaPhoneAlt } from "react-icons/fa";
import "./Orders.css"; 

export const Orders = ({ url }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false); 
    const [newOrderCount, setNewOrderCount] = useState(0); // 🎯 New State

    // Helper function to mark an order as seen (isNew: false)
    const markOrderAsSeen = async (orderId) => {
        // ... (Keep the existing markOrderAsSeen function unchanged) ...
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) return;

        try {
            await axios.post(url + "/api/order/markseen", { orderId }, {
                headers: { token: adminToken }
            });

            setOrders(prevOrders => prevOrders.map(order => 
                order._id === orderId ? { ...order, isNew: false } : order
            ));
            
            // 🎯 Action: Decrement the new order count when one is marked seen
            setNewOrderCount(prevCount => Math.max(0, prevCount - 1));

        } catch (error) {
            console.error("Error marking order as seen:", error);
        }
    };

    // ✅ New Function: Poll backend for unseen orders count
    const fetchNewOrdersCount = async () => {
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) return;

        try {
            // NOTE: Using a GET request here for simplicity as the route is defined as GET
            const response = await axios.get(url + "/api/order/newcount");
            
            if (response.data.success) {
                const count = response.data.count;
                setNewOrderCount(count);

                // 🎯 Toast Notification Logic
                if (count > 0) {
                    toast.info(`🔔 You have ${count} new order${count > 1 ? 's' : ''} to review!`, {
                        position: "top-center",
                        autoClose: false, // Make it persistent until the user reviews them
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        // Unique ID to prevent duplicate toast messages if the count is the same
                        toastId: "newOrdersNotification" 
                    });
                } else {
                    // Close the persistent toast if the count drops to zero
                    toast.dismiss("newOrdersNotification");
                }
            }
        } catch (error) {
            console.error("Error fetching new orders count:", error);
        }
    };


    // ✅ Fetch All Orders (Keep existing logic)
    const fetchAllOrders = async () => {
        setLoading(true); 
        const adminToken = localStorage.getItem("adminToken");
        
        if (!adminToken) {
            toast.error("Admin session expired. Please re-login.");
            setLoading(false);
            return;
        }
        
        try {
            const response = await axios.post(url + "/api/order/list", {}, {
                headers: { token: adminToken }
            });
            
            if (response.data.success) {
                setOrders(response.data.data);
            } else {
                toast.error("Error fetching orders");
            }
        } catch (error) {
            console.error("Fetch orders error:", error);
            toast.error("Server error while fetching orders");
        } finally {
            setLoading(false); 
        }
    };

    
    const handleStatusChange = async (orderId, newStatus) => {
        // ... (Keep the existing handleStatusChange function unchanged) ...
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) {
            toast.error("Admin session expired. Please re-login.");
            return;
        }

        try {
            const response = await axios.post(url + "/api/order/status", {
                orderId,
                status: newStatus,
            }, {
                headers: { token: adminToken }
            });

            if (response.data.success) {
                toast.success("Order status updated!");
                
                // Update UI instantly
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === orderId ? { ...order, status: newStatus } : order
                    )
                );
                
                // 🎯 Action: Mark as seen upon status change
                markOrderAsSeen(orderId);

            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            console.error("Update status error:", error);
            toast.error("Server error while updating status");
        }
    };

    // 🎯 Action: Mark as seen when an order row is clicked
    const handleOrderClick = (orderId, isNew) => {
        if (isNew) {
            markOrderAsSeen(orderId);
        }
    }


    useEffect(() => {
        fetchAllOrders();
        
        // 🎯 Set up polling for new orders every 10 seconds
        fetchNewOrdersCount(); // Initial check
        const intervalId = setInterval(fetchNewOrdersCount, 10000); 

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId); 
    }, []); 

    return (
        <div className="order-page">
            <h3 className="page-title">
                Order Management 
                {/* 🎯 Optional: Display count near title */}
                {newOrderCount > 0 && (
                    <span className="new-order-badge">{newOrderCount} New</span>
                )}
            </h3>

            {/* ... rest of the JSX (table, data, etc.) remains the same ... */}
            <div className="order-table-container">
                <table className="order-table">
                    <thead>
                        <tr className="table-header-row">
                            <th className="header-cell">Items</th>
                            <th className="header-cell">Customer</th>
                            <th className="header-cell">Address</th>
                            <th className="header-cell centered-cell">Qty</th>
                            <th className="header-cell centered-cell">Price</th>
                            <th className="header-cell centered-cell">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr className="loading-row">
                                <td colSpan="6" className="loading-message">Fetching orders...</td>
                            </tr>
                        ) : (
                            orders.map((order, index) => (
                                <tr
                                    key={index}
                                    className={`table-data-row ${order.isNew ? 'new-order-highlight' : ''}`}
                                    onClick={() => handleOrderClick(order._id, order.isNew)} 
                                >
                                    {/* ... Order data cells here ... */}
                                    <td className="data-cell items-cell">
                                        {order.items.map((item, i) =>
                                            i === order.items.length - 1
                                                ? `${item.name} x ${item.quantity}`
                                                : `${item.name} x ${item.quantity}, `
                                        )}
                                    </td>
                                    <td className="data-cell customer-cell">
                                        <p className="customer-name">
                                            {order.address.firstName} {order.address.lastName}
                                        </p>
                                        <p className="customer-phone">
                                            <FaPhoneAlt className="phone-icon" />
                                            {order.address.phone}
                                        </p>
                                    </td>
                                    <td className="data-cell address-cell">
                                        {order.address.street}, {order.address.city},{" "}
                                        {order.address.state}, {order.address.country} -{" "}
                                        <span className="address-zip">{order.address.zip}</span>
                                    </td>
                                    <td className="data-cell centered-cell">
                                        {order.items.length}
                                    </td>
                                    <td className="data-cell price-cell centered-cell">
                                        ${order.amount ? order.amount.toFixed(2) : 'N/A'}
                                    </td>
                                    <td className="data-cell status-cell centered-cell">
                                        <select
                                            value={order.status}
                                            onChange={(e) =>
                                                handleStatusChange(order._id, e.target.value)
                                            }
                                            className={`status-select status-${order.status.replace(/\s/g, '-')}`}
                                            onClick={(e) => e.stopPropagation()} 
                                        >
                                            <option value="Food Processing">Food Processing</option>
                                            <option value="Out for delivery">Out for delivery</option>
                                            <option value="Delivered">Delivered</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                        {!loading && orders.length === 0 && (
                            <tr className="no-orders-row">
                                <td colSpan="6" className="no-orders-message">No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders;