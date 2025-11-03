import { Link, useNavigate } from "react-router-dom";


const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));


  return (
    // REMOVED: className="min-h-screen bg-gray-100" 
    // This allows the global video background to show.
    <div className="min-h-screen"> 
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-pink-400 p-4 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Product Management System</h1>
        <div className="flex gap-4 items-center">
          {/* Home button — force navigation to the dashboard route */}
          <button onClick={() => navigate("/dashboard")} className="btn btn-sm">
            Home
          </button>


          {/* show Sign In / Sign Up when no user, otherwise show Logout */}
          {!user ? (
            <>
              <button
                onClick={() => navigate("/signin")}
                className="bg-white text-pink-500 px-3 py-1 rounded-md font-medium hover:opacity-90"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="bg-transparent border border-white px-3 py-1 rounded-md font-medium hover:bg-white hover:text-pink-500 transition"
              >
                Sign Up
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                sessionStorage.removeItem("user");
                navigate("/");
              }}
              className="hover:underline"
            >
              Logout
            </button>
          )}
        </div>
      </nav>


      {/* Dashboard Content */}
      {/* Added background to the content wrapper for better text visibility against the video */}
      <div className="p-8 text-center max-w-4xl mx-auto mt-10 bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Welcome {user?.username || "User"}!</h2>
        <p className="mb-6 text-gray-600">Manage products, users, and view analytics.</p>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* The cards already have bg-white, so they stand out */}
          <div className="bg-white shadow-lg rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition"
               onClick={() => navigate("/manage-products")}>
            <h3 className="text-xl font-semibold text-blue-500">Manage Products</h3>
            <p>Add, edit, and delete products.</p>
          </div>


          <div className="bg-white shadow-lg rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition"
               onClick={() => navigate("/usermanagement")}>
            <h3 className="text-xl font-semibold text-green-500">User Management</h3>
            <p>Manage user roles and accounts.</p>
          </div>


          <div className="bg-white shadow-lg rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition"
               onClick={() => navigate("/analytics")}>
            <h3 className="text-xl font-semibold text-purple-500">Analytics</h3>
            <p>View reports and insights.</p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Dashboard;