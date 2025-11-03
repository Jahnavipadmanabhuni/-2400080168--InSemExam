import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const navigate = useNavigate();
  const bgVideoRef = useRef(null);

  useEffect(() => {
    if (bgVideoRef.current) bgVideoRef.current.playbackRate = 1.0;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const username = formData.username.trim();

    if (!email || !username) {
      alert("Username and email are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const exists = users.find((u) => u.email === email);
    if (exists) {
      alert("User already exists!");
      return;
    }

    const newUser = {
      id: Date.now(),
      username,
      email,
      password: formData.password, // Note: avoid storing plain passwords in production
      role: formData.role || "user",
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Sign-up successful! Please sign in.");
    navigate("/signin");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* background video */}
      <video
        ref={bgVideoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="/images/bg-poster.jpg"
      >
        <source src="/videos/bg.mp4" type="video/mp4" />
      </video>

      {/* fallback image */}
      <img
        src="/images/bg-poster.jpg"
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* subtle dark overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md px-6">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">
          Sign Up
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border p-2 mb-3 rounded text-black placeholder-black"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-2 mb-3 rounded text-black placeholder-black"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border p-2 mb-3 rounded text-black placeholder-black"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border p-2 mb-3 rounded text-black placeholder-black"
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border p-2 mb-3 rounded text-black"
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 w-full rounded hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;