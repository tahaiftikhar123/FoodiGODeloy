import React from "react";
import { assets } from "../../assets/assets";

const DownloadApp = () => {
    return (
        // ✅ ADD THE ID HERE
        <div 
            className="py-12 px-6 flex flex-col items-center text-center" 
            id="app-download"
        >
            {/* Heading */}
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Get the FoodiGO App
            </h2>
            <p className="text-gray-600 mb-8 max-w-lg">
                Download the FoodiGO app to order your favorite meals anytime, anywhere.
            </p>

            {/* Store buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Play Store */}
                <a href="#" target="_blank" rel="noopener noreferrer">
                    <img
                        src={assets.play_store}
                        alt="Google Play"
                        className="h-14 sm:h-16 hover:scale-105 transition-transform duration-300"
                    />
                </a>

                {/* App Store */}
                <a href="#" target="_blank" rel="noopener noreferrer">
                    <img
                        src={assets.app_store}
                        alt="App Store"
                        className="h-14 sm:h-16 hover:scale-105 transition-transform duration-300"
                    />
                </a>
            </div>
        </div>
    );
};

export default DownloadApp;