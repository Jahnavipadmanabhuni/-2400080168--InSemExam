import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const bgVideoRef = useRef(null);

  useEffect(() => {
    if (bgVideoRef.current) bgVideoRef.current.playbackRate = 1.0;
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
      alert("Login successful!");

      // ✅ Role-based redirection
      if (user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/products"); // New Products page for shopping
      }
    } else {
      alert("Invalid credentials!");
    }
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
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md px-6">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">
          Sign In
        </h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 mb-3 rounded text-black placeholder-black"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 mb-3 rounded text-black placeholder-black"
            required
          />

          <button type="submit" className="bg-green-500 text-white px-4 py-2 w-full rounded hover:bg-green-600">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;