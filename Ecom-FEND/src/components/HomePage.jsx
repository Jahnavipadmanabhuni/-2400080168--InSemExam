import { Link } from "react-router-dom";
import React, { useRef, useEffect } from "react";

function HomePage(props) {
  const bgVideoRef = useRef(null);

  // optional: slightly adjust playbackRate for subtle motion
  useEffect(() => {
    if (bgVideoRef.current) bgVideoRef.current.playbackRate = 1.0;
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* looping HD video used as a "live wallpaper" (put mp4 in public/videos/bg.mp4) */}
      <video
        ref={bgVideoRef}
        autoPlay
        loop
        muted
        playsInline
        poster="/images/bg-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover bg-video"
      >
        <source src="/videos/bg.mp4" type="video/mp4" />
      </video>

      {/* fallback image shown if video cannot play */}
      <img
        src="/images/bg-poster.jpg"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* gentle dark overlay for legibility */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative z-10 flex flex-col h-full">
        <nav className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/kllogo.jpg" alt="kllogo" className="w-12 h-12 rounded-full object-cover border border-white/20" />
            <h1 className="text-xl font-bold text-white">Product Management System</h1>
          </div>

          <div className="flex gap-3">
            <Link to="/signin" className="bg-white text-black px-3 py-1 rounded-md font-medium hover:opacity-90 shadow-sm">
              Sign In
            </Link>
            <Link to="/signup" className="border border-white px-3 py-1 rounded-md text-white hover:bg-white hover:text-black transition">
              Sign Up
            </Link>
          </div>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-white drop-shadow-lg">
            Welcome to the Product Management System
          </h2>
          <p className="text-gray-200 text-lg max-w-2xl">
            Manage products seamlessly. Sign in or sign up to get started.
          </p>

          {/* middle section with auth buttons: hide when hideAuthButtons is true */}
          {!props.hideAuthButtons && (
            <div className="home-auth-cta">
              <Link className="btn btn-primary" to="/signup">
                Create account
              </Link>
              <Link className="btn btn-secondary" to="/signin">
                Sign in
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default HomePage;