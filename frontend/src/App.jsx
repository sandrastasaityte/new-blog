import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import Home from "./Components/Home/Home";
import Blogs from "./Components/Blogs/Blogs";
import Contact from "./Components/Contact/Contact";
import AddBlog from "./Components/AddBlog/AddBlog";
import About from "./Components/About/About";
import Login from "./Components/Login/Login";
import SignUp from "./Components/SignUp/SignUp.jsx";


const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <Router>
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        onSignUpClick={() => setShowSignUp(true)}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/add-blog" element={<AddBlog />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer />

      {/* Login Popup */}
      {showLogin && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-popup" onClick={() => setShowLogin(false)}>X</button>
            <Login />
          </div>
        </div>
      )}

      {/* SignUp Popup */}
      {showSignUp && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-popup" onClick={() => setShowSignUp(false)}>X</button>
            <SignUp />
          </div>
        </div>
      )}
    </Router>
  );
};

export default App;
