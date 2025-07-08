import React from "react";
import axios from "axios";
import { useState } from "react";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const register = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        form,
        {
          withCredentials: true, // required if server uses cookies
        }
      );
      console.log("Registration successful:", response.data);
      setIsLogin(true);
    } catch (error) {
      console.error(
        "Registration error:",
        error?.response?.data?.message || error.message
      );
    }
  };

  const login = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email: form.email,
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );
      console.log("Login successful:", response.data);
      // TODO: redirect or store auth state
    } catch (error) {
      console.error(
        "Login error:",
        error?.response?.data?.message || error.message
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login();
    } else {
      await register();
    }
  };

  return (
    <div
      style={{
        maxWidth: "360px",
        margin: "80px auto",
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        {isLogin ? "Login" : "Register"}
      </h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "12px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      <p style={{ marginTop: "14px", textAlign: "center", fontSize: "14px" }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          style={{
            color: "#1976d2",
            background: "none",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
