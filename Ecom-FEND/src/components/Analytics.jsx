import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Helper function to safely load and parse data
const loadData = (key, defaultValue = []) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const Analytics = () => {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Load data from localStorage on mount and listen for updates
  useEffect(() => {
    const reloadData = () => {
      setProducts(loadData("products", []));
      setUsers(loadData("users", []));
    };

    reloadData(); // Initial load

    // Listen to updates from other components (like ManageProducts/UserManagement)
    window.addEventListener("productsUpdated", reloadData);
    window.addEventListener("usersUpdated", reloadData);
    window.addEventListener("storage", reloadData);

    return () => {
      window.removeEventListener("productsUpdated", reloadData);
      window.removeEventListener("usersUpdated", reloadData);
      window.removeEventListener("storage", reloadData);
    };
  }, []);

  // --- Analytical Calculations (Memoized for performance) ---

  const productStats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
    const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
    
    // Category Distribution
    const categoryCounts = products.reduce((acc, p) => {
      const cat = p.category || "Uncategorized";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { totalProducts, totalValue, avgPrice, topCategories };
  }, [products]);

  const userStats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.active !== false).length; // active is default true
    const adminUsers = users.filter(u => u.role === "admin").length;
    const userRoleCounts = users.reduce((acc, u) => {
      const role = u.role || "user";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to array for display
    const roleDistribution = Object.entries(userRoleCounts)
      .sort(([, a], [, b]) => b - a);

    return { totalUsers, activeUsers, adminUsers, roleDistribution };
  }, [users]);
  
  // Simple Bar Chart data simulation (using product category counts)
  const chartData = productStats.topCategories.map(([category, count]) => ({
    category,
    count,
    percentage: ((count / productStats.totalProducts) * 100).toFixed(1),
  }));


  // Navigation for back button
  const handleGoBack = () => navigate("/dashboard");
  
  // Simplified Chart Component (can be replaced with a library)
  const BarChart = ({ data, title }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <div className="space-y-3">
        {data.map(({ category, count, percentage }) => (
          <div key={category} className="flex flex-col">
            <div className="flex justify-between text-sm text-gray-700 mb-1">
              <span>{category} ({count})</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-purple-500 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-gray-500 text-center">No categories to display.</p>}
      </div>
    </div>
  );


  // --- Render Component ---

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics 📊</h1>
          <p className="text-gray-600">Key metrics and visualizations for Product and User data.</p>
        </div>
        <button onClick={handleGoBack} className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600">
          Back to Dashboard
        </button>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        
        {/* 1. Product Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Products" value={productStats.totalProducts} color="bg-blue-100 text-blue-800" />
          <StatCard title="Total Product Value" value={`₹${productStats.totalValue.toFixed(2)}`} color="bg-green-100 text-green-800" />
          <StatCard title="Average Product Price" value={`₹${productStats.avgPrice.toFixed(2)}`} color="bg-yellow-100 text-yellow-800" />
        </div>
        
        {/* 2. User Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Users" value={userStats.totalUsers} color="bg-pink-100 text-pink-800" />
          <StatCard title="Active Users" value={userStats.activeUsers} color="bg-teal-100 text-teal-800" />
          <StatCard title="Admin Accounts" value={userStats.adminUsers} color="bg-red-100 text-red-800" />
        </div>
        
        {/* 3. Detailed Visualizations (Bar Chart and User Roles) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Product Category Distribution Chart */}
          <BarChart data={chartData} title="Product Category Distribution (Top 5)" />
          
          {/* User Role Breakdown Table */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">User Role Breakdown</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userStats.roleDistribution.map(([role, count]) => (
                  <tr key={role}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.charAt(0).toUpperCase() + role.slice(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((count / userStats.totalUsers) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {userStats.roleDistribution.length === 0 && (
                   <tr><td colSpan="3" className="text-center text-gray-500 py-4">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
        </div>
        
        {/* 4. Actionable Insights Area (Placeholder) */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Actionable Insights</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li><span className="font-semibold">{productStats.topCategories[0]?.[0] || 'N/A'}</span> is the highest demand category with {productStats.topCategories[0]?.[1] || 0} products. Consider expanding stock.</li>
            <li>You have {userStats.adminUsers} administrator accounts. Ensure all are necessary for security audit.</li>
            <li>Average product price is <span className="font-semibold">₹{productStats.avgPrice.toFixed(2)}</span>. This suggests a mid-range market focus.</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

// Simple reusable card component for stats
const StatCard = ({ title, value, color }) => (
    <div className={`p-6 rounded-lg shadow-md ${color} flex flex-col justify-between`}>
        <p className="text-sm font-medium opacity-80">{title}</p>
        <p className="text-3xl font-extrabold mt-1">{value}</p>
    </div>
);

export default Analytics;