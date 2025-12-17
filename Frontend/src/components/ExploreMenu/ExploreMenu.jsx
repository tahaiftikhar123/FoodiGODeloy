import React, { useRef, useState, useContext } from "react";
import "./ExploreMenu.css";
import { StoreContext } from "../../context/storecontext";
import { FaUtensils } from 'react-icons/fa6';

const ExploreMenu = ({ category, setCategory }) => {
    const { url, category_list } = useContext(StoreContext);

    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.clientX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.clientX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleCategoryClick = (menuName) => {
        setCategory(category === menuName ? "All" : menuName);
    };

    return (
        <div className="explore-menu" id="explore-menu">
            <h1 className="explore-menu-title">Explore Menu</h1>
            <p className="explore-menu-subtitle">Choose from our delicious categories</p>

            <div
                ref={scrollRef}
                className="explore-menu-list"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                <div
                    className={`explore-menu-item ${category === 'All' ? 'selected' : ''}`}
                    onClick={() => handleCategoryClick('All')}
                >
                    <div className="explore-menu-item-image">
                        <FaUtensils
                            className="all-food-icon"
                            style={{
                                fontSize: '30px',
                                // Keep the color logic: white when selected, tomato when not selected
                                color: category === 'All' ? 'white' : 'tomato'
                            }}
                        />
                    </div>
                    <p className="explore-menu-item-name">All Food</p>
                </div>

                {category_list.map((item, index) => (
                    <div
                        key={index}
                        className={`explore-menu-item ${category === item.name ? 'selected' : ''}`}
                        onClick={() => handleCategoryClick(item.name)}
                    >
                        <div className="explore-menu-item-image">
                            <img
                                src={url + "/images/" + item.image}
                                alt={item.name}
                                className="explore-menu-image"
                            />
                        </div>
                        <p className="explore-menu-item-name">{item.name}</p>
                    </div>
                ))}
            </div>

            <div className="explore-menu-divider"></div>
        </div>
    );
};

export default ExploreMenu;