import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const sampleProducts = [
	{
		id: 1,
		title: "Classic Leather Bag",
		price: 79.0,
		category: "Accessories",
		img: "https://picsum.photos/id/1005/800/600",
		desc: "Hand-crafted leather bag — sleek, durable and timeless.",
	},
	{
		id: 2,
		title: "Minimal Desk Lamp",
		price: 49.5,
		category: "Home",
		img: "https://picsum.photos/id/1011/800/600",
		desc: "Warm LED lamp with adjustable arm and dimmer.",
	},
	{
		id: 3,
		title: "Sport Running Shoes",
		price: 99.99,
		category: "Footwear",
		img: "https://picsum.photos/id/102/800/600",
		desc: "Lightweight running shoes with breathable mesh.",
	},
	{
		id: 4,
		title: "Ceramic Coffee Mug",
		price: 12.0,
		category: "Home",
		img: "https://picsum.photos/id/1080/800/600",
		desc: "350ml mug with ergonomic handle and matte finish.",
	},
	{
		id: 5,
		title: "Wireless Headphones",
		price: 129.0,
		category: "Electronics",
		img: "https://picsum.photos/id/1057/800/600",
		desc: "Noise-cancelling bluetooth headphones with 24h battery.",
	},
	{
		id: 6,
		title: "Organic Cotton T-Shirt",
		price: 24.0,
		category: "Apparel",
		img: "https://picsum.photos/id/1025/800/600",
		desc: "Soft organic cotton tee, regular fit.",
	},
	{
		id: 7,
		title: "Stainless Steel Water Bottle",
		price: 22.5,
		category: "Accessories",
		img: "https://picsum.photos/id/1036/800/600",
		desc: "Insulated 750ml bottle, keeps drinks cold for 24h.",
	},
	{
		id: 8,
		title: "Compact Bluetooth Speaker",
		price: 59.99,
		category: "Electronics",
		img: "https://picsum.photos/id/1050/800/600",
		desc: "Portable speaker with deep bass and 10h playtime.",
	},
	{
		id: 9,
		title: "Yoga Mat",
		price: 29.0,
		category: "Fitness",
		img: "https://picsum.photos/id/1027/800/600",
		desc: "Non-slip yoga mat, 6mm cushioned surface.",
	},
	{
		id: 10,
		title: "Chef's Knife 8\"",
		price: 89.0,
		category: "Kitchen",
		img: "https://picsum.photos/id/1041/800/600",
		desc: "High-carbon stainless steel chef's knife with ergonomic handle.",
	},
	{
		id: 11,
		title: "Wireless Charging Pad",
		price: 34.0,
		category: "Electronics",
		img: "https://picsum.photos/id/1049/800/600",
		desc: "Compact Qi wireless charger for smartphones.",
	},
	{
		id: 12,
		title: "Indoor Plant (Fiddle Leaf)",
		price: 39.0,
		category: "Home",
		img: "https://picsum.photos/id/1024/800/600",
		desc: "Low-maintenance indoor plant in a ceramic pot.",
	},
	{
		id: 13,
		title: "Travel Backpack",
		price: 119.0,
		category: "Accessories",
		img: "https://picsum.photos/id/1001/800/600",
		desc: "Water-resistant backpack with padded laptop compartment.",
	},
	{
		id: 14,
		title: "Smart LED Strip",
		price: 27.5,
		category: "Home",
		img: "https://picsum.photos/id/1012/800/600",
		desc: "Addressable LED strip compatible with voice assistants.",
	},
	{
		id: 15,
		title: "Classic Sunglasses",
		price: 59.0,
		category: "Accessories",
		img: "https://picsum.photos/id/1010/800/600",
		desc: "UV-protective polarized sunglasses with metal frame.",
	},
];

export default function Products() {
	// load products from localStorage (if present), otherwise fall back to sampleProducts
	const [products, setProducts] = useState(() => {
		try {
			const stored = localStorage.getItem("products");
			return stored ? JSON.parse(stored) : sampleProducts;
		} catch {
			return sampleProducts;
		}
	});
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("All");
	const [sort, setSort] = useState("featured");
	const [selected, setSelected] = useState(null);
	const navigate = useNavigate();

	// recalc categories from current products
	const categories = useMemo(() => {
		const set = new Set(products.map((p) => p.category));
		return ["All", ...Array.from(set)];
	}, [products]);

	// filter/sort the current products list
	const filtered = useMemo(() => {
		let list = products.filter(
			(p) =>
				p.title.toLowerCase().includes(query.toLowerCase()) ||
				p.desc.toLowerCase().includes(query.toLowerCase())
		);
		if (category !== "All") list = list.filter((p) => p.category === category);
		if (sort === "price-asc")
			list = list.slice().sort((a, b) => a.price - b.price);
		if (sort === "price-desc")
			list = list.slice().sort((a, b) => b.price - a.price);
		return list;
	}, [products, query, category, sort]);

	// listen for updates to products saved elsewhere (manage-products)
	useEffect(() => {
		const reload = () => {
			try {
				const stored = localStorage.getItem("products");
				if (stored) setProducts(JSON.parse(stored));
			} catch {}
		};

		window.addEventListener("productsUpdated", reload);
		window.addEventListener("storage", reload);
		return () => {
			window.removeEventListener("productsUpdated", reload);
			window.removeEventListener("storage", reload);
		};
	}, []);

	const handleLogout = () => {
		sessionStorage.removeItem("user");
		navigate("/", { replace: true });
	};

	return (
		<div
			className="min-h-screen p-6"
			style={{
				backgroundImage: 'url("/images/products.jpg")',
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			<header className="max-w-6xl mx-auto flex items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold text-white">Products</h1>
					<p className="text-sm text-gray-500">Browse and manage products</p>
				</div>

				<div className="flex items-center gap-3">
					{/* Only Log Out button (no Home / Sign In / Sign Up) */}
					<button
						onClick={handleLogout}
						className="text-sm px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
					>
						Log Out
					</button>
				</div>
			</header>

			<main className="max-w-6xl mx-auto">
				<section className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
					<input
						type="search"
						placeholder="Search products, description..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="flex-1 px-4 py-2 rounded-md border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 text-black placeholder-black"
					/>

					{/* filters group: fills remaining space; each select expands equally */}
					<div className="flex w-full md:flex-1 gap-4">
						<select
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							className="flex-1 px-3 py-2 rounded-md border border-gray-200 bg-white text-black"
						>
							{categories.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>

						<select
							value={sort}
							onChange={(e) => setSort(e.target.value)}
							className="flex-1 px-3 py-2 rounded-md border border-gray-200 bg-white text-black"
						>
							<option value="featured">Featured</option>
							<option value="price-asc">Price: Low → High</option>
							<option value="price-desc">Price: High → Low</option>
						</select>
					</div>
				</section>

				<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{filtered.map((p) => (
						<article
							key={p.id}
							className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
						>
							<div className="h-48 bg-gray-100">
								<img
									src={p.img}
									alt={p.title}
									className="w-full h-full object-cover"
									onError={(e) => {
										e.currentTarget.onerror = null;
										e.currentTarget.src = `https://picsum.photos/800/600?random=${p.id}`;
									}}
								/>
							</div>

							<div className="p-4">
								<div className="flex items-center justify-between mb-2">
									<h3 className="text-lg font-semibold text-gray-800">
										{p.title}
									</h3>
									<span className="text-sm text-gray-500">
										{p.category}
									</span>
								</div>
								<p className="text-sm text-gray-600 mb-4">{p.desc}</p>

								<div className="flex items-center justify-between">
									<div>
										<span className="text-xl font-bold text-gray-900">
											₹{p.price.toFixed(2)}
										</span>
										<span className="text-sm text-gray-500 ml-2">
											incl. taxes
										</span>
									</div>

									<div className="flex items-center gap-2">
										<button
											onClick={() => setSelected(p)}
											className="px-3 py-1 bg-gray-100 border rounded-md text-sm hover:bg-gray-200"
										>
											View
										</button>
										<button className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600">
											Add
										</button>
									</div>
								</div>
							</div>
						</article>
					))}
				</section>

				{filtered.length === 0 && (
					<p className="text-center text-gray-500 mt-8">
						No products match your search.
					</p>
				)}
			</main>

			{selected && (
				<div
					role="dialog"
					aria-modal="true"
					className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
					onClick={() => setSelected(null)}
				>
					<div
						className="bg-white rounded-lg max-w-2xl w-full overflow-hidden shadow-lg"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="grid md:grid-cols-2">
							<div className="h-72 md:h-auto">
								<img
									src={selected.img}
									alt={selected.title}
									className="w-full h-full object-cover"
									onError={(e) => {
										e.currentTarget.onerror = null;
										e.currentTarget.src = `https://picsum.photos/800/600?random=${selected.id}`;
									}}
								/>
							</div>
							<div className="p-6">
								<h3 className="text-2xl font-bold mb-2 text-gray-800">
									{selected.title}
								</h3>
								<p className="text-sm text-gray-500 mb-4">
									{selected.category}
								</p>
								<p className="text-gray-700 mb-4">{selected.desc}</p>
								<div className="flex items-center justify-between">
									<div>
										<span className="text-2xl font-bold">
											₹{selected.price.toFixed(2)}
										</span>
									</div>
									<div className="flex gap-3">
										<button className="px-4 py-2 bg-green-500 text-white rounded-md">
											Add to cart
										</button>
										<button
											onClick={() => setSelected(null)}
											className="px-4 py-2 border rounded-md"
										>
											Close
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}