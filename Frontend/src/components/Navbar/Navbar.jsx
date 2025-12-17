import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets"; // Keeping assets for the logo only
import { StoreContext } from "../../context/storecontext";
// Import icons from react-icons
import { 
    IoSearchOutline, 
    IoCartOutline, 
    IoPersonCircleOutline, 
    IoMenu, 
    IoClose, 
    IoBagHandleOutline, 
    IoLogOutOutline,
    IoCalendarOutline, 
    IoMailOutline,
    IoTrendingUpOutline // 🎯 NEW ICON: For Top Selling/Trending
} from 'react-icons/io5'; 
import { FaHeart } from 'react-icons/fa6'; // Keep FaHeart for favorites

const Navbar = ({ setshowlogin }) => {
    const [isOpen, setIsOpen] = useState(false); 
    const [profileMenu, setProfileMenu] = useState(false);

    const { gettotalcartamount, token, favorites, logout } = useContext(StoreContext); 

    const handleLogout = () => {
        logout("Logged out successfully.");
        setProfileMenu(false);
        setIsOpen(false);
    };

    // 🎯 UPDATED: Using hash links (#) for sections on the home page
    const navItems = [
        { name: "Home", path: "/" },
        // 🎯 Change Menu to an anchor link (assumes category component has id="explore-menu")
        { name: "Menu", path: "/#explore-menu" }, 
        // 🎯 Change Mobile App to an anchor link (assumes app download component has id="app-download")
        { name: "Mobile App", path: "/#app-download" }, 
        { name: "Contact Us", path: "/contact" },
    ];
    
    // 🎯 NEW LINK: For the new page
    const topSellingItem = { name: "Top Selling", path: "/top-selling" };


    // Component to handle smooth scrolling for anchor links, or simple Link for pages
    const NavLinkItem = ({ item }) => {
        // Check if the path is an anchor link (starts with /#)
        const isAnchor = item.path.startsWith('/#');

        const handleClick = (e) => {
            setIsOpen(false); // Close mobile menu
            if (isAnchor && item.path.length > 2) {
                // If it's an anchor, prevent default routing and manually scroll
                e.preventDefault();
                const targetId = item.path.substring(2); // Get "explore-menu" or "app-download"
                
                // Use a short timeout to ensure the DOM is ready if routing from a different page
                setTimeout(() => {
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        // Scroll smoothly to the target element's position
                        window.scrollTo({
                            top: targetElement.offsetTop,
                            behavior: "smooth"
                        });
                    }
                }, 100); 
            }
        };

        return (
            <li 
                className="cursor-pointer relative group p-2" 
                onClick={handleClick}
            >
                <Link to={item.path}>
                    {item.name}
                    {/* Orange underline effect */}
                    <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
            </li>
        );
    };
    
    return (
        <div className="flex justify-between items-center px-3 md:px-6 py-4 shadow-md bg-white relative z-50">
            <Link to="/">
                {/* Keeping the logo from assets */}
                <img src={assets.logo} alt="FoodiGO Logo" className="h-10" />
            </Link>

            {/* Desktop Navigation Links */}
            <ul className="hidden md:flex space-x-6 font-medium">
                {navItems.map((item, index) => (
                    <NavLinkItem key={index} item={item} />
                ))}
                {/* 🎯 NEW DESKTOP LINK: Top Selling */}
                <NavLinkItem item={topSellingItem} /> 
            </ul>

            <div className="flex items-center space-x-4 relative">
                
                {/* Search Icon */}
                <IoSearchOutline 
                    size={24} 
                    className="text-gray-600 cursor-pointer hover:text-orange-500 transition-colors hidden md:block"
                />

                {/* Favorites Icon */}
                <Link to="/favorites" className="relative p-1" onClick={() => setIsOpen(false)}>
                    <FaHeart 
                        size={22} 
                        color="#FF4500" // Reddish-Orange
                        className="cursor-pointer hover:scale-110 transition-transform" 
                    />
                    {token && favorites.length > 0 && ( 
                        <div className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full"></div>
                    )}
                </Link>

                {/* Message History Icon (Desktop) */}
                {token && (
                    <Link to="/mymessages" className="relative p-1" onClick={() => setIsOpen(false)}>
                        <IoMailOutline
                            size={24}
                            className="text-gray-600 cursor-pointer hover:text-orange-500 transition-colors"
                        />
                    </Link>
                )}
                
                {/* Cart Icon */}
                <Link to="/cart" className="relative" onClick={() => setIsOpen(false)}>
                    <IoCartOutline 
                        size={26} 
                        className="text-gray-600 cursor-pointer hover:text-orange-500 transition-colors"
                    />
                    {gettotalcartamount() > 0 && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                </Link>

                {/* Profile Dropdown / Sign In Button (Desktop) */}
                {token ? (
                    <div className="relative hidden md:block">
                        <IoPersonCircleOutline 
                            size={32} 
                            className="text-gray-600 cursor-pointer hover:text-orange-500 transition-colors"
                            onClick={() => setProfileMenu(!profileMenu)}
                        />

                        {profileMenu && (
                            <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-lg shadow-xl flex flex-col z-10 py-1">
                                <Link to="/myorders" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors" onClick={() => setProfileMenu(false)}>
                                    <IoBagHandleOutline size={18} /> My Orders
                                </Link>
                                <Link to="/myschedules" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors" onClick={() => setProfileMenu(false)}>
                                    <IoCalendarOutline size={18} /> My Schedules
                                </Link>
                                <Link to="/mymessages" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors" onClick={() => setProfileMenu(false)}>
                                    <IoMailOutline size={18} /> My Messages
                                </Link>
                                {/* 🎯 NEW DESKTOP PROFILE LINK: Top Selling */}
                                <Link to="/top-selling" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors" onClick={() => setProfileMenu(false)}>
                                    <IoTrendingUpOutline size={18} /> Top Selling
                                </Link>
                                <hr className="my-1 border-gray-200"/>
                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm text-left text-gray-700 hover:bg-orange-50 w-full transition-colors">
                                    <IoLogOutOutline size={18} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button onClick={() => setshowlogin(true)} className="hidden md:block px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-md">
                        Sign In
                    </button>
                )}

                {/* Mobile Menu Button */}
                <button className="md:hidden p-1 text-gray-700" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden flex flex-col items-start px-6 py-4 border-t border-gray-200 z-40">
                    <ul className="w-full text-lg space-y-2 font-medium mb-4">
                        {navItems.map((item, index) => (
                            <NavLinkItem key={index} item={item} />
                        ))}
                        {/* 🎯 NEW MOBILE LINK: Top Selling */}
                        <NavLinkItem item={topSellingItem} />
                    </ul>
                    
                    <hr className="w-full mb-4 border-gray-200"/>
                    
                    {token ? (
                        <div className="w-full">
                            <Link to="/myorders" className="flex items-center gap-3 px-2 py-2 text-base text-gray-700 hover:bg-orange-50 w-full transition-colors" onClick={() => setIsOpen(false)}>
                                <IoBagHandleOutline size={20} /> My Orders
                            </Link>
                            <Link to="/myschedules" className="flex items-center gap-3 px-2 py-2 text-base text-gray-700 hover:bg-orange-50 w-full transition-colors" onClick={() => setIsOpen(false)}>
                                <IoCalendarOutline size={20} /> My Schedules
                            </Link>
                            <Link to="/mymessages" className="flex items-center gap-3 px-2 py-2 text-base text-gray-700 hover:bg-orange-50 w-full transition-colors" onClick={() => setIsOpen(false)}>
                                <IoMailOutline size={20} /> My Messages
                            </Link>
                            {/* 🎯 NEW MOBILE PROFILE LINK: Top Selling */}
                            <Link to="/top-selling" className="flex items-center gap-3 px-2 py-2 text-base text-gray-700 hover:bg-orange-50 w-full transition-colors" onClick={() => setIsOpen(false)}>
                                <IoTrendingUpOutline size={20} /> Top Selling
                            </Link>
                            <button onClick={handleLogout} className="flex items-center gap-3 px-2 py-2 text-base text-left text-gray-700 hover:bg-orange-50 w-full transition-colors">
                                <IoLogOutOutline size={20} /> Logout
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => { setshowlogin(true); setIsOpen(false); }} className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md">
                            Sign In
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Navbar;