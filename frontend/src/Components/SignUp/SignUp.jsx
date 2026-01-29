import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SignUp.css";
import { register as registerAPI } from "../../lib/authApi";

export default function SignUp({ setToken, closePopup, onSuccess, onSwitchToLogin }) {
  const [form, setForm] = useState({ name:"", email:"", password:"", confirmPassword:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(""); };
  const validate = () => !form.name?"Enter your name":!form.email.includes("@")?"Valid email required":!form.password?"Enter password":form.password.length<6?"Password min 6 chars":form.password!==form.confirmPassword?"Passwords do not match":"";

  const handleSubmit = async e => {
    e.preventDefault();
    const msg = validate(); if(msg) return setError(msg);
    try {
      setLoading(true);
      const data = await registerAPI(form.email, form.password);
      if(!data?.token) return setError("Sign up failed.");
      localStorage.setItem("token", data.token);
      setToken?.(data.token);
      localStorage.setItem("user", JSON.stringify(data.user||{name:form.name,email:form.email}));
      onSuccess?.(); closePopup?.();
      setForm({name:"",email:"",password:"",confirmPassword:""});
    } catch { setError("An error occurred. Try again."); } 
    finally { setLoading(false); }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-form">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} disabled={loading} required/>
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} disabled={loading} required/>
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} disabled={loading} required/>
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} disabled={loading} required/>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>{loading?"Creating account...":"Sign Up"}</button>
        </form>
        <p className="signup-switch">Already have an account? <button type="button" className="toggle-link" onClick={onSwitchToLogin}>Login</button></p>
      </div>
    </div>
  );
}
