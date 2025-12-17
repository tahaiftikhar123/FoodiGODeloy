import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../context/storecontext";
import { toast } from "react-toastify";
import { LuPackage } from "react-icons/lu"; 
import { FaTruckLoading, FaCheckCircle, FaBan } from "react-icons/fa"; 

export const MyOrders = () => {
  const [data, setData] = useState([]);
  const { url, token } = useContext(StoreContext);

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const deleteOrder = async (order) => {
    let confirmMessage = "";
    let isCancellable = false;

    // Check if the order is *actively* being delivered
    if (order.status === "Out for delivery" || order.status === "Accepted by Rider") {
        toast.warning("❌ This order cannot be cancelled as it is already on the way!");
        return; // Exit immediately, do not proceed to confirmation
    }

    if (order.status === "Delivered") {
      confirmMessage = "Do you want to remove this delivered order?";
      isCancellable = true;
    } else if (
      order.status === "Pending" ||
      order.status === "In Process" ||
      order.status === "Food Processing"
    ) {
      confirmMessage =
        "This order is still being processed. Do you want to cancel it?\n\n⚠️ Your payment will be reversed.";
      isCancellable = true;
    }

    if (isCancellable) {
      if (window.confirm(confirmMessage)) {
        try {
          await axios.delete(url + `/api/order/remove/${order._id}`, {
            headers: { token },
          });
          
          setData((prev) => prev.filter((o) => o._id !== order._id));

          if (order.status === "Delivered") {
            toast.success("✅ Order removed successfully.");
          } else {
            toast.info("✅ Order cancelled. Payment will be reversed shortly.");
          }
        } catch (error) {
          console.error("Error deleting order:", error);
          toast.error("❌ Failed to remove order. Try again.");
        }
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Helper function to determine button text and if it's disabled
  const getButtonProps = (status) => {
    const isDelivered = status === "Delivered";
    const isEnRoute = status === "Out for delivery" || status === "Accepted by Rider";
    const isCancelledOrFailed = status === "Cancelled" || status === "Failed";
    const isProcessing = status === "Pending" || status === "In Process" || status === "Food Processing";

    let text = "Cancel Order";
    let isDisabled = false;
    let className = "bg-red-500 text-white hover:bg-red-600";
    
    if (isEnRoute || isCancelledOrFailed) {
        // 🎯 FIX: Button for En Route status is disabled and gray
        text = isEnRoute ? "Cannot Cancel (En Route)" : "Order Not Active";
        isDisabled = true;
        className = "bg-gray-300 text-gray-600 cursor-not-allowed";
    } else if (isDelivered) {
        text = "Remove Order History";
        className = "bg-red-500 text-white hover:bg-red-600";
    } else if (isProcessing) {
        text = "Cancel Order";
        className = "bg-red-500 text-white hover:bg-red-600";
    } 
    
    return { text, isDisabled, className };
  };

  return (
    <div className="my-orders px-4 py-6 md:px-10 lg:px-20">
      <h2 className="text-2xl font-bold text-orange-600 mb-6 text-center">
        My Orders
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((order, index) => {
          const { text, isDisabled, className } = getButtonProps(order.status);
          
          let icon = <LuPackage className="text-orange-500" size={40} />;
          if (order.status === "Out for Delivery") {
              icon = <FaTruckLoading className="text-blue-500" size={40} />;
          } else if (order.status === "Delivered") {
              icon = <FaCheckCircle className="text-green-500" size={40} />;
          } else if (order.status === "Cancelled" || order.status === "Failed") {
              icon = <FaBan className="text-red-500" size={40} />;
          }

          return (
            <div
              key={index}
              className="bg-white shadow-md rounded-2xl p-5 border border-gray-100 
                        flex flex-col gap-4 hover:shadow-xl transition duration-300 relative"
            >
              
              {/* Top Section */}
              <div className="flex items-center gap-3">
                {icon}
                <div className="flex-1">
                    <p className="text-gray-700 text-sm font-medium leading-tight">
                        {order.items.map((item, i) =>
                          i === order.items.length - 1
                            ? `${item.name} x ${item.quantity}`
                            : `${item.name} x ${item.quantity}, `
                        )}
                    </p>
                    
                    {/* 🎯 STATIC TIME MESSAGE */}
                    {(order.status === "Out for delivery" || order.status === "Accepted by Rider") && (
                        <p className="text-blue-600 text-sm font-bold mt-1">
                            Arriving within 15 to 20 minutes!
                        </p>
                    )}
                </div>
              </div>

              {/* Order Details */}
              <div className="flex flex-col gap-2 text-gray-600 text-sm border-t pt-4">
                <p className="font-semibold text-lg text-gray-800">
                  Total: ${order.amount}.00
                </p>
                <p>Items: {order.items.length}</p>
                <p className="flex items-center gap-2">
                  <span
                    className={`text-lg ${
                      order.status === "Delivered"
                        ? "text-green-500"
                        : order.status === "Pending" || order.status === "Food Processing" || order.status === "In Process"
                        ? "text-yellow-500"
                        : "text-orange-500"
                    }`}
                  >
                    &#x25cf;
                  </span>
                  <b className="capitalize">{order.status}</b>
                </p>
              </div>

              {/* 🎯 Dynamic Cancel/Remove Button */}
              <button
                onClick={() => deleteOrder(order)}
                disabled={isDisabled}
                className={`mt-3 py-2 px-4 rounded-xl font-semibold transition duration-300 ${className}`}
              >
                {text}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};