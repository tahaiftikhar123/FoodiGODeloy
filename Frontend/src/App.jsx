import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import DownloadApp from "./components/App_download/DownloadApp";
import LoginPopup from "./components/LoginPopup/LoginPopup.jsx";
import { TopSelling } from "./pages/TopSelling/TopSelling.jsx";

import Home from "./pages/Home/home.jsx";
import Cart from "./pages/cart/cart";
import PlaceOrder from "./pages/placeorder/placeorder";
import { Verify } from "./pages/Verify/Verify.jsx";
import { MyOrders } from "./pages/MyOrders/MyOrders.jsx";
import { MySchedules } from "./pages/MySchedules/MySchedules.jsx";
import Favorites from "./pages/Favorites/Favorites";
import Contact from "./pages/contact/contact.jsx";
import MyMessages from "./pages/MyMessages/MyMessages.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
    const [showlogin, setshowlogin] = useState(false);

    return (
        <>
            {showlogin && <LoginPopup setshowlogin={setshowlogin} />}

            <div className="app">
                <Navbar setshowlogin={setshowlogin} />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/order" element={<PlaceOrder />} />
                    <Route path="/verify" element={<Verify />} />
                    <Route path="/myorders" element={<MyOrders />} />
                    <Route path="/myschedules" element={<MySchedules />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/mymessages" element={<MyMessages />} />
                    <Route path="/top-selling" element={<TopSelling />}/>
                </Routes>

                <DownloadApp id="app-download" />

                <Footer />
            </div>

            <ToastContainer position="top-right" autoClose={2000} />
        </>
    );
};

export default App;