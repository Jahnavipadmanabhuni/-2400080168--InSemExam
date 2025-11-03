const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-4">About Us</h1>
      <p className="mb-4">Welcome to the <strong>Product Management System</strong>.</p>
      <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
      <p className="mb-4">Simplify product management with role-based access and inventory tracking.</p>
      <h2 className="text-2xl font-semibold mb-2">Features</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Role-based access (Admin/User)</li>
        <li>Secure authentication</li>
        <li>Product & inventory tracking</li>
      </ul>
    </div>
  );
};

export default AboutUs;