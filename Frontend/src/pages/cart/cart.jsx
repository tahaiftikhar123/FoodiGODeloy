import React, { useContext, useState } from "react";
import { StoreContext } from "../../context/storecontext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, food_list, removefromcart, gettotalcartamount, url } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  const subtotal = gettotalcartamount();
  const deliveryFee = subtotal > 0 ? 2 : 0;

  const discountedSubtotal = Math.max(0, subtotal - promoDiscount);
  const total = discountedSubtotal + deliveryFee;

  const handleApplyPromo = () => {
    const validPromoCode = "foodigo";
    const discountPercentage = 0.05;

    setPromoDiscount(0);
    setIsPromoApplied(false);
    setPromoError("");

    if (promoCodeInput.toLowerCase() === validPromoCode) {
      const calculatedDiscount = subtotal * discountPercentage;
      setPromoDiscount(calculatedDiscount);
      setIsPromoApplied(true);
    } else {
      setPromoError("Invalid promo code. Please try again.");
    }
  };

  return (
    <div className="cart px-3 sm:px-4 py-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-orange-500 mb-6">Your Cart</h2>

      <div className="hidden md:grid grid-cols-6 gap-4 font-semibold border-b border-gray-300 pb-2 text-gray-700">
        <p>Item</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>

      <div className="space-y-4 mt-4">
        {food_list.map((item) =>
          cartItems[item._id] > 0 ? (
            <div
              key={item._id}
              className="border-b border-gray-200 pb-3 md:grid md:grid-cols-6 md:gap-4 md:items-center"
            >
              <div className="hidden md:block">
                <img
                  src={url + "/images/" + item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </div>

              <p className="hidden md:block font-medium text-gray-800">
                {item.name}
              </p>

              <p className="hidden md:block text-gray-600">${item.price}</p>

              <p className="hidden md:block">{cartItems[item._id]}</p>

              <p className="hidden md:block font-semibold text-orange-500">
                ${item.price * cartItems[item._id]}
              </p>

              <button
                onClick={() => removefromcart(item._id)}
                className="hidden md:block text-red-500 hover:text-red-700 font-bold"
              >
                X
              </button>

              <div className="flex md:hidden items-center gap-3">
                <img
                  src={url + "/images/" + item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Price: <span className="font-medium">${item.price}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Qty:{" "}
                    <span className="font-medium">{cartItems[item._id]}</span>
                  </p>
                  <p className="text-sm font-semibold text-orange-500">
                    Total: ${item.price * cartItems[item._id]}
                  </p>
                </div>

                <button
                  onClick={() => removefromcart(item._id)}
                  className="text-red-500 hover:text-red-700 font-bold text-lg"
                >
                  X
                </button>
              </div>
            </div>
          ) : null
        )}
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4">Cart Total</h2>

          <div className="flex justify-between mb-2">
            <p>Subtotal</p>
            <p>${subtotal.toFixed(2)}</p>
          </div>

          {isPromoApplied && (
            <>
              <div className="flex justify-between my-2 text-green-600 font-semibold">
                <p>Discount (5% Off)</p>
                <p>-${promoDiscount.toFixed(2)}</p>
              </div>
              <hr />
            </>
          )}

          <div className="flex justify-between my-2">
            <p>Delivery Fee</p>
            <p>${deliveryFee.toFixed(2)}</p>
          </div>

          <hr />

          <div className="flex justify-between font-bold text-gray-800 mt-2 text-xl">
            <p>Total</p>
            <p>${total.toFixed(2)}</p>
          </div>

          <button
            onClick={() => navigate("/order")}
            className="mt-4 w-full md:w-auto bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition"
          >
            Proceed to Checkout
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <p className="mb-2 text-gray-700 font-medium">
            Enter a promo code for a discount!
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter code"
              value={promoCodeInput}
              onChange={(e) => {
                setPromoCodeInput(e.target.value);
                if (!isPromoApplied) setPromoError("");
              }}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <button
              onClick={handleApplyPromo}
              className={`text-white px-4 py-2 rounded-md transition ${
                isPromoApplied
                  ? "bg-green-600 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {isPromoApplied ? "Applied ✅" : "Apply"}
            </button>
          </div>

          {promoError && (
            <p className="mt-2 text-sm text-red-500 font-medium">
              ❌ {promoError}
            </p>
          )}

          {isPromoApplied && (
            <p className="mt-2 text-sm text-green-600 font-medium">
              ✅ Promo code applied! You received a 5% discount.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
