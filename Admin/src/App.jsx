import React, { useState, useEffect } from "react";
import Navbar from "./components/navbar/Navbar.jsx";
import Sidebar from "./components/sidebar/sidebar";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import AddCategory from "./pages/Category/AddCategory";
import ListCategory from "./pages/ListCategory/ListCategory";
import MessageList from "./pages/MessageList/MessageList.jsx";
import ListSchedules from "./pages/ListSchedules/ListSchedules.jsx";
import AdminLogin from "./components/AdminLogin/AdminLogin.jsx";

const App = () => {
  const url = "http://localhost:4000";

  // States for Login and Token
  const [showLogin, setshowLogin] = useState(false);
  const [token, setToken] = useState("");

  // Check for stored token and control login modal
  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (storedToken) {
      setToken(storedToken);
      setshowLogin(false);
    } else {
      setToken("");
      setshowLogin(true);
    }
  }, [showLogin]); 

  return (
    <div className="app-container">
      {}
      {showLogin && <AdminLogin setshowLogin={setshowLogin} url={url} />}

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastStyle={{ backgroundColor: "#ff6600", color: "#fff", fontWeight: "bold" }}
      />

      <Navbar />
      <hr style={{ display: "none" }} />

      <div className="app-content">
        {token ? (
          <>
            <Sidebar />
            <div className="main-content">
              <Routes>
                <Route path="/add" element={<Add url={url} token={token} />} />
                <Route path="/list" element={<List url={url} token={token} />} />
                <Route path="/orders" element={<Orders url={url} token={token} />} />
                <Route path="/addcategory" element={<AddCategory url={url} token={token} />} />
                <Route path="/listcategory" element={<ListCategory url={url} token={token} />} />
                <Route path="/messages" element={<MessageList url={url} token={token} />} />
                <Route path="/schedules" element={<ListSchedules url={url} token={token}/>}/>
              </Routes>
            </div>
          </>
        ) : (
          <div className="w-full text-center py-20 text-xl font-medium">
            Please login to access the Admin Panel.
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
