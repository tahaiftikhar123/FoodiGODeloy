// src/pages/Favorites/Favorites.jsx

import React, { useContext, useState } from 'react';
import { StoreContext } from '../../context/storecontext';
import FoodItem from '../../components/FoodItem/FoodItem'; 
import FoodDetailModal from '../../components/FoodDetailModal/FoodDetailModal'; // 🎯 Import Modal
import { Link } from 'react-router-dom';


const Favorites = () => {
    // 🎯 Retrieve food_list, favorites, and token from context
    const { food_list, favorites, token } = useContext(StoreContext);

    // 🎯 NEW STATE: Manage which item is selected and if the modal is visible
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        // Ensure the body scroll lock is released by the modal component itself
    };

    // Filter food_list to only include items whose ID is present in the favorites array
    const favoriteItems = food_list.filter(item => favorites.includes(item._id));

    return (
        <div className='favorites max-w-7xl mx-auto py-10 px-4'>
            <h2 className='text-3xl font-bold text-center text-orange-600 mb-8'>
                Your Favorite Items ❤️
            </h2>

            {!token ? (
                // --- User Not Logged In State ---
                <div className='text-center py-10 border border-gray-200 rounded-lg shadow-md bg-white'>
                    <p className='text-xl mb-4'>
                        Please sign in to view and manage your favorites.
                    </p>
                    <Link to="/" className='text-orange-500 font-semibold hover:text-orange-700'>
                        Go to Home Page
                    </Link>
                </div>
            ) : favoriteItems.length === 0 ? (
                // --- Favorites Empty State ---
                <div className='text-center py-10 border border-gray-200 rounded-lg shadow-md bg-white'>
                    <p className='text-xl mb-4'>
                        You haven't added any items to your favorites yet.
                    </p>
                    <p className='text-gray-600 mb-6'>
                        Click the star icon on any food item to add it here!
                    </p>
                    <Link to="/menu" className='px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors'>
                        Explore Menu
                    </Link>
                </div>
            ) : (
                // --- Display Favorite Items ---
                <div className='favorites-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
                    {favoriteItems.map((item) => (
                        <FoodItem
                            key={item._id}
                            id={item._id}
                            name={item.name}
                            price={item.price}
                            description={item.description}
                            image={item.image}
                            stock={item.stock} // Ensure stock is passed
                            // 🎯 FIX: Pass the openModal function
                            openModal={openModal} 
                        />
                    ))}
                </div>
            )}

            {/* 🎯 NEW: Render the modal if open */}
            {isModalOpen && selectedItem && (
                <FoodDetailModal 
                    item={selectedItem} 
                    closeModal={closeModal} 
                />
            )}
        </div>
    );
};

export default Favorites;