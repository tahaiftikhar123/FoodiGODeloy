// src/components/ListSchedules/ListSchedules.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaClock, FaCalendarAlt, FaToggleOn, FaToggleOff, FaTrash } from 'react-icons/fa';
import './ListSchedules.css'; // Theme Import

const ListSchedules = ({ url, token }) => { 
    // ... (state, formatReadableDate, getDeliveryStatus, and API functions remain unchanged) ...
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatReadableDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getDeliveryStatus = (deliveryTimestamp, isActive) => {
        if (!isActive) {
            return { text: "Paused", color: "text-gray-500 bg-gray-100" };
        }
        
        const deliveryTime = new Date(deliveryTimestamp).getTime();
        const now = Date.now();
        const diffMs = deliveryTime - now;
        
        if (diffMs < 0) {
            return { text: "Completed", color: "text-green-600 bg-green-100" }; 
        }

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours >= 24) {
             return { text: "Scheduled", color: "text-blue-600 bg-blue-100" };
        } else if (diffHours >= 1) {
            return { text: "Upcoming", color: "text-yellow-700 bg-yellow-100" };
        } else {
             return { text: "DUE NOW", color: "text-red-700 bg-red-100 font-bold" };
        }
    };

    const fetchAllSchedules = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await axios.get(`${url}/api/schedule/adminlist`, {
                headers: { token },
            });
            
            if (response.data.success) {
                setSchedules(response.data.data);
            } else {
                toast.error("Failed to fetch schedules: " + response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error fetching schedules.");
        } finally {
            setLoading(false);
        }
    };

    const toggleActiveStatus = async (scheduleId, currentStatus) => {
        if (!scheduleId) return toast.error("Invalid schedule ID.");
        try {
            const response = await axios.put(
                `${url}/api/schedule/admin/toggle/${scheduleId}`, 
                { isActive: !currentStatus },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success(response.data.message);
                await fetchAllSchedules();
            } else {
                toast.error("Failed to update status: " + response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update schedule status.");
        }
    };

    const deleteSchedule = async (scheduleId) => {
        if (!window.confirm("Are you sure you want to permanently delete this schedule?")) {
            return;
        }
        try {
            const response = await axios.delete(`${url}/api/schedule/admin/delete/${scheduleId}`, { headers: { token } });
            if (response.data.success) {
                toast.success("Schedule deleted successfully.");
                fetchAllSchedules(); 
            } else {
                toast.error(response.data.message || "Failed to delete schedule.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred while deleting.");
        }
    };

    useEffect(() => {
        if (token) {
            fetchAllSchedules();
        }
    }, [token, url]); 

    return (
        <div className="list-schedules-table-container p-4 md:p-8">
            <h2 className="list-schedules-title text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3 border-b-2 pb-2 border-orange-500">
                <FaClock className="text-orange-500" /> All Scheduled Orders
            </h2>
            
            {loading ? (
                <div className="text-center p-10 text-xl text-gray-500">Loading schedules...</div>
            ) : schedules.length === 0 ? (
                <div className="text-center p-10 text-xl text-gray-500 bg-white rounded-lg shadow">No active or past scheduled orders found.</div>
            ) : (
                <div className="overflow-x-auto bg-white shadow-xl rounded-xl">
                    <table className="list-schedules-table divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer / ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Details</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Items / Total</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Address</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {schedules.map((schedule) => {
                                const status = getDeliveryStatus(schedule.deliveryTimestamp, schedule.isActive);
                                const deliveryAddress = schedule.address 
                                    ? `${schedule.address.street}, ${schedule.address.city}, ${schedule.address.state}, ${schedule.address.zipcode}`
                                    : "Address Not Available";

                                return (
                                    <tr key={schedule._id} className="hover:bg-orange-50/50 transition duration-150">
                                        
                                        {/* Customer / ID */}
                                        <td className="px-6 py-4 whitespace-nowrap schedule-cell-content">
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{schedule.user?.name || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">ID: {schedule._id.slice(-6)}</div>
                                        </td>
                                        
                                        {/* Delivery Details */}
                                        <td className="px-6 py-4 whitespace-nowrap schedule-cell-content">
                                            <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                                <FaCalendarAlt className="text-orange-500 w-3 h-3"/> {formatReadableDate(schedule.deliveryTimestamp)}
                                            </div>
                                            <div className="text-xs text-gray-500 capitalize">{schedule.recurrenceRule || "One-Time"}</div>
                                        </td>

                                        {/* Items / Total */}
                                        <td className="px-6 py-4 whitespace-nowrap schedule-cell-content">
                                            <div className="text-sm text-gray-900 font-bold">${schedule.amount?.toFixed(2) || '0.00'}</div>
                                            <div className="text-xs text-gray-500">{schedule.items?.length} different item(s)</div>
                                        </td>
                                        
                                        {/* Address */}
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs whitespace-normal schedule-cell-content">
                                            {deliveryAddress}
                                        </td>
                                        
                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap schedule-cell-content">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                                {status.text}
                                            </span>
                                        </td>

                                        {/* Actions - Increased spacing to space-x-3 */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3"> 
                                            <button 
                                                className={`action-button p-2 rounded-full transition duration-150 ${schedule.isActive ? 'text-red-600 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'}`}
                                                onClick={() => toggleActiveStatus(schedule._id, schedule.isActive)}
                                                title={schedule.isActive ? "Pause Schedule" : "Activate Schedule"}
                                            >
                                                {schedule.isActive ? <FaToggleOn className="w-5 h-5"/> : <FaToggleOff className="w-5 h-5"/>}
                                            </button>
                                            <button 
                                                className="action-button p-2 rounded-full text-gray-400 hover:text-red-700 hover:bg-red-100 transition duration-150"
                                                onClick={() => deleteSchedule(schedule._id)}
                                                title="Delete Schedule"
                                            >
                                                <FaTrash className="w-5 h-5"/>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ListSchedules;