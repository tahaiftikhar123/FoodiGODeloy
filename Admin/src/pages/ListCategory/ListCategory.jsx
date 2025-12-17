import React, { useState, useEffect } from "react";
import "./ListCategory.css";
import axios from "axios";
import { toast } from "react-toastify";

const ListCategory = ({ url }) => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ id: "", name: "", description: "", image: null });

    const fetchList = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${url}/api/category/list`);
            if (response.data.success) {
                if (Array.isArray(response.data.data)) {
                    setList(response.data.data);
                } else {
                    setList([]);
                }
            } else {
                toast.error(response.data.message);
                setList([]);
            }
        } catch (error) {
            toast.error("Error fetching categories");
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    const removeCategory = async (categoryId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const response = await axios.post(`${url}/api/category/remove`, { id: categoryId });
            if (response.data.success) {
                toast.success(response.data.message);
                await fetchList();
            }
        } catch (error) {
            toast.error("Removal failed");
        }
    };

    const handleEditClick = (item) => {
        setEditMode(true);
        setEditData({ 
            id: item._id, 
            name: item.name, 
            description: item.description, 
            image: null 
        });
    };

    const onUpdateCategory = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("id", editData.id);
        formData.append("name", editData.name);
        formData.append("description", editData.description);
        if (editData.image) formData.append("image", editData.image);

        try {
            const response = await axios.post(`${url}/api/category/update`, formData);
            if (response.data.success) {
                toast.success(response.data.message);
                setEditMode(false);
                fetchList();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    if (loading) {
        return <div className="list-category"><p className="no-data-message">Loading...</p></div>;
    }

    return (
        <div className="list-category flex-col">
            {editMode && (
                <div className="edit-overlay">
                    <form className="edit-modal" onSubmit={onUpdateCategory}>
                        <h3>Edit Category</h3>
                        <div className="edit-input-group">
                            <label>Category Name</label>
                            <input 
                                type="text" 
                                value={editData.name} 
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })} 
                                required 
                            />
                        </div>
                        <div className="edit-input-group">
                            <label>Description</label>
                            <textarea 
                                value={editData.description} 
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })} 
                                required 
                            />
                        </div>
                        <div className="edit-input-group">
                            <label>New Image (Optional)</label>
                            <input 
                                type="file" 
                                onChange={(e) => setEditData({ ...editData, image: e.target.files[0] })} 
                            />
                        </div>
                        <div className="modal-btns">
                            <button type="submit" className="save-btn">Update</button>
                            <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <h3>All Food Categories ({list.length})</h3>
            <div className="list-category-table">
                <div className="list-category-table-format title">
                    <b>Image</b>
                    <b>Name</b>
                    <b>Description</b>
                    <b>Action</b>
                </div>
                {list.length === 0 ? (
                    <p className="no-data-message">No categories found.</p>
                ) : (
                    list.map((item, index) => (
                        <div key={item._id || index} className="list-category-table-format">
                            <img 
                                src={item.image ? `${url}/images/${item.image}` : '/placeholder.png'} 
                                alt="" 
                            />
                            <p>{item.name || 'N/A'}</p>
                            <p className="description-col">
                                {item.description 
                                    ? (item.description.length > 50 ? `${item.description.substring(0, 50)}...` : item.description) 
                                    : 'No description'}
                            </p>
                            <div className="action-buttons">
                                <button className="edit-btn" onClick={() => handleEditClick(item)}>Edit</button>
                                <button className="delete-btn" onClick={() => removeCategory(item._id)}>X</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ListCategory;