import React, { useContext, useState, useEffect, useRef } from "react";
import { StoreContext } from "../../context/storecontext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// Make sure these CSS files are correctly processed by your build tool (e.g., Webpack/Vite)
import 'leaflet/dist/leaflet.css'; 
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'; 

// Utility function for reverse geocoding (finding address from lat/lng)
const fetchAddressFromCoords = async (lat, lng) => {
    // Using Nominatim (OpenStreetMap's free geocoding service)
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        return null;
    }
};

const PlaceOrder = () => {
    const { gettotalcartamount, token, food_list, cartItems, url, clearCart } = useContext(StoreContext);
    const navigate = useNavigate();

    const mapRef = useRef(null);
    const markerRef = useRef(null);
    
    // Delivery Address and Coordinates State
    const [data, setData] = useState({
        firstName: "", lastName: "", email: "", street: "", city: "",
        state: "", zipcode: "", country: "", phone: "",
        latitude: "", 
        longitude: "", 
    });

    const [isModalOpen, setIsModalState] = useState(false)
    const [scheduleData, setScheduleData] = useState({
        deliveryDate:"", deliveryTime:"", recurrenceRule:"one-time"
    })
    
    const subtotal=gettotalcartamount()
    const deliveryFee=subtotal>0?2:0
    const total=subtotal+deliveryFee

    const onChangeHandler=e=>{
        const{name,value}=e.target
        setData(prev=>({...prev,[name]:value}))
    }

    const onScheduleChangeHandler=e=>{
        const{name,value}=e.target
        setScheduleData(prev=>({...prev,[name]:value}))
    }

    const getTodayDate=()=>{
        const today=new Date()
        return today.toISOString().split("T")[0]
    }

    const getCurrentTime=()=>{
        const now=new Date()
        const hours=String(now.getHours()).padStart(2,"0")
        const minutes=String(now.getMinutes()).padStart(2,"0")
        return`${hours}:${minutes}`
    }

    const isAddressValid=()=>{
        for(const key in data){
            if(data[key]==="" && key !== 'latitude' && key !== 'longitude')return false
        }
        return true
    }

    const validateScheduleSubmission=()=>{
        if(!isAddressValid()){
            toast.error("Please fill in all delivery information details first.")
            return false
        }
        if(!scheduleData.deliveryDate||!scheduleData.deliveryTime){
            toast.error("Please select a delivery date and time.")
            return false
        }
        const deliveryTimestamp=new Date(`${scheduleData.deliveryDate}T${scheduleData.deliveryTime}:00`)
        const now=new Date()
        if(deliveryTimestamp<=now){
            toast.error("Scheduled delivery time must be in the future.")
            return false
        }
        return true
    }

    useEffect(() => {
        if (gettotalcartamount() === 0) {
            toast.error("Cart is empty.");
            navigate("/cart");
        }
        if (!token) {
            toast.error("Please log in to place an order.");
            navigate("/cart");
        }
    }, [token, gettotalcartamount, navigate]);

    // 🎯 Leaflet Map Initialization, Click, and Search Logic
    useEffect(() => {
        // Dynamic import of Leaflet library and Geocoder plugin
        import("leaflet").then(async ({ default: L }) => {
            // Import Geocoder plugin
            const { default: Geocoder } = await import("leaflet-control-geocoder");

            // --- CRITICAL ICON FIX --- 
            // Fixes missing marker icon issue caused by Webpack bundling Leaflet
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
            });

            const initialCoords = [24.8607, 67.0011]; // Defaulting to Karachi
            
            if (!mapRef.current && document.getElementById('map-container')) {
                // Initialize map
                const map = L.map("map-container").setView(initialCoords, 13);
                mapRef.current = map;

                // Add OpenStreetMap tiles
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                }).addTo(map);

                /* ---- Central Handler (Updates state and marker) ---- */
                const updateLocation = async (lat, lng) => {
                    // Update marker position
                    if (markerRef.current) {
                        markerRef.current.setLatLng([lat, lng]);
                    } else {
                        markerRef.current = L.marker([lat, lng]).addTo(map);
                    }

                    // Pan/Zoom map to selected location
                    map.setView([lat, lng], 16);

                    // Reverse geocode to get human-readable address
                    const addressData = await fetchAddressFromCoords(lat, lng);

                    if (addressData?.address) {
                        const addr = addressData.address;
                        
                        // Update React state with geocoded data
                        setData(prev => ({
                            ...prev,
                            street: addr.road || addr.footway || addr.place || "",
                            city: addr.city || addr.town || addr.village || addr.county || "",
                            state: addr.state || "",
                            zipcode: addr.postcode || "",
                            country: addr.country || "",
                            latitude: lat.toFixed(6),
                            longitude: lng.toFixed(6),
                        }));
                        toast.info(`Location set to: ${addr.road || addr.city || addr.country}`);
                    } else {
                        toast.warning("Could not determine full address for this location. Coordinates saved.");
                        setData(prev => ({ 
                            ...prev, 
                            latitude: lat.toFixed(6), 
                            longitude: lng.toFixed(6) 
                        }));
                    }
                };

                /* ---- 1. Map Click Selection ---- */
                map.on("click", e => {
                    const { lat, lng } = e.latlng;
                    updateLocation(lat, lng);
                });

                /* ---- 2. Search Control Integration (Geocoder) ---- */
                L.Control.geocoder({
    defaultMarkGeocode: false,
    placeholder: "Search for an address...",
    errorMessage: "Nothing found.",
    geocoder: L.Control.Geocoder.nominatim(),
    position: "topleft"
})
.on("markgeocode", function (e) {
    const { lat, lng } = e.geocode.center;
    updateLocation(lat, lng);
})
.addTo(map);

            }
        });

        // Cleanup function: removes the map instance
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); 


    // --- Order Placement Logic ---
    const placeOrder = async e => {
        e.preventDefault()
        if (!isAddressValid() && !data.latitude) {
            toast.error("Please fill in all delivery information details or select a location on the map.");
            return
        }
        if (total < 0.50) { 
            toast.error("Total order amount must be at least $0.50 for payment.");
            return
        }
        let orderItems = []
        food_list.forEach(item => {
            if (cartItems[item._id] > 0) {
                orderItems.push({...item, quantity: cartItems[item._id]})
            }
        })
        let orderData = {address: data, items: orderItems, amount: total}
        try{
            const response = await axios.post(url+"/api/order/place",orderData,{headers:{token}})
            if(response.data.success){
                const{session_url} = response.data
                if(session_url){
                    window.location.replace(session_url)
                }else{
                    toast.error("Stripe session URL missing.")
                }
            }else{
                toast.error(response.data.message||"Error placing order.")
            }
        }catch(error){
            toast.error(error.response?.data?.message||"A network error occurred.")
        }
    }

    // --- Schedule Submission Logic ---
    const handleScheduleSubmit = async e => {
        e.preventDefault()
        if(!validateScheduleSubmission())return
        let orderItems=[]
        food_list.forEach(item=>{
            if(cartItems[item._id]>0){
                orderItems.push({...item,quantity:cartItems[item._id]})
            }
        })
        const deliveryTimestamp=new Date(`${scheduleData.deliveryDate}T${scheduleData.deliveryTime}`)
        const schedulePayload={
            address:data,
            items:orderItems,
            amount:total,
            scheduleType:scheduleData.recurrenceRule==="one-time"?"one-time":"recurring",
            deliveryTimestamp:deliveryTimestamp.toISOString(),
            recurrenceRule:scheduleData.recurrenceRule==="one-time"?null:scheduleData.recurrenceRule,
            paymentMethodId:"pm_card_visa"
        }
        try{
            const response=await axios.post(url+"/api/schedule/create",schedulePayload,{headers:{token}})
            if(response.data.success){
                toast.success("Your order has been successfully scheduled!")
                if(clearCart)clearCart()
                setIsModalState(false)
                navigate("/myschedules")
            }else{
                toast.error(response.data.message||"Failed to schedule order.")
            }
        }catch(error){
            toast.error(error.response?.data?.message||"A network error occurred while scheduling.")
        }
    }

    const handleOpenModal=()=>{
        if(!isAddressValid()){
            toast.error("Please fill in all delivery information details first.")
            return
        }
        setIsModalState(true)
    }


    return(
        <div className="px-4 sm:px-6 lg:px-12 py-8 max-w-6xl mx-auto">
            <form onSubmit={placeOrder} className="grid grid-cols-1 gap-8">
                
                {/* --- TOP ROW: Delivery Info and Summary (Side-by-Side) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* LEFT: Delivery Information */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-xl font-bold text-orange-500 mb-4">Delivery Information</p>
                        <div className="grid grid-cols-2 gap-4">
                            <input name="firstName" value={data.firstName} onChange={onChangeHandler} required placeholder="First Name" className="border rounded-md px-3 py-2" />
                            <input name="lastName" value={data.lastName} onChange={onChangeHandler} required placeholder="Last Name" className="border rounded-md px-3 py-2" />
                        </div>
                        <input name="email" value={data.email} onChange={onChangeHandler} required placeholder="Email Address" className="w-full mt-4 border rounded-md px-3 py-2" />
                        
                        {/* Address Fields */}
                        <input name="street" value={data.street} onChange={onChangeHandler} required placeholder="Street" className="w-full mt-4 border rounded-md px-3 py-2" />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <input name="city" value={data.city} onChange={onChangeHandler} required placeholder="City" className="border rounded-md px-3 py-2" />
                            <input name="state" value={data.state} onChange={onChangeHandler} required placeholder="State" className="border rounded-md px-3 py-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <input name="zipcode" value={data.zipcode} onChange={onChangeHandler} required placeholder="Zip Code" className="border rounded-md px-3 py-2" />
                            <input name="country" value={data.country} onChange={onChangeHandler} required placeholder="Country" className="border rounded-md px-3 py-2" />
                        </div>
                        <input name="phone" value={data.phone} onChange={onChangeHandler} required placeholder="Phone" className="w-full mt-4 border rounded-md px-3 py-2" />
                        
                        {/* Hidden fields for coordinates */}
                        <input type="hidden" name="latitude" value={data.latitude} />
                        <input type="hidden" name="longitude" value={data.longitude} />
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="bg-gray-50 p-6 rounded-lg shadow-md flex flex-col h-full">
                        <p className="text-xl font-bold mb-4">Order Summary</p>
                        <div className="flex justify-between"><p>Subtotal</p><p>${subtotal.toFixed(2)}</p></div>
                        <div className="flex justify-between my-2"><p>Delivery Fee</p><p>${deliveryFee.toFixed(2)}</p></div>
                        <div className="flex justify-between font-bold mt-2"><p>Total</p><p>${total.toFixed(2)}</p></div>
                        <div className="mt-auto pt-6 space-y-3">
                            <button type="submit" className="w-full bg-gray-800 text-white py-3 rounded-md hover:bg-gray-700 transition">Proceed to Payment</button>
                            <button type="button" onClick={handleOpenModal} className="w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-600 transition">Schedule Order for Later</button>
                        </div>
                    </div>
                </div>

                {/* --- BOTTOM ROW: MAP CONTAINER (with Search Control) --- */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <p className="text-xl font-bold text-gray-800 mb-4">Confirm Location on Map (Use Search or Click)</p>
                    <div id="map-container" className="w-full rounded-lg" style={{ height: '500px' }}>
                        {/* Leaflet map and search control renders here automatically */}
                    </div>
                    {data.latitude && (
                            <p className="text-sm text-gray-600 mt-2">Selected Coords: **{data.latitude}**, **{data.longitude}**</p>
                    )}
                </div>
            </form>

            {/* --- Modal for Scheduling --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg relative">
                        <button onClick={() => setIsModalState(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">×</button>
                        <h2 className="text-2xl font-bold mb-4">Schedule Your Delivery</h2>
                        <form onSubmit={handleScheduleSubmit} className="space-y-4">
                            <input type="date" name="deliveryDate" value={scheduleData.deliveryDate} onChange={onScheduleChangeHandler} min={getTodayDate()} required className="w-full border rounded-md p-2" />
                            <input type="time" name="deliveryTime" value={scheduleData.deliveryTime} onChange={onScheduleChangeHandler} min={scheduleData.deliveryDate === getTodayDate() ? getCurrentTime() : "00:00"} required className="w-full border rounded-md p-2" />
                            <select name="recurrenceRule" value={scheduleData.recurrenceRule} onChange={onScheduleChangeHandler} className="w-full border rounded-md p-2">
                                <option value="one-time">Just Once</option>
                                <option value="daily">Every Day</option>
                                <option value="weekdays">Weekdays</option>
                                <option value="weekly">Weekly</option>
                            </select>
                            <button type="submit" className="w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-600 transition">Confirm Schedule</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PlaceOrder