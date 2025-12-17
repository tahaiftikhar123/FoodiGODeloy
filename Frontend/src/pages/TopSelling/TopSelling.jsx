import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../../context/storecontext';
import { toast } from 'react-toastify';

import { IoTrendingUpOutline } from 'react-icons/io5';

import FoodDetailModal from '../../components/FoodDetailModal/FoodDetailModal';

export const TopSelling = () => {
    const [topItems, setTopItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFoodItem, setSelectedFoodItem] = useState(null); 
    
    const { url, food_list, addToCart } = useContext(StoreContext); 

    const getItemDetails = (foodId) => {
        // Ensure foodId is a string for reliable comparison
        const food = food_list.find(item => String(item._id) === String(foodId)); 
        
        if (!food) {
            // Return null or undefined if the food is not found.
            return null; 
        }
        
        return {
            ...food,
            image: `${url}/images/${food.image}`,
        };
    };

    const openItemDetails = (foodId) => {
        const item = food_list.find(f => String(f._id) === String(foodId));
        if (item) {
            setSelectedFoodItem({ ...item, id: item._id });
        }
    };

    const closeItemDetails = () => {
        setSelectedFoodItem(null);
    };
    
    const fetchTopSellingItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${url}/api/schedule/top-selling`); 
            
            if (response.data.success) {
                setTopItems(response.data.data);
            } else {
                toast.error("Failed to fetch top selling items.");
            }
        } catch (error) {
            // Ensure error handling is robust
            toast.error(error.response?.data?.message || "Error fetching top items.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (food_list.length > 0) {
            fetchTopSellingItems();
        } 
    }, [url, food_list]);

    if (loading) {
        return <p className="text-center mt-20 text-lg text-gray-600">Loading popular items...</p>;
    }
    
    if (topItems.length === 0) {
        return (
            <div className="top-selling-items px-4 py-6 md:px-10 lg:px-20 text-center">
                <h2 className="text-3xl font-bold text-red-600 mb-8">🔥 Top 10 Trending Items</h2>
                <p className="mt-10 text-xl text-gray-500">
                    No order history available yet to determine top-selling items. Start placing orders!
                </p>
            </div>
        );
    }

    return (
        <div className="top-selling-items px-4 py-6 md:px-10 lg:px-20">
            <h2 className="text-3xl font-bold text-red-600 mb-8 text-center flex items-center justify-center gap-3">
                <IoTrendingUpOutline className="text-4xl" /> Top 10 Trending Items
            </h2>
            <p className="text-center text-gray-600 mb-10">
                These are the most frequently ordered items across all immediate and scheduled purchases.
            </p>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {topItems.map((item, index) => {
                    const foodId = item.foodId;
                    const itemDetails = getItemDetails(foodId);
                    
                    // ⭐ CRITICAL FIX: Check if itemDetails is null before proceeding
                    if (!itemDetails) {
                        return null; 
                    }
                    
                    const badgeClass = 
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-700' : 
                        'bg-orange-500';

                    return (
                        <div 
                            key={foodId} 
                            onClick={() => openItemDetails(foodId)} 
                            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 relative border border-gray-100 overflow-hidden cursor-pointer"
                        >
                            <div className={`absolute top-0 left-0 p-2 font-bold text-white text-lg rounded-br-lg ${badgeClass}`}>
                                #{index + 1}
                            </div>
                            
                            <img 
                                src={itemDetails.image} 
                                alt={itemDetails.name} 
                                className="w-full h-48 object-cover rounded-t-xl" 
                            />
                            
                            <div className="p-4 flex flex-col justify-between h-[calc(100%-12rem)]">
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">{itemDetails.name}</h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">{itemDetails.description}</p>
                                
                                <div className="flex justify-between items-center mt-auto border-t pt-3">
                                    <p className="text-lg font-bold text-green-600">${itemDetails.price.toFixed(2)}</p>
                                    <p className="text-sm text-gray-500">
                                        Ordered: <span className="font-bold text-gray-800">{item.totalOrderCount}</span> times
                                    </p>
                                </div>

                                <button 
                                    onClick={(e) => { e.stopPropagation(); addToCart(foodId); }} 
                                    className="mt-3 w-full bg-orange-500 text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedFoodItem && (
                <FoodDetailModal 
                    item={selectedFoodItem} 
                    closeModal={closeItemDetails} 
                />
            )}
        </div>
    );
};