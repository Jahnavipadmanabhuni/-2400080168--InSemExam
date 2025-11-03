import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Products from "./components/Products";
import Dashboard from "./components/Dashboard";
import AboutUs from "./components/AboutUs";
import ManageProducts from "./components/ManageProducts";
import UserManagement from "./components/UserManagement";
import Analytics from "./components/Analytics";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-7xl">
        <Router>
          <Routes>
            <Route path="/" element={<HomePage hideAuthButtons={true} />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/products" element={<Products />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/manage-products" element={<ManageProducts />} />
            <Route path="/usermanagement" element={<UserManagement />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;