import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './List.css'; 
import { IoCheckmarkCircleOutline, IoCloseCircleOutline } from 'react-icons/io5'; 
import { FaEdit } from 'react-icons/fa';

export const List = ({url}) => {
    const [list, setList] = useState([]);
    // Unified state to track the item being edited and its modified values
    const [editingItem, setEditingItem] = useState(null); 
    const LOW_STOCK_THRESHOLD = 10; 
    // State to hold all unique categories from the fetched list
    const [categories, setCategories] = useState([]); 

    // --- Data Fetching ---
    const fetchList = async () => {
        try {
            const response = await axios.get(`${url}/api/food/list`);
            if (response.data.success) {
                const foodList = response.data.data;
                setList(foodList);
                
                // Extract unique categories from the fetched list
                const uniqueCategories = [...new Set(foodList.map(item => item.category))];
                setCategories(uniqueCategories);
                
            } else {
                toast.error("❌ Error fetching list.");
            }
        } catch (error) {
            toast.error("❌ Network error while fetching food list.");
        }
    };
    
    // --- Deletion (Remove Food) ---
    const removefood = async (foodid) => {
        try {
            const response = await axios.post(`${url}/api/food/remove`, { id: foodid });
            if (response.data.success) {
                toast.success("✅ Food removed");
                fetchList(); 
            } else {
                toast.error("❌ Failed to remove food");
            }
        } catch (err) {
            toast.error("❌ Server error while removing food");
            console.error(err);
        }
    };

    // --- Editing Handlers ---

    // Function to initiate editing mode
    const handleEditClick = (item) => {
        setEditingItem({
            _id: item._id,
            // Ensure values are strings for input fields
            stock: item.stock !== undefined && item.stock !== null ? item.stock.toString() : '0',
            category: item.category,
            price: item.price !== undefined && item.price !== null ? item.price.toString() : '0',
        });
    };
    
    // Function to handle changes in the input fields (Price, Category, Stock)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditingItem(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Function to cancel editing mode
    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    // Function to save ALL updated fields (Category, Price, Stock)
    const handleSave = async (id) => {
        if (!editingItem) return; // Safety check
        const { stock: newStockStr, category: newCategory, price: newPriceStr } = editingItem;
        
        // 1. Validation
        const stockValue = Number(newStockStr);
        const priceValue = Number(newPriceStr);

        if (isNaN(stockValue) || stockValue < 0 || !Number.isInteger(stockValue)) {
            toast.error("❌ Stock must be a non-negative whole number.");
            return;
        }
        if (isNaN(priceValue) || priceValue < 0) {
            toast.error("❌ Price must be a non-negative number.");
            return;
        }
        if (!newCategory || newCategory.trim() === '') {
            toast.error("❌ Category cannot be empty.");
            return;
        }
        
        // 2. API Call to the new multi-field update endpoint
        try {
            const response = await axios.post(`${url}/api/food/update_details`, {
                id: id,
                stock: stockValue,
                category: newCategory,
                price: priceValue,
            });

            if (response.data.success) {
                toast.success("✅ Item details updated!");
                
                // 3. Update the UI state
                setList(prevList => prevList.map(item => 
                    item._id === id ? { 
                        ...item, 
                        stock: stockValue, 
                        category: newCategory, 
                        price: priceValue 
                    } : item
                ));
                
                // 4. Update categories array in case a new category was added elsewhere (optional but good practice)
                const updatedCategories = [...new Set(list.map(item => item.category))];
                setCategories(updatedCategories);

                // 5. Exit editing mode
                setEditingItem(null);
            } else {
                // Display the specific message from the backend if available
                toast.error("❌ Failed to update item: " + (response.data.message || "Unknown error."));
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("❌ Server error during item update. Ensure the 'update_details' endpoint is correctly implemented.");
        }
    };


    useEffect(() => {
        fetchList();
    }, [url]);

    // Helper function for Enter key handling (now points to unified save)
    const handleKeyDown = (e, id) => {
        if (e.key === 'Enter') handleSave(id);
    };

    return (
        <div className="list add flex-col">
            <p>All Foods List</p>
            <div className="list-table">
                <div className="list-table-format title">
                    <b>Image</b>
                    <b>Name</b>
                    <b className='categ'>Category</b>
                    <b>Price</b>
                    <b>Stock</b> 
                    <b>Action</b>
                </div>

                {list.map((item, index) => {
                    const isEditing = editingItem && editingItem._id === item._id;
                    const stockClassName = item.stock === 0 
                        ? 'out-of-stock' 
                        : item.stock <= LOW_STOCK_THRESHOLD 
                            ? 'low-stock' 
                            : 'in-stock';

                    return (
                        <div key={index} className={`list-table-format ${isEditing ? 'editing-row' : ''}`}>
                            <img src={`${url}/images/${item.image}`} alt={item.name} />
                            <p>{item.name}</p>
                            
                            {/* 🎯 EDITABLE CATEGORY CELL (DROPDOWN) */}
                            <p className="editable-cell category-cell" onClick={!isEditing ? () => handleEditClick(item) : undefined}>
                                {isEditing ? (
                                    <select
                                        name="category"
                                        value={editingItem.category}
                                        onChange={handleChange}
                                        className="inline-input category-select"
                                    >
                                        {categories.map((cat, i) => (
                                            <option key={i} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                ) : (
                                    item.category
                                )}
                            </p>
                            
                            {/* EDITABLE PRICE CELL */}
                            <p className="editable-cell" onClick={!isEditing ? () => handleEditClick(item) : undefined}>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        name="price"
                                        value={editingItem.price}
                                        onChange={handleChange}
                                        className="inline-input price-input"
                                        min="0"
                                        step="0.01"
                                        onKeyDown={(e) => handleKeyDown(e, item._id)}
                                    />
                                ) : (
                                    `$${item.price ? item.price.toFixed(2) : 'N/A'}`
                                )}
                            </p>
                            
                            {/* EDITABLE STOCK CELL */}
                            <div className={`stock-cell editable-cell ${stockClassName} ${!isEditing ? 'cursor-pointer' : ''}`}
                                 onClick={!isEditing ? () => handleEditClick(item) : undefined}>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        name="stock"
                                        value={editingItem.stock}
                                        onChange={handleChange}
                                        className="inline-input stock-input"
                                        min="0"
                                        onKeyDown={(e) => handleKeyDown(e, item._id)}
                                    />
                                ) : (
                                    <span className="stock-display">
                                        {item.stock === 0 ? <span className="stock-alert-text">OUT!</span> : item.stock}
                                        <FaEdit className='edit-icon' size={14}/>
                                    </span>
                                )}
                            </div>
                            
                            {/* ACTION BUTTONS (Save or Remove) */}
                            <p className="action-cell">
                                {isEditing ? (
                                    <div className="edit-controls">
                                        <IoCheckmarkCircleOutline 
                                            className="save-icon" 
                                            onClick={() => handleSave(item._id)} 
                                            size={28}
                                            title="Save Changes"
                                        />
                                        <IoCloseCircleOutline 
                                            className="cancel-icon" 
                                            onClick={handleCancelEdit} 
                                            size={28}
                                            title="Cancel Edit"
                                        />
                                    </div>
                                ) : (
                                    <span 
                                        className="delete-btn"
                                        onClick={() => removefood(item._id)}
                                        title="Remove Food Item"
                                    >
                                        ✖
                                    </span>
                                )}
                            </p>
                        </div>
                    );
                })}

            </div>
        </div>
    );
};

export default List;