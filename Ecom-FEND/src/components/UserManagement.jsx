import React, { useEffect, useMemo, useState, useRef } from "react";

/*
  Advanced UserManagement component
  - localStorage-backed ("users")
  - Search, filter by role/status, sort, pagination
  - Add / Edit / Delete / Bulk Delete
  - Toggle active/disabled, change role inline
  - Reset password (generates temporary password and stores hashed value)
  - CSV import/export (basic)
  - Dispatches "usersUpdated" event after changes
*/

const STORAGE_KEY = "users";

// simple SHA-256 hex hashing using Web Crypto; fallback to btoa
async function hashPassword(password) {
  try {
    if (window.crypto && window.crypto.subtle) {
      const enc = new TextEncoder();
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", enc.encode(password));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {}
  return btoa(password);
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows = lines.map((l) => l.split(",").map(c => c.replace(/^"|"$/g, "").trim()));
  const headers = rows[0] || [];
  const data = (rows.slice(1) || []).map(r => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = r[i] || ""));
    return obj;
  });
  return { headers, data };
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "user", active: true });
  const [sortField, setSortField] = useState("username");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const fileRef = useRef(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      setUsers(stored);
    } catch {
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    // update page when pageSize changes
    setPage(1);
  }, [pageSize, query, roleFilter, statusFilter]);

  const roles = useMemo(() => {
    const s = new Set(users.map(u => u.role || "user"));
    return ["user", "admin", ...Array.from(s).filter(r => r && r !== "user" && r !== "admin")];
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter(u => {
        if (roleFilter !== "All" && (u.role || "user") !== roleFilter) return false;
        if (statusFilter !== "All" && (u.active ? "Active" : "Disabled") !== statusFilter) return false;
        if (!q) return true;
        return (u.username || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const av = (a[sortField] || "").toString().toLowerCase();
        const bv = (b[sortField] || "").toString().toLowerCase();
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [users, query, roleFilter, statusFilter, sortField, sortDir]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const persist = (next) => {
    setUsers(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    try { window.dispatchEvent(new Event("usersUpdated")); } catch {}
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const startAdd = () => {
    setEditing(null);
    setForm({ username: "", email: "", password: "", role: "user", active: true });
  };

  const startEdit = (u) => {
    setEditing(u);
    setForm({ username: u.username || "", email: u.email || "", password: "", role: u.role || "user", active: !!u.active });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this user?")) return;
    const next = users.filter(u => u.id !== id);
    persist(next);
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) { alert("No users selected"); return; }
    if (!confirm(`Delete ${selectedIds.size} users?`)) return;
    const next = users.filter(u => !selectedIds.has(u.id));
    persist(next);
    setSelectedIds(new Set());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = (form.username || "").trim();
    const email = (form.email || "").trim().toLowerCase();
    if (!username || !email) { alert("Username and email are required."); return; }
    if (!validateEmail(email)) { alert("Invalid email."); return; }

    if (editing) {
      const exists = users.find(u => u.email === email && u.id !== editing.id);
      if (exists) { alert("Email already in use."); return; }
      const next = users.map(u => u.id === editing.id ? { ...u, username, email, role: form.role, active: !!form.active, password: editing.password } : u);
      // if password provided, hash & update
      if (form.password) {
        const hashed = await hashPassword(form.password);
        next.forEach((nu, i) => { if (nu.id === editing.id) next[i] = { ...nu, password: hashed }; });
      }
      persist(next);
      setEditing(null);
    } else {
      if (!form.password || form.password.length < 6) { alert("Password must be at least 6 characters."); return; }
      const exists = users.find(u => u.email === email);
      if (exists) { alert("Email already exists."); return; }
      const hashed = await hashPassword(form.password);
      const id = Date.now();
      const newUser = { id, username, email, role: form.role || "user", active: !!form.active, password: hashed };
      persist([newUser, ...users]);
    }
    setForm({ username: "", email: "", password: "", role: "user", active: true });
  };

  const toggleActive = (id) => {
    const next = users.map(u => u.id === id ? { ...u, active: !u.active } : u);
    persist(next);
  };

  const changeRole = (id, role) => {
    const next = users.map(u => u.id === id ? { ...u, role } : u);
    persist(next);
  };

  const resetPassword = async (id) => {
    const temp = Math.random().toString(36).slice(-8);
    if (!confirm(`Reset password for user to temporary password: ${temp} ?`)) return;
    const hashed = await hashPassword(temp);
    const next = users.map(u => u.id === id ? { ...u, password: hashed } : u);
    persist(next);
    alert(`Temporary password: ${temp} (show to user once)`);
  };

  const exportCSV = () => {
    const rows = [["id","username","email","role","active"]];
    users.forEach(u => rows.push([u.id, u.username, u.email, u.role || "user", u.active ? "Active" : "Disabled"]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCSVFile = (file) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target.result;
      const { headers, data } = parseCSV(text);
      // support common header names
      const mapped = data.map(row => {
        const username = row.username || row.name || row.user || "";
        const email = (row.email || "").toLowerCase();
        const role = row.role || "user";
        const active = (row.active || "").toLowerCase().startsWith("t") || (row.active || "").toLowerCase() === "active" || row.active === "1";
        return { username, email, role, active };
      }).filter(r => r.email && validateEmail(r.email));
      if (mapped.length === 0) { alert("No valid rows found."); return; }
      const next = [...users];
      for (const m of mapped) {
        if (!next.find(u => u.email === m.email)) {
          const id = Date.now() + Math.floor(Math.random() * 1000);
          const tempPass = Math.random().toString(36).slice(-8);
          const hashed = await hashPassword(tempPass);
          next.push({ id, username: m.username || m.email.split("@")[0], email: m.email, role: m.role || "user", active: !!m.active, password: hashed });
        }
      }
      persist(next);
      alert("Import complete. New users created with temporary passwords.");
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    importCSVFile(f);
    e.target.value = "";
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  const selectAllOnPage = () => {
    const s = new Set(selectedIds);
    pageItems.forEach(i => s.add(i.id));
    setSelectedIds(s);
  };

  const clearSelection = () => setSelectedIds(new Set());

  return (
    <>
      <img src="/images/your-background.jpg" alt="Background" className="app-bg-image" />
      {/* If you have a video, add this as well: */}
      {/* <video className="app-bg-video" autoPlay loop muted playsInline poster="/images/your-background.jpg">
        <source src="/videos/your-background.mp4" type="video/mp4" />
      </video> */}
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-7xl p-6">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management (Advanced)</h1>
              <p className="text-sm text-gray-600">Search, import/export, bulk actions, role/status management</p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={startAdd} className="px-3 py-2 bg-blue-600 text-white rounded">Add</button>
              <button onClick={exportCSV} className="px-3 py-2 bg-gray-200 rounded">Export CSV</button>
              <label className="px-3 py-2 bg-white border rounded cursor-pointer">
                Import CSV
                <input ref={fileRef} type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
              </label>
              <button onClick={handleBulkDelete} className="px-3 py-2 bg-red-500 text-white rounded">Delete Selected</button>
            </div>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2">
              <div className="flex gap-4 mb-4 items-center">
                <input 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder="Search by name or email..." 
                    className="flex-1 px-3 py-2 border rounded text-black placeholder-gray-500" 
                />
                <select 
                    value={roleFilter} 
                    onChange={(e) => setRoleFilter(e.target.value)} 
                    className="px-3 py-2 border rounded text-black" 
                >
                  <option>All</option>
                  {[...new Set(["user","admin",...roles])].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)} 
                    className="px-3 py-2 border rounded text-black" 
                >
                  <option>All</option>
                  <option>Active</option>
                  <option>Disabled</option>
                </select>
                <select 
                    value={pageSize} 
                    onChange={(e) => setPageSize(Number(e.target.value))} 
                    className="px-3 py-2 border rounded text-black" 
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </div>

              <div className="overflow-x-auto bg-white rounded shadow">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">
                        <input type="checkbox" onChange={(e) => e.target.checked ? selectAllOnPage() : clearSelection()} />
                      </th>
                      <th className="px-3 py-2 text-left cursor-pointer" onClick={() => { setSortField("username"); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>User</th>
                      <th className="px-3 py-2 text-left cursor-pointer" onClick={() => { setSortField("email"); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>Email</th>
                      <th className="px-3 py-2 text-left">Role</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pageItems.map(u => (
                      <tr key={u.id}>
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => toggleSelect(u.id)} />
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-semibold">{u.username}</div>
                          <div className="text-sm text-gray-500">{u.id}</div>
                        </td>
                        <td className="px-3 py-2">{u.email}</td>
                        <td className="px-3 py-2">
                          <select 
                            value={u.role || "user"} 
                            onChange={(e) => changeRole(u.id, e.target.value)} 
                            className="px-2 py-1 border rounded text-black" 
                          >
                            {[...new Set([u.role || "user", ...roles])].map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <button onClick={() => toggleActive(u.id)} className={`px-2 py-1 rounded ${u.active ? "bg-green-100" : "bg-yellow-100"}`}>{u.active ? "Active" : "Disabled"}</button>
                        </td>
                        <td className="px-3 py-2 flex gap-2">
                          <button onClick={() => startEdit(u)} className="px-2 py-1 border rounded">Edit</button>
                          <button onClick={() => resetPassword(u.id)} className="px-2 py-1 bg-blue-500 text-white rounded">Reset PW</button>
                          <button onClick={() => handleDelete(u.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-gray-600">Showing {((page-1)*pageSize)+1}–{Math.min(page*pageSize, total)} of {total}</div>
                <div className="flex gap-2 items-center">
                  <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-2 py-1 border rounded">Prev</button>
                  <span className="px-2">{page}/{pages}</span>
                  <button disabled={page>=pages} onClick={() => setPage(p => Math.min(pages, p+1))} className="px-2 py-1 border rounded">Next</button>
                </div>
              </div>
            </section>

            <aside className="bg-white rounded shadow p-4">
              <h2 className="text-lg font-semibold mb-3">{editing ? "Edit User" : "Create User"}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input 
                    className="w-full border p-2 rounded text-black placeholder-gray-500" // <-- Updated to target text and placeholder
                    placeholder="Username" 
                    value={form.username} 
                    onChange={(e) => setForm({ ...form, username: e.target.value })} 
                />
                <input 
                    className="w-full border p-2 rounded text-black placeholder-gray-500" // <-- Updated to target text and placeholder
                    placeholder="Email" 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                />
                <input 
                    className="w-full border p-2 rounded text-black placeholder-gray-500" // <-- Updated to target text and placeholder
                    placeholder="Password" 
                    value={form.password} 
                    onChange={(e) => setForm({ ...form, password: e.target.value })} 
                />
                <select 
                    className="w-full border p-2 rounded text-black" 
                    value={form.role} 
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <label className="flex items-center gap-2 text-black"> {/* <-- Added text-black to label */}
                  <input type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  Active
                </label>

                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{editing ? "Save" : "Create"}</button>
                  <button type="button" onClick={() => { setEditing(null); setForm({ username: "", email: "", password: "", role: "user", active: true }); }} className="px-4 py-2 border rounded">Reset</button>
                </div>
              </form>
            </aside>
          </main>
        </div>
      </div>
    </>
  );
}