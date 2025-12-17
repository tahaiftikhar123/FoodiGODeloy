import React, { useContext, useState } from 'react';
import { StoreContext } from '../storecontext';
import FoodItem from '../../components/FoodItem/FoodItem';
import FoodDetailModal from '../../components/FoodDetailModal/FoodDetailModal';
import './FoodDisplay.css';

export const FoodDisplay = ({ category }) => {
    const { food_list } = useContext(StoreContext);
    
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    return (
        <div className='food_display' id='food-display'>
            <h2>Top dishes near you</h2>
            <div className="display-food-list">
                {food_list
                    .filter(item => category === "All" || item.category === category)
                    .map((item, index) => (
                        <FoodItem
                            key={index}
                            id={item._id}
                            name={item.name}
                            description={item.description}
                            price={item.price}
                            image={item.image}
                            stock={item.stock}
                            openModal={openModal} 
                        />
                    ))}
            </div>
            
            {isModalOpen && selectedItem && (
                <FoodDetailModal 
                    item={selectedItem} 
                    closeModal={closeModal} 
                />
            )}
        </div>
    );
};

export default FoodDisplay;