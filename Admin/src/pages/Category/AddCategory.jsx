import React, { useState } from "react";
import "./AddCategory.css";
import { assets } from "../../assets/assets"; // Assuming this path is correct for icons/placeholders
import axios from "axios";
import { toast } from "react-toastify";

const AddCategory = ({ url }) => {
    const [image, setImage] = useState(false);
    const [data, setData] = useState({
        name: "",
        description: "",
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!image) {
            toast.error("Category image/icon is required.");
            return;
        }

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("image", image);

        try {
            const response = await axios.post(`${url}/api/category/add`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setData({
                    name: "",
                    description: "",
                });
                setImage(false);
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message || "Failed to add category.");
            }
        } catch (error) {
            console.error("Error submitting category:", error);
            toast.error("An error occurred while adding the category.");
        }
    };

    return (
        <div className="add-category">
            <h3>Add New Category</h3>
            <form className="flex-col" onSubmit={onSubmitHandler}>
                <div className="add-img-upload flex-col">
                    <p>Upload Image/Icon</p>
                    <label htmlFor="image">
                        <img 
                            src={image ? URL.createObjectURL(image) : assets.upload_area} 
                            alt="Upload Area" 
                            style={{ 
                                width: '100px', 
                                height: '100px', 
                                objectFit: 'cover',
                                cursor: 'pointer'
                            }}
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

                <div className="add-category-name flex-col">
                    <p>Category Name</p>
                    <input 
                        onChange={onChangeHandler} 
                        value={data.name} 
                        type="text" 
                        name="name" 
                        placeholder="e.g., Desserts" 
                        required 
                    />
                </div>

                <div className="add-category-description flex-col">
                    <p>Category Description</p>
                    <textarea 
                        onChange={onChangeHandler} 
                        value={data.description} 
                        name="description" 
                        rows="3" 
                        placeholder="A short description of the category." 
                        required 
                    />
                </div>
                
                <button type="submit" className="add-btn">
                    ADD CATEGORY
                </button>
            </form>
        </div>
    );
};

export default AddCategory;