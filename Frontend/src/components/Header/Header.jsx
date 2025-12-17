import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const Header = () => {
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop",
      title: "Order your favourite food here",
      desc: "Delicious meals delivered right to your doorstep."
    },
    {
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop", 
      title: "Hot & Cheesy Pizzas",
      desc: "Experience the authentic taste of wood-fired ovens."
    },
    {
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1899&auto=format&fit=crop",
      title: "Juicy Gourmet Burgers",
      desc: "Stacked high with fresh veggies and secret sauces."
    }
  ];

  // FIXED SCROLL FUNCTION
  const scrollToMenu = () => {
    const menuSection = document.getElementById('food-display');
    if (menuSection) {
      const yOffset = -70; // Adjust this based on your Navbar height
      const y = menuSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <header className="w-full relative overflow-hidden bg-black mt-0 pt-0">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1000}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        className="h-[300px] md:h-[400px] lg:h-[450px] w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div 
              className="relative w-full h-full flex items-center px-10 md:px-24"
              style={{ 
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0.2) 80%), url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="max-w-2xl text-white">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-2 leading-tight uppercase tracking-tight">
                  {slide.title}
                </h2>
                <p className="text-sm md:text-lg mb-6 text-gray-200 opacity-90 max-w-md italic">
                  {slide.desc}
                </p>
                <button 
                  onClick={scrollToMenu}
                  className="bg-orange-600 text-white font-bold px-10 py-3 rounded-none hover:bg-white hover:text-black transition-all duration-300 text-sm tracking-widest shadow-lg"
                >
                  VIEW MENU
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </header>
  );
};

export default Header;