import React, { useState, useContext } from "react";
import { StoreContext } from "../../context/storecontext";
import axios from "axios";
import { toast } from "react-toastify";

const Contact = () => {
    const { url, token } = useContext(StoreContext);
    
    // State to hold the form data
    const [data, setData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(prevData => ({ ...prevData, [name]: value }));
    };

    // Handler for form submission
    const onSubmitHandler = async (event) => {
        event.preventDefault();
        
        // Basic Form Validation
        if (!data.name || !data.email || !data.subject || !data.message) {
            toast.error("Please fill out all fields.");
            return;
        }

        try {
            // Include token if the complaint system requires a logged-in user
            // If the system allows guests, the token can be omitted.
            const headers = token ? { token } : {};
            
            const response = await axios.post(
                url + "/api/message/send", 
                data, 
                { headers }
            );

            if (response.data.success) {
                toast.success("Your message has been sent to the admin.");
                // Reset form
                setData({
                    name: "",
                    email: "",
                    subject: "",
                    message: "",
                });
            } else {
                toast.error(response.data.message || "Failed to send message.");
            }

        } catch (error) {
            console.error("Error submitting contact form:", error);
            toast.error("Network error. Could not send message.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto my-12 p-8 shadow-2xl rounded-xl bg-white">
            <h1 className="text-4xl font-bold text-center text-orange-600 mb-6">
                Contact Us
            </h1>
            <p className="text-center text-gray-600 mb-10">
                Got a question about an order, a complaint, or a suggestion? Send us a message, and we'll get back to you as soon as possible.
            </p>

            <form onSubmit={onSubmitHandler} className="space-y-6">
                
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        onChange={onChangeHandler}
                        value={data.name}
                        placeholder="e.g., John Doe"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        onChange={onChangeHandler}
                        value={data.email}
                        placeholder="e.g., john@example.com"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject (e.g., Order Complaint)</label>
                    <input
                        type="text"
                        name="subject"
                        id="subject"
                        onChange={onChangeHandler}
                        value={data.subject}
                        placeholder="e.g., Order #1234 not received"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                    />
                </div>
                
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Message/Complaint</label>
                    <textarea
                        name="message"
                        id="message"
                        onChange={onChangeHandler}
                        value={data.message}
                        rows="5"
                        placeholder="Describe your issue or suggestion..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="w-full py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition duration-200 shadow-md"
                >
                    Send Message to Admin
                </button>
            </form>
        </div>
    );
};

export default Contact;