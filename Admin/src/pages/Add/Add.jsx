import React, { useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import "./Add.css";
import axios from "axios";
import { toast } from "react-toastify";

export const Add = ({ url }) => {
    const [categoryList, setCategoryList] = useState([]);
    const [image, setImage] = useState(null);

    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "", // 🎯 NEW: Initialize stock field
    });

    // --- HANDLERS ---
    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const fetchCategoryList = async () => {
        try {
            const response = await axios.get(`${url}/api/category/list`);
            
            if (response.data.success) {
                const fetchedCategories = response.data.data.map(cat => cat.name);
                setCategoryList(fetchedCategories);
                
                if (fetchedCategories.length > 0) {
                    setData(prev => ({ ...prev, category: fetchedCategories[0] }));
                }
            } else {
                toast.error("❌ Failed to fetch categories.");
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("❌ Network error while fetching categories.");
        }
    };
    
    // --- SUBMIT HANDLER ---
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("price", Number(data.price));
            formData.append("category", data.category);
            formData.append("stock", Number(data.stock)); // 🎯 NEW: Append stock quantity
            
            if (image) {
                formData.append("image", image);
            }

            const response = await axios.post(`${url}/api/food/add`, formData);

            if (response.data.success) {
                // Reset form data after successful submission
                setData({
                    name: "",
                    description: "",
                    price: "",
                    stock: "", // 🎯 Reset stock field
                    category: categoryList.length > 0 ? categoryList[0] : "", 
                });
                setImage(null);
                toast.success("✅ " + response.data.message);
            } else {
                toast.error("❌ " + (response.data.message || "Submission failed."));
            }
        } catch (error) {
            console.error("Error uploading product:", error);
            if (error.response && error.response.data && error.response.data.message) {
                 toast.error("❌ Server Error: " + error.response.data.message);
            } else {
                 toast.error("❌ Something went wrong while uploading.");
            }
        }
    };

    // --- EFFECT: Fetch categories on component mount ---
    useEffect(() => {
        fetchCategoryList();
    }, []); 

    // --- RETURN JSX ---
    return (
        <div className="add">
            <form onSubmit={onSubmitHandler} className="flex-col">
                
                <div className="add-img-upload flex-col">
                    <p>Upload Image</p>
                    <label htmlFor="image">
                        <img
                            src={image ? URL.createObjectURL(image) : assets.upload_area}
                            alt="upload preview"
                        />
                    </label>
                    <input
                        onChange={(e) => setImage(e.target.files[0])}
                        type="file"
                        id="image"
                        hidden
                        required
                    />
                </div>

                <div className="add-product-name flex-col">
                    <p>Product Name</p>
                    <input
                        onChange={onChangeHandler}
                        value={data.name}
                        type="text"
                        name="name"
                        placeholder="Type here"
                        required
                    />
                </div>

                <div className="add-product-description flex-col">
                    <p>Product Description</p>
                    <textarea
                        onChange={onChangeHandler}
                        value={data.description}
                        name="description"
                        rows="5"
                        placeholder="Write your content here (Minimum 10 characters)"
                        required
                        minLength="10" 
                    ></textarea>
                </div>

                <div className="add-category-price">
                    <div className="add-category flex-col">
                        <p>Product Category</p>
                        <select 
                            onChange={onChangeHandler} 
                            name="category" 
                            value={data.category}
                            required
                        >
                            {categoryList.length > 0 ? (
                                categoryList.map((item, index) => (
                                    <option key={index} value={item}>{item}</option>
                                ))
                            ) : (
                                <option value="" disabled>Loading categories...</option>
                            )}
                        </select>
                    </div>
                    
                    <div className="add-price flex-col">
                        <p>Product Price</p>
                        <input
                            onChange={onChangeHandler}
                            value={data.price}
                            type="number"
                            name="price"
                            placeholder="$20"
                            required
                        />
                    </div>
                </div>
                
                {/* 🎯 NEW: Stock Input Field */}
                <div className="add-stock flex-col">
                    <p>Initial Stock Quantity</p>
                    <input
                        onChange={onChangeHandler}
                        value={data.stock}
                        type="number"
                        name="stock"
                        placeholder="e.g., 100"
                        min="0" // Cannot be negative
                        required
                    />
                </div>

                <button type="submit" className="add-btn">
                    Add
                </button>
            </form>
        </div>
    );
};

export default Add;