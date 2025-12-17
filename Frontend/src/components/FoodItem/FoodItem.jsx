import React, { useContext } from 'react';
import { StoreContext } from '../../context/storecontext';
import { assets } from '../../assets/assets';
import './FoodItem.css';
import { FaRegStar, FaStar } from 'react-icons/fa6'; 

const FoodItem = ({ id, name, price, description, image, stock, openModal }) => { 
    const { 
        url, 
        favorites, 
        toggleFavoriteStatus 
    } = useContext(StoreContext);

    const isFavorited = favorites.includes(id);
    const isInStock = Number(stock) > 0;

    const itemData = { id, name, price, description, image, stock };

    return (
        <div className='food-item'>
            <div className='food-item-img-container relative' onClick={() => openModal(itemData)}>
                <img className='food-item-image' src={url + "/images/" + image} alt={name} />
                
                {!isInStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
                        <span className="text-white text-xl font-bold p-3 bg-red-600 rounded shadow-lg">
                            OUT OF STOCK
                        </span>
                    </div>
                )}
                
                <div 
                    className={`favorite-icon absolute top-3 right-3 cursor-pointer transition-all duration-300 z-10`}
                    onClick={(e) => {e.stopPropagation(); toggleFavoriteStatus(id);}}
                    title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                >
                    {isFavorited ? (
                        <FaStar className='w-6 h-6 text-yellow-500 hover:scale-110' />
                    ) : (
                        <FaRegStar className='w-6 h-6 text-white hover:text-yellow-400 hover:scale-110' />
                    )}
                </div>

            </div>

            <div className='food-item-info'>
                <div className='food-item-name-rating'>
                    <p>{name}</p>
                    <img src={assets.rating_starts} alt='Rating' />
                </div>
                <p className='food-item-desc'>{description}</p>
                <p className='food-item-price'>${price}</p>
            </div>
        </div>
    );
};

export default FoodItem;