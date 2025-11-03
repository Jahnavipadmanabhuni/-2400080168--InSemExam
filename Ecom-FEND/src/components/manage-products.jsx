import React, { useEffect, useMemo, useState } from "react";

/*
  Simple product manager component.
  - Reads/writes products to localStorage key "products"
  - Allows search, category filter, add, edit, delete
  - Minimal validation
*/

const initialProducts = [
  { id: 1, title: "Classic Leather Bag", price: 79.0, category: "Accessories", img: "https://picsum.photos/id/1005/800/600", desc: "Hand-crafted leather bag — sleek, durable and timeless." },
  { id: 2, title: "Minimal Desk Lamp", price: 49.5, category: "Home", img: "https://picsum.photos/id/1011/800/600", desc: "Warm LED lamp with adjustable arm and dimmer." },
  { id: 3, title: "Sport Running Shoes", price: 99.99, category: "Footwear", img: "https://picsum.photos/id/102/800/600", desc: "Lightweight running shoes with breathable mesh." },
  { id: 4, title: "Ceramic Coffee Mug", price: 12.0, category: "Home", img: "https://picsum.photos/id/1080/800/600", desc: "350ml mug with ergonomic handle and matte finish." },
  { id: 5, title: "Wireless Headphones", price: 129.0, category: "Electronics", img: "https://picsum.photos/id/1057/800/600", desc: "Noise-cancelling bluetooth headphones with 24h battery." },
  { id: 6, title: "Organic Cotton T-Shirt", price: 24.0, category: "Apparel", img: "https://picsum.photos/id/1025/800/600", desc: "Soft organic cotton tee, regular fit." },
  { id: 7, title: "Stainless Steel Water Bottle", price: 22.5, category: "Accessories", img: "https://picsum.photos/id/1036/800/600", desc: "Insulated 750ml bottle, keeps drinks cold for 24h." },
  { id: 8, title: "Compact Bluetooth Speaker", price: 59.99, category: "Electronics", img: "https://picsum.photos/id/1050/800/600", desc: "Portable speaker with deep bass and 10h playtime." },
  { id: 9, title: "Yoga Mat", price: 29.0, category: "Fitness", img: "https://picsum.photos/id/1027/800/600", desc: "Non-slip yoga mat, 6mm cushioned surface." },
  { id: 10, title: "Travel Backpack", price: 119.0, category: "Accessories", img: "https://picsum.photos/id/1001/800/600", desc: "Water-resistant backpack with padded laptop compartment." },
];

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [editing, setEditing] = useState(null); // product being edited or null
  const [form, setForm] = useState({ title: "", price: "", category: "", img: "", desc: "" });

  // load from localStorage or initialize
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("products"));
    if (Array.isArray(stored) && stored.length) {
      setProducts(stored);
    } else {
      localStorage.setItem("products", JSON.stringify(initialProducts));
      setProducts(initialProducts);
    }
  }, []);

  // categories
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [products]);

  // filtered products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    });
  }, [products, query, category]);

  // persist and notify other components in the same window/tab
  const saveProducts = (next) => {
    setProducts(next);
    localStorage.setItem("products", JSON.stringify(next));
    // notify Products component in this tab to reload
    try { window.dispatchEvent(new Event("productsUpdated")); } catch {}
  };

  // handlers
  const handleDelete = (id) => {
    if (!confirm("Delete this product?")) return;
    const next = products.filter((p) => p.id !== id);
    saveProducts(next);
    if (editing && editing.id === id) {
      setEditing(null);
      setForm({ title: "", price: "", category: "", img: "", desc: "" });
    }
  };

  const handleEdit = (p) => {
    setEditing(p);
    setForm({ title: p.title, price: String(p.price), category: p.category, img: p.img, desc: p.desc });
  };

  const handleAddNew = () => {
    setEditing(null);
    setForm({ title: "", price: "", category: "", img: "", desc: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    const categoryVal = form.category.trim() || "Uncategorized";
    const priceNum = parseFloat(form.price) || 0;
    if (!title) {
      alert("Title required");
      return;
    }
    if (editing) {
      const next = products.map((p) => (p.id === editing.id ? { ...p, title, price: priceNum, category: categoryVal, img: form.img || p.img, desc: form.desc } : p));
      saveProducts(next);
      setEditing(null);
    } else {
      const id = Date.now();
      const newP = { id, title, price: priceNum, category: categoryVal, img: form.img || `https://picsum.photos/800/600?random=${id}`, desc: form.desc };
      const next = [newP, ...products];
      saveProducts(next);
    }
    setForm({ title: "", price: "", category: "", img: "", desc: "" });
  };

  // when initializing and seeding localStorage, notify others too
  useEffect(() => {
    if (!localStorage.getItem("products")) {
      localStorage.setItem("products", JSON.stringify(initialProducts));
      try { window.dispatchEvent(new Event("productsUpdated")); } catch {}
      // also update component state
      setProducts(initialProducts);
    }
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
          <p className="text-sm text-gray-600">Add, edit or remove products (saved to localStorage)</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleAddNew} className="px-3 py-2 bg-blue-600 text-white rounded">Add Product</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="flex gap-4 mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 px-3 py-2 border rounded text-black"
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 border rounded text-black">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded shadow p-3 flex flex-col">
                <div className="h-40 bg-gray-100 mb-3 overflow-hidden rounded">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://picsum.photos/800/600?random=${p.id}`; }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="text-sm text-gray-500">{p.category}</p>
                  <p className="text-sm text-gray-700 mt-2">{p.desc}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xl font-bold">₹{Number(p.price).toFixed(2)}</div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="px-3 py-1 border rounded text-sm">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && <p className="text-gray-500 mt-6">No products found.</p>}
        </section>

        <aside className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-3">{editing ? "Edit Product" : "Add Product"}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="w-full border p-2 rounded text-black" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="w-full border p-2 rounded text-black" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input className="w-full border p-2 rounded text-black" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input className="w-full border p-2 rounded text-black" placeholder="Image URL" value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} />
            <textarea className="w-full border p-2 rounded text-black" rows="3" placeholder="Description" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />

            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{editing ? "Save" : "Create"}</button>
              <button type="button" onClick={() => { setEditing(null); setForm({ title: "", price: "", category: "", img: "", desc: "" }); }} className="px-4 py-2 border rounded">Reset</button>
            </div>
          </form>
        </aside>
      </main>
    </div>
  );
}