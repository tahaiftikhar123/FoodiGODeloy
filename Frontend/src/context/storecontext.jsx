import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartitems] = useState({});
    const [favorites, setFavorites] = useState([]);
    const url = "http://localhost:4000";
    const [food_list, setFoodlist] = useState([]);
    const [category_list, setCategoryList] = useState([]);
    const [token, setToken] = useState("");

    const { setshowlogin } = props;

    const checkAuthAndNotify = () => {
        if (!token) {
            toast.error("Please login to proceed.");
            setshowlogin(true);
            return false;
        }
        return true;
    };

    const logout = (message) => {
        setToken("");
        localStorage.removeItem("token");
        setCartitems({});
        setFavorites([]);
        toast.info(message);
    };

    const decodeToken = (t) => {
        try {
            return JSON.parse(atob(t.split(".")[1]));
        } catch (e) {
            console.error("Failed to decode token:", e);
            return null;
        }
    };

    const addtocart = async (itemId) => {
        if (!checkAuthAndNotify()) return;

        setCartitems((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1,
        }));

        try {
            const res = await axios.post(
                url + "/api/cart/add",
                { itemId },
                { headers: { token } }
            );
            if (res.data.success) {
                toast.success("Item added to cart 🛒");
            } else {
                toast.error(res.data.message || "Failed to add item");
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("Error adding to cart");
        }
    };

    const removefromcart = async (itemId) => {
        if (!checkAuthAndNotify()) return;

        setCartitems((prev) => {
            if (!prev[itemId]) return prev;
            const updated = { ...prev, [itemId]: prev[itemId] - 1 };
            if (updated[itemId] <= 0) delete updated[itemId];
            return updated;
        });

        try {
            await axios.post(
                url + "/api/cart/remove",
                { itemId },
                { headers: { token } }
            );
            toast.info("Item removed from cart", {
                icon: "🗑️",
                progressStyle: {
                    background: "linear-gradient(90deg, #ff4d4d, #ffcc00)",
                },
            });
        } catch (error) {
            console.error("Error removing from cart:", error);
            toast.error("Error removing item!");
        }
    };

    const gettotalcartamount = () => {
        let totalAmount = 0;
        for (const itemId in cartItems) {
            if (cartItems[itemId] > 0) {
                const itemInfo = food_list.find(
                    (product) => String(product._id) === String(itemId)
                );
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[itemId];
                }
            }
        }
        return totalAmount;
    };

    const fetchFoodlist = async () => {
        const response = await axios.get(url + "/api/food/list");
        setFoodlist(response.data.data);
    };

    const fetchCategoryList = async () => {
        try {
            const response = await axios.get(url + "/api/category/list");
            if (response.data.success) {
                setCategoryList(response.data.data);
            } else {
                console.error("Failed to fetch categories:", response.data.message);
            }
        } catch (error) {
            console.error("Network error fetching categories:", error);
        }
    };

    const fetchCart = async (userToken) => {
        try {
            const response = await axios.post(
                url + "/api/cart/get",
                {},
                { headers: { token: userToken } }
            );
            if (response.data.success) {
                setCartitems(response.data.cartData);
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    };

    const fetchFavorites = async (userToken) => {
        try {
            const response = await axios.post(
                url + "/api/favorites/get",
                {},
                { headers: { token: userToken } }
            );
            if (response.data.success && Array.isArray(response.data.favorites)) {
                setFavorites(response.data.favorites.map(id => id.toString())); 
            } else {
                setFavorites([]);
            }
        } catch (error) {
            console.error("Error fetching favorites:", error);
            setFavorites([]);
        }
    };

    const toggleFavoriteStatus = async (itemId) => {
        if (!checkAuthAndNotify()) return;
        
        try {
            const response = await axios.post(
                url + "/api/favorites/toggle",
                { itemId },
                { headers: { token } }
            );

            if (response.data.success) {
                if (response.data.action === "add") {
                    setFavorites(prev => [...prev, itemId]);
                    toast.success("Added to favorites ❤️");
                } else {
                    setFavorites(prev => prev.filter(id => id !== itemId));
                    toast.info("Removed from favorites 💔");
                }
            } else {
                toast.error(response.data.message || "Failed to update favorites.");
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            toast.error("Error connecting to server to update favorites.");
        }
    };
    
    useEffect(() => {
        async function loadData() {
            await fetchFoodlist();
            await fetchCategoryList(); 

            const savedToken = localStorage.getItem("token");
            if (savedToken) {
                setToken(savedToken);
                await fetchCart(savedToken);
                await fetchFavorites(savedToken);
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        let logoutTimeout;

        if (token) {
            fetchFavorites(token);

            const decoded = decodeToken(token);
            if (decoded && decoded.exp) {
                const expiryTime = decoded.exp * 1000;
                const currentTime = Date.now();
                const timeRemaining = expiryTime - currentTime;

                if (timeRemaining <= 0) {
                    logout("Your session has expired. Please log in again.");
                } else {
                    logoutTimeout = setTimeout(() => {
                        logout("Your session has expired due to inactivity. Please log in again.");
                    }, timeRemaining);
                }
            }
        } else {
            setFavorites([]);
        }

        return () => {
            if (logoutTimeout) clearTimeout(logoutTimeout);
        };
    }, [token]);

    const contextValue = {
        food_list,
        category_list,
        cartItems,
        setCartitems,
        addtocart,
        removefromcart,
        gettotalcartamount,
        url,
        token,
        setToken,
        logout,
        favorites,
        toggleFavoriteStatus,
        fetchFavorites
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;