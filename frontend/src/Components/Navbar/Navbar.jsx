import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./Navbar.css";
import Login from "../Login/Login";
import SignUp from "../SignUp/SignUp";

const Navbar = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <Link to="/">MyEconomics</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/blogs">Blogs</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
        <div className="user-icon" onClick={() => setShowPopup(true)}>
          <FaUserCircle size={28} />
        </div>
      </nav>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-container">
            <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>

            <div className="tabs">
              <button
                className={isLogin ? "active" : ""}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={!isLogin ? "active" : ""}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            {isLogin ? <Login /> : <SignUp />}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
