import React from "react";
import "./Footer.css";
import { FaFacebookF, FaInstagram, FaTwitter, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  const owners = [
    { name: "TAHA IFTIKHAR", email: "tahaiftikhar691@gmail.com" },
    { name: "WAJIHA NOOR", email: "wajihanoor642@gmail.com" },
    { name: "AYEZA ZAFAR", email: "ayezazafar444@gmail.com" },
  ];

  return (
    <footer id="contact" className="footer">
      <div className="footer-container">
        
        {/* Brand Section */}
        <div className="footer-left">
          <h2 className="footer-logo">Foodi<span>GO</span></h2>
          <p>
            Bringing delicious meals right to your doorstep. We believe in 
            fresh ingredients, fast delivery, and great taste every time.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
          </div>
        </div>

        {/* Owners Section - The Engaging Part */}
        <div className="footer-owners">
          <h3>Project Visionaries</h3>
          <div className="owner-grid">
            {owners.map((owner, index) => (
              <div key={index} className="owner-card">
                <span className="owner-name">{owner.name}</span>
                <a href={`mailto:${owner.email}`} className="owner-email">
                  <FaEnvelope className="email-icon" /> Contact
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-middle">
          <h3>Company</h3>
          <ul>
            <li>About Us</li>
            <li>Careers</li>
            <li>Blog</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} FoodiGO. Crafted with passion.</p>
      </div>
    </footer>
  );
};

export default Footer;