import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../context/storecontext";
import { toast } from "react-toastify";
// 1. Import the new icon
import { FaBoxesStacked } from 'react-icons/fa6'; 

// Function to generate a stable color class based on the item name/ID (optional, but helpful)
const getItemColor = (name) => {
    // Simple hash function to generate a color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Using a more vibrant set of colors
    const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-600", "bg-purple-600", "bg-pink-500", "bg-indigo-600"];
    return colors[Math.abs(hash) % colors.length];
};

export const MySchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const { url, token, food_list } = useContext(StoreContext); 

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);

    // --- Helper Functions ---
    
    // Removed getFoodImage as it's no longer needed for rendering item icons.

    const getItemDetails = (item) => {
        const food = food_list.find(f => f._id === item.foodId);
        return {
            name: food ? food.name : item.name, 
            // We only need the name/price now, the image field is gone
            price: food ? food.price : item.price,
        };
    };

    const formatReadableDate = (dateString) => {
        if (!dateString) return "Invalid date";
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getDeliveryStatus = (deliveryTimestamp) => {
        const deliveryTime = new Date(deliveryTimestamp).getTime();
        const now = Date.now();
        const diffMs = deliveryTime - now;
        
        if (diffMs <= 0) {
            return { status: "Delivered", color: "text-gray-500" }; 
        }

        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours >= 24) {
             return { status: `Next Delivery: ${formatReadableDate(deliveryTimestamp)}`, color: "text-blue-600" };
        } else if (diffHours >= 1) {
            const remainingHours = diffHours;
            const remainingMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            return { status: `Delivering in ${remainingHours} hr ${remainingMins} min`, color: "text-green-600" };
        } else if (diffMinutes > 0) {
            return { status: `Delivering in ${diffMinutes} minutes`, color: "text-red-500 font-bold" };
        } else {
             return { status: "Delivering now...", color: "text-orange-500 font-bold" };
        }
    };


    // --- API Calls (Unchanged) ---

    const fetchSchedules = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${url}/api/schedule/list`, {
                headers: { token },
            });
            if (response.data.success) {
                setSchedules(response.data.data);
            } else {
                toast.error("Failed to fetch schedules: " + response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error fetching schedules.");
        }
    };

    const toggleActiveStatus = async (scheduleId, currentStatus) => {
        if (!scheduleId) return toast.error("Invalid schedule ID.");
        try {
            const response = await axios.put(
                `${url}/api/schedule/toggle/${scheduleId}`,
                { isActive: !currentStatus },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success(response.data.message);
                await fetchSchedules();
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
            const response = await axios.delete(`${url}/api/schedule/delete/${scheduleId}`, { headers: { token } });
            if (response.data.success) {
                toast.success("Schedule deleted successfully.");
                fetchSchedules(); 
            } else {
                toast.error(response.data.message || "Failed to delete schedule.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred while deleting.");
        }
    };

    const handleUpdateSchedule = async (e) => {
        e.preventDefault();
        
        const { _id, deliveryTimestamp, recurrenceRule, updateCutoffHours } = editingSchedule;
        
        const updatedItems = editingSchedule.items
            .filter(item => item.quantity > 0)
            .map(item => ({
                foodId: item.foodId,
                name: getItemDetails(item).name, 
                quantity: item.quantity,
                price: getItemDetails(item).price, 
            }));

        if (updatedItems.length === 0) {
            toast.error("A schedule must contain at least one item.");
            return;
        }
        
        const newDeliveryTime = new Date(deliveryTimestamp);
        const now = new Date();
        const hoursUntilDelivery = (newDeliveryTime - now) / (1000 * 60 * 60);

        const cutoff = updateCutoffHours || 2; 

        if (hoursUntilDelivery < cutoff) {
            toast.error(`Cannot update schedule within ${cutoff} hours of delivery.`);
            return;
        }

        try {
            const payload = {
                deliveryTimestamp,
                recurrenceRule,
                items: updatedItems, 
            };
            
            const response = await axios.put(`${url}/api/schedule/update/${_id}`, payload, { headers: { token } });
            if (response.data.success) {
                toast.success("Schedule updated successfully!");
                setIsEditModalOpen(false);
                setEditingSchedule(null);
                fetchSchedules();
            } else {
                 toast.error(response.data.message || "Failed to update schedule.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred during update.");
        }
    };

    // --- State and Modal Handlers (Unchanged) ---

    const openEditModal = (schedule) => {
        const date = new Date(schedule.deliveryTimestamp);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        setEditingSchedule({
            ...schedule,
            deliveryDate: `${yyyy}-${mm}-${dd}`,
            deliveryTime: `${hh}:${min}`,
        });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        let newTimestamp = editingSchedule.deliveryTimestamp;

        if (name === "deliveryDate" || name === "deliveryTime") {
            const newDate = name === "deliveryDate" ? value : editingSchedule.deliveryDate;
            const newTime = name === "deliveryTime" ? value : editingSchedule.deliveryTime;
            newTimestamp = new Date(`${newDate}T${newTime}`).toISOString();
        }

        setEditingSchedule(prev => ({
            ...prev,
            [name]: value,
            deliveryTimestamp: newTimestamp,
            recurrenceRule: name === 'recurrenceRule' ? value : prev.recurrenceRule
        }));
    };
    
    const handleItemQuantityChange = (itemId, change) => {
        setEditingSchedule(prev => {
            if (!prev || !prev.items) return prev; 
            
            const updatedItems = prev.items.map(item => {
                if (item.foodId === itemId) {
                    const newQuantity = Math.max(0, item.quantity + change); 
                    return { ...item, quantity: newQuantity }; 
                }
                return item; 
            });

            return {
                ...prev,
                items: updatedItems,
                _lastUpdated: Date.now()
            };
        });
    };
    
    const handleAddNewItem = (foodId) => {
        const food = food_list.find(item => item._id === foodId);
        if (!food) return;

        setEditingSchedule(prev => {
            if (!prev || !prev.items) return prev; 

            const existingItemIndex = prev.items.findIndex(item => item.foodId === foodId);
            
            if (existingItemIndex !== -1) {
                const updatedItems = prev.items.map((item, index) => 
                    index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
                );
                 return {
                    ...prev,
                    items: updatedItems,
                    _lastUpdated: Date.now()
                };
            } else {
                const newItem = {
                    foodId: food._id,
                    name: food.name,
                    quantity: 1,
                    price: food.price
                };
                return {
                    ...prev,
                    items: [...prev.items, newItem], 
                    _lastUpdated: Date.now()
                };
            }
        });
    };

    // --- Effects and Synchronization ---

    // 1. Fetch schedules on token availability (initial load)
    useEffect(() => {
        if (token) {
            fetchSchedules();
        }

        const intervalId = setInterval(() => {
            setSchedules(prev => [...prev]); 
        }, 60000); 

        return () => clearInterval(intervalId); 
    }, [token]);

    
    // 2. Synchronization Effect: Force a re-render when food_list loads/changes
    // This is necessary because we rely on food_list for item names and colors (if implemented)
    useEffect(() => {
        if (food_list.length > 0 && schedules.length > 0) {
            setSchedules(prev => [...prev]);
        }
    }, [food_list.length, schedules.length]);


    // --- Component JSX ---

    return (
        <>
            <div className="my-schedules px-4 py-8 md:px-12 lg:px-24 min-h-screen bg-gray-50">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center border-b-4 border-orange-500 inline-block px-4 pb-2">My Scheduled Orders</h2>
                <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {schedules.length > 0 ? (
                        schedules.map((schedule) => {
                            const deliveryStatus = getDeliveryStatus(schedule.deliveryTimestamp);

                            return (
                                // Cool look applied here
                                <div key={schedule._id} className={`bg-white shadow-2xl rounded-2xl p-6 border ${schedule.isActive ? "border-orange-100" : "border-red-300 bg-red-50/50"} flex flex-col gap-5 hover:shadow-orange-200/50 hover:shadow-xl transition duration-500`}>
                                    
                                    {/* Display Food Item Icon and Name */}
                                    <div className="flex flex-col gap-3">
                                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-1">Items in Schedule</h3>
                                        <div className="space-y-3">
                                            {schedule.items?.map((item, i) => {
                                                const itemDetails = getItemDetails(item);
                                                const itemColor = getItemColor(itemDetails.name);
                                                
                                                return (
                                                    // Item name and icon container
                                                    <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                                        {/* FIX: Make icon visible by giving it a dark color and applying the dynamic color to the wrapper's background */}
                                                        <span 
                                                            className={`w-8 h-8 ${itemColor} text-white p-1 rounded-md flex items-center justify-center shadow-md`} // Use the bg-color class
                                                            title={itemDetails.name}
                                                        >
                                                            <FaBoxesStacked className={`w-5 h-5 text-gray-800`} /> {/* Icon is dark gray */}
                                                        </span>

                                                        <p className="text-gray-700 text-sm font-medium truncate"> {/* Small text size */}
                                                            <span className="font-semibold text-orange-600 mr-1">{item.quantity}x</span> {itemDetails.name}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 text-gray-600 text-sm border-t pt-4 mt-auto"> {/* Small text size */}
                                        <p className="font-extrabold text-xl text-orange-600">Total: ${schedule.amount?.toFixed(2) || "0.00"}</p> {/* Reduced size */}
                                        
                                        <div className="flex justify-between items-center pt-2">
                                            <p className={`font-bold text-sm ${deliveryStatus.color} tracking-tight`}> {/* Small text size */}
                                                {deliveryStatus.status}
                                            </p>
                                            <p className="capitalize text-gray-700 text-xs"> {/* Extra small text size */}
                                                <b className="font-semibold">Frequency:</b> <span className="font-medium">{schedule.recurrenceRule || "One-Time"}</span>
                                            </p>
                                        </div>

                                        <p className="flex items-center gap-2 pt-1 text-gray-700">
                                            <span className={`text-lg ${schedule.isActive ? "text-green-500" : "text-red-500"}`}>&#x25cf;</span>
                                            <b className="capitalize text-sm">{schedule.isActive ? "Active" : "Paused"}</b>
                                        </p>
                                    </div>
                                    
                                    {/* Buttons Section */}
                                    <div className="mt-auto pt-4 grid grid-cols-3 gap-3">
                                        <button onClick={() => toggleActiveStatus(schedule._id, schedule.isActive)} className={`w-full font-bold py-2.5 px-3 rounded-xl transition duration-300 text-xs shadow-md ${schedule.isActive ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}> {/* Reduced button size */}
                                            {schedule.isActive ? "Pause" : "Resume"}
                                        </button>
                                        <button 
                                            onClick={() => openEditModal(schedule)} 
                                            disabled={deliveryStatus.status === "Delivered"} 
                                            className="w-full bg-orange-200 text-orange-800 font-bold py-2.5 px-3 rounded-xl hover:bg-orange-300 transition duration-300 text-xs shadow-md disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-500"
                                        >
                                            Edit
                                        </button>
                                        <button onClick={() => deleteSchedule(schedule._id)} className="w-full bg-red-600 text-white font-bold py-2.5 px-3 rounded-xl hover:bg-red-700 transition duration-300 text-xs shadow-md">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center col-span-full text-lg text-gray-600 p-10 bg-white shadow-lg rounded-xl">You have no scheduled orders. Start scheduling your favorite meals today!</p>
                    )}
                </div>
            </div>

            {/* Edit Modal (Minor styling updates for consistency) */}
            {isEditModalOpen && editingSchedule && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative border-t-4 border-orange-500">
                        <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h2 className="text-2xl font-bold text-orange-600 mb-6">Edit Schedule</h2> {/* Reduced size */}
                        <form onSubmit={handleUpdateSchedule} className="space-y-5">
                            
                            {/* Item Editing Section */}
                            <div className="border border-gray-200 p-4 rounded-xl bg-gray-50">
                                <h3 className="text-base font-bold mb-3 text-gray-800">Scheduled Items</h3> {/* Reduced size */}
                                <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                                    {editingSchedule.items.map((item) => {
                                        const itemDetails = getItemDetails(item);
                                        const itemColor = getItemColor(itemDetails.name);
                                        
                                        return (
                                            <div key={item.foodId} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    {/* FIX: Make icon visible in modal */}
                                                     <span 
                                                        className={`w-7 h-7 ${itemColor} text-white p-1 rounded-md flex items-center justify-center`} 
                                                        title={itemDetails.name}
                                                    >
                                                        <FaBoxesStacked className={`w-4 h-4 text-gray-800`} /> 
                                                    </span>
                                                    <p className="font-medium text-sm text-gray-700">{itemDetails.name}</p> {/* Reduced size */}
                                                </div>
                                                
                                                <div className="flex items-center space-x-3">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleItemQuantityChange(item.foodId, -1)} 
                                                        disabled={item.quantity <= 0} 
                                                        className="bg-red-100 text-red-600 w-6 h-6 rounded-full hover:bg-red-200 transition disabled:opacity-50 font-bold text-base"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-extrabold w-4 text-center text-gray-900 text-base">{item.quantity}</span> 
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleItemQuantityChange(item.foodId, 1)} 
                                                        className="bg-green-100 text-green-600 w-6 h-6 rounded-full hover:bg-green-200 transition font-bold text-base"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Add Item Dropdown */}
                                <div className="mt-5 pt-4 border-t border-gray-300">
                                    <label htmlFor="addItem" className="block text-sm font-bold text-gray-800 mb-2">Add Another Item</label>
                                    <select 
                                        onChange={(e) => {
                                            handleAddNewItem(e.target.value);
                                            e.target.value = ""; 
                                        }} 
                                        className="block w-full border-gray-300 rounded-lg shadow-inner sm:text-sm p-2 focus:border-orange-500 focus:ring-orange-500"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select a food item to add</option>
                                        {food_list.map(food => (
                                            <option key={food._id} value={food._id}>{food.name} (${food.price})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Time and Recurrence Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label htmlFor="deliveryDate" className="block text-xs font-bold text-gray-700">New Delivery Date</label> {/* Reduced size */}
                                    <input type="date" name="deliveryDate" value={editingSchedule.deliveryDate} onChange={handleEditChange} required className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-sm p-2"/> {/* Reduced size */}
                                </div>
                                <div>
                                    <label htmlFor="deliveryTime" className="block text-xs font-bold text-gray-700">New Delivery Time</label> {/* Reduced size */}
                                    <input type="time" name="deliveryTime" value={editingSchedule.deliveryTime} onChange={handleEditChange} required className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-sm p-2"/> {/* Reduced size */}
                                </div>
                                <div>
                                    <label htmlFor="recurrenceRule" className="block text-xs font-bold text-gray-700">New Frequency</label> {/* Reduced size */}
                                    <select name="recurrenceRule" value={editingSchedule.recurrenceRule || 'one-time'} onChange={handleEditChange} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-sm p-2"> {/* Reduced size */}
                                        <option value="one-time">Just Once</option>
                                        <option value="daily">Every Day</option>
                                        <option value="weekdays">Weekdays (Mon-Fri)</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-3">
                                <button type="submit" className="w-full bg-orange-600 text-white font-extrabold py-3 px-4 rounded-xl hover:bg-orange-700 transition duration-300 text-base shadow-lg"> {/* Reduced size */}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};