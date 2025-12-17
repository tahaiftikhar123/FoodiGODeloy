import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../../context/storecontext';
import { IoCloseSharp } from "react-icons/io5";
import { FaRegStar, FaStar } from 'react-icons/fa6'; 
import { toast } from 'react-toastify';
import axios from 'axios';
import './FoodDetailModal.css';

const ReviewSection = ({ foodId, url }) => {
    const [reviews, setReviews] = useState([]);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);
    
    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${url}/api/review/list/${foodId}`);
            if (response.data.success) {
                setReviews(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const submitReview = async () => {
        if (!comment.trim()) {
            toast.error("Review comment cannot be empty.");
            return;
        }
        
        // 🎯 FIX: Retrieve the user token from local storage
        const token = localStorage.getItem("token"); 
        
        if (!token) {
            toast.error("Please log in to submit a review.");
            return;
        }

        try {
            const response = await axios.post(
                `${url}/api/review/add`, 
                {
                    foodId,
                    rating,
                    comment,
                    // The backend will get userId and userName from the token/middleware
                },
                {
                    // 🎯 FIX: Pass the token in the headers for authentication middleware
                    headers: {
                        token: token, 
                    }
                }
            );

            if (response.data.success) {
                toast.success("Review submitted!");
                setComment('');
                setRating(5);
                fetchReviews();
            } else {
                // Display the server's specific error message if available
                const errorMessage = response.data.message || "Failed to submit review.";
                console.error("Server message:", errorMessage);
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("Axios Submission Error:", error);
            // This toast is hit if the network request fails or the server sends a non-2xx status
            toast.error("Error submitting review. Check server connection or authentication.");
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [foodId, url]);

    return (
        <div className='review-section'>
            <h3>Customer Reviews</h3>
            <div className='review-form'>
                <textarea 
                    placeholder='Add your comment...' 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)} 
                />
                <div className='rating-controls'>
                    <label>Rating:</label>
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                        {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Star{r > 1 && 's'}</option>)}
                    </select>
                </div>
                <button onClick={submitReview} className='submit-review-btn'>Submit Review</button>
            </div>

            <div className='review-list'>
                {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                        <div key={index} className='review-item'>
                            <p className='review-text'>"{review.comment}"</p>
                            <p className='review-meta'>
                                <span>{Array(review.rating).fill(<FaStar className='star-icon' />)}</span>
                                - {review.userName}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className='no-reviews'>Be the first to leave a review!</p>
                )}
            </div>
        </div>
    );
};


const FoodDetailModal = ({ item, closeModal }) => {
    const { url, cartItems, addtocart, removefromcart, toggleFavoriteStatus, favorites } = useContext(StoreContext);
    
    const quantity = cartItems[item.id] || 0;
    const isFavorited = favorites.includes(item.id);
    const isInStock = Number(item.stock) > 0;
    const stockAvailable = Number(item.stock);

    const handleBackgroundClick = (e) => {
        if (e.target.className.includes('modal-backdrop')) {
            closeModal();
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className='modal-backdrop' onClick={handleBackgroundClick}>
            <div className='food-detail-modal'>
                <IoCloseSharp className='modal-close-icon' size={30} onClick={closeModal} />
                
                <div className='modal-content-main'>
                    <div className='modal-left'>
                        <img 
                            src={url + "/images/" + item.image} 
                            alt={item.name} 
                            className='modal-food-image'
                        />
                    </div>
                    
                    <div className='modal-right'>
                        <div className='modal-header'>
                            <h2>{item.name}</h2>
                            <div 
                                className='modal-favorite-icon'
                                onClick={() => toggleFavoriteStatus(item.id)}
                                title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                            >
                                {isFavorited ? (
                                    <FaStar className='w-8 h-8 text-yellow-500 cursor-pointer' />
                                ) : (
                                    <FaRegStar className='w-8 h-8 text-gray-500 cursor-pointer hover:text-yellow-400' />
                                )}
                            </div>
                        </div>

                        <p className='modal-description'>{item.description}</p>
                        
                        <div className='modal-status'>
    <p className='modal-price'>Price: ${item.price}</p>
    <p className={`stock-info ${isInStock ? 'in-stock' : 'out-of-stock-text'}`}>
        Status: {isInStock ? `In Stock (${stockAvailable} available)` : 'Out of Stock'}
    </p>
</div>

                        {isInStock ? (
                            <div className='modal-cart-controls'>
                                <p>Quantity in Cart: {quantity}</p>
                                <div className='cart-counter'>
                                    <button 
                                        onClick={() => removefromcart(item.id)}
                                        disabled={quantity === 0}
                                        className={quantity === 0 ? 'disabled' : ''}
                                    >
                                        -
                                    </button>
                                    
                                    <span className='quantity-display'>{quantity}</span>
                                    
                                    <button 
                                        onClick={() => addtocart(item.id)}
                                        disabled={quantity >= stockAvailable}
                                        className={quantity >= stockAvailable ? 'disabled' : ''}
                                        title={quantity >= stockAvailable ? 'Maximum stock reached' : 'Add to cart'}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className='out-of-stock-message'>Cannot add this item to cart right now.</p>
                        )}
                    </div>
                </div>

                <div className='modal-reviews'>
                    <ReviewSection foodId={item.id} url={url} />
                </div>
            </div>
        </div>
    );
};

export default FoodDetailModal;