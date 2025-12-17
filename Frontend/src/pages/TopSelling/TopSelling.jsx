import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { StoreContext } from '../../context/storecontext';
import { toast } from 'react-toastify';
import { IoTrendingUpOutline } from 'react-icons/io5';
import FoodDetailModal from '../../components/FoodDetailModal/FoodDetailModal';

export const TopSelling = () => {
    const [topItems, setTopItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFoodItem, setSelectedFoodItem] = useState(null); 
    
    const { url, food_list, addToCart, token } = useContext(StoreContext); 

    // Helper to find food details from the main food_list
    const getItemDetails = useCallback((foodId) => {
        return food_list.find(item => String(item._id) === String(foodId));
    }, [food_list]);

    // Fetch trending items from the new backend endpoint
    const fetchTopSellingItems = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${url}/api/topselling/list`); 
            if (response.data.success) {
                setTopItems(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching top items:", error);
        } finally {
            setLoading(false);
        }
    }, [url]);

    // Refresh list when food_list loads or fetch function changes
    useEffect(() => {
        if (food_list.length > 0) {
            fetchTopSellingItems();
        } 
    }, [food_list, fetchTopSellingItems]);

    const openItemDetails = (foodId) => {
        const item = getItemDetails(foodId);
        if (item) {
            // We pass the raw image name because the Modal handles the URL prefix
            setSelectedFoodItem({ 
                ...item, 
                id: item._id // Ensure 'id' exists for Modal cart logic
            });
        }
    };

    const handleAddToCart = async (e, item) => {
        e.stopPropagation(); // Prevent opening the modal when clicking the button
        
        // 1. Local UI update
        addToCart(item._id);

        // 2. Backend update (Increments global cartAdditionCount)
        try {
            const response = await axios.post(
                `${url}/api/cart/add`, 
                { itemId: item._id, name: item.name }, 
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success(`${item.name} added to cart!`);
                fetchTopSellingItems(); // Refresh trending counts
            }
        } catch (error) {
            toast.error("Please login to add items to cart.");
        }
    };

    if (loading) return <div className="text-center py-20 text-xl">Loading trending treats...</div>;

    return (
        <div className="top-selling-items px-4 py-8 md:px-10 lg:px-20">
            <div className="flex flex-col items-center mb-10">
                <h2 className="text-3xl font-bold text-red-600 flex items-center gap-2">
                    <IoTrendingUpOutline /> Top 10 Trending Items
                </h2>
                <p className="text-gray-500 mt-2">Most loved items based on community cart additions</p>
            </div>

            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {topItems.map((item, index) => {
                    const details = getItemDetails(item.foodId);
                    if (!details) return null;

                    return (
                        <div 
                            key={item.foodId} 
                            onClick={() => openItemDetails(item.foodId)}
                            className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-100"
                        >
                            {/* Ranking Badge */}
                            <div className={`absolute z-10 top-0 left-0 px-4 py-1 font-bold text-white rounded-br-2xl shadow-md
                                ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-orange-700' : 'bg-orange-500'}`}>
                                #{index + 1}
                            </div>

                            {/* Image Container */}
                            <div className="overflow-hidden h-48">
                                <img 
                                    src={`${url}/images/${details.image}`} 
                                    alt={details.name} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{details.name}</h3>
                                <p className="text-gray-500 text-sm mt-1 line-clamp-2 h-10">{details.description}</p>
                                
                                <div className="flex justify-between items-center mt-4 border-t pt-4">
                                    <span className="text-2xl font-black text-green-600">${details.price}</span>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Popularity</p>
                                        <p className="text-sm font-bold text-gray-700">{item.cartAdditionCount} adds</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={(e) => handleAddToCart(e, details)}
                                    className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-orange-200"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal - only rendered when an item is selected */}
            {selectedFoodItem && (
                <FoodDetailModal 
                    item={selectedFoodItem} 
                    closeModal={() => setSelectedFoodItem(null)} 
                />
            )}
        </div>
    );
};