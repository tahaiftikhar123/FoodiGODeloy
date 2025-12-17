import React, { useState, useContext } from "react";
import { StoreContext } from "../../context/storecontext";
import axios from "axios";
import { toast } from "react-toastify";

const Contact = () => {
    const { url, token } = useContext(StoreContext);
    
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

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        
        // ✅ Login Validation: Prevent submission if no token exists
        if (!token) {
            toast.error("You must be logged in to send a message.");
            return;
        }

        if (!data.name || !data.email || !data.subject || !data.message) {
            toast.error("Please fill out all fields.");
            return;
        }

        try {
            // We can now assume token exists because of the check above
            const response = await axios.post(
                url + "/api/message/send", 
                data, 
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success("Your message has been sent to the admin.");
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
            
            {/* ✅ Conditional Instruction Message */}
            {!token ? (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
                    <p className="text-orange-700 font-medium text-center">
                        Please <strong>Login</strong> to access our support and complaint system.
                    </p>
                </div>
            ) : (
                <p className="text-center text-gray-600 mb-10">
                    Got a question about an order or a suggestion? Send us a message below.
                </p>
            )}

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
                        disabled={!token} // Optional: Disable input if not logged in
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
                        disabled={!token}
                    />
                </div>

                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                        type="text"
                        name="subject"
                        id="subject"
                        onChange={onChangeHandler}
                        value={data.subject}
                        placeholder="e.g., Order #1234 not received"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                        disabled={!token}
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
                        placeholder="Describe your issue..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                        disabled={!token}
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className={`w-full py-3 text-white font-semibold rounded-lg transition duration-200 shadow-md ${
                        token ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                    {token ? "Send Message to Admin" : "Login to Send Message"}
                </button>
            </form>
        </div>
    );
};

export default Contact;