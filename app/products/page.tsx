"use client";

import { useState, useEffect } from "react";
import { Product, PortalConfig } from "@/lib/types";
import Link from "next/link";
import { Loader2, Plus, Filter, X } from "lucide-react";

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productTypeFilter, setProductTypeFilter] = useState<string>("All");
  const [form, setForm] = useState({
    name: "",
    category: "General",
    size: "",
    pattern: "",
    productType: "Regular",
    design: "",
    avgStockNeeded: "",
    costPrice: "",
    price: "0",
    stock: "10",
    photoUrl: "",
  });

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          size: form.size,
          pattern: form.pattern,
          productType: form.productType,
          design: form.design,
          price: Number(form.price) || 0,
          costPrice: Number(form.costPrice) || 0,
          avgStockNeeded: form.avgStockNeeded ? Number(form.avgStockNeeded) : undefined,
          stock: Number(form.stock) || 0,
          photoUrl: form.photoUrl,
        }),
      });
      if (!res.ok) throw new Error("Failed to add product");
      const created: Product = await res.json();
      setProducts((p) => [created, ...p]);
      setForm({
        name: "",
        category: "General",
        size: "",
        pattern: "",
        productType: "Regular",
        design: "",
        avgStockNeeded: "",
        costPrice: "",
        price: "0",
        stock: "10",
        photoUrl: "",
      });
      setShowForm(false);
      showToast("Product added");
    } catch (err) {
      console.error(err);
      showToast("Could not add product");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const confirmDelete = window.confirm(`Delete ${product.name}? This cannot be undone.`);
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts((list) => list.filter((p) => p.id !== id));
      showToast("Product deleted");
    } catch (err) {
      console.error(err);
      showToast("Could not delete product");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Products Management</h1>
            <p className="text-xs text-slate-500">View and add inventory items</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/stock-purchases"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
            >
              Stock Purchases
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-amber-700 hover:bg-slate-50"
            >
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Add New Product</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" onSubmit={handleAddProduct}>
              <label className="block text-sm">
                <span className="text-slate-700 font-medium">Product Name *</span>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </label>
              <label className="block text-sm">
                <span className="text-slate-700 font-medium">Size</span>
                <input value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </label>
              <label className="block text-sm">
                <span className="text-slate-700 font-medium">Pattern</span>
                <input value={form.pattern} onChange={(e) => setForm((f) => ({ ...f, pattern: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </label>
              <label className="block text-sm">
                <span className="text-slate-700 font-medium">Product Type</span>
                <select value={form.productType} onChange={(e) => setForm((f) => ({ ...f, productType: e.target.value as any }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="Regular">Regular</option>
                  <option value="Chote item">Chote item</option>
                  <option value="Gift">Gift</option>
                  <option value="Retail customer">Retail customer</option>
                  <option value="Non stick">Non stick</option>
                  <option value="Tamba pital">Tamba pital</option>
                  <option value="Future product">Future product</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-slate-700 font-medium">Design</span>
                <input value={form.design} onChange={(e) => setForm((f) => ({ ...f, design: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </label>
              <label className="block text-sm">
                <span className="text-slate-700 font-medium">Average Stock</span>
                <input type="number" min="0" step="1" value={form.avgStockNeeded} onChange={(e) => setForm((f) => ({ ...f, avgStockNeeded: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </label>
              <label className="block text-sm">
                <span className="text-slate-700 font-medium">Actual Stock in Shop</span>
                <input type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </label>
              <label className="block text-sm">
                <span className="text-slate-700 font-medium">Purchased Price (₹)</span>
                <input type="number" min="0" step="0.01" value={form.costPrice} onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </label>
              <div className="md:col-span-2 lg:col-span-3 flex gap-3">
                <button type="submit" disabled={isAdding} className="flex items-center justify-center gap-2 rounded-md bg-amber-500 text-white font-semibold px-4 py-2 hover:bg-amber-600 disabled:opacity-60">
                  {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save product
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-slate-500">Inventory Management</p>
                <h2 className="text-lg font-semibold text-slate-900">Products</h2>
              </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-amber-600" />
                <select 
                  value={productTypeFilter} 
                  onChange={(e) => setProductTypeFilter(e.target.value)} 
                  className="rounded-lg border-2 border-amber-300 bg-amber-50 text-slate-900 px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-400 transition cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Regular">Regular</option>
                  <option value="Chote item">Chote item</option>
                  <option value="Gift">Gift</option>
                  <option value="Retail customer">Retail customer</option>
                  <option value="Non stick">Non stick</option>
                  <option value="Tamba pital">Tamba pital</option>
                  <option value="Future product">Future product</option>
                </select>
              </label>
              <button
                onClick={() => setProductTypeFilter("All")}
                title="Reset filter"
                className="rounded-lg bg-slate-300 text-slate-700 hover:bg-slate-400 px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Reset
              </button>
            </div>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg bg-amber-500 text-white px-4 py-2 text-sm font-semibold hover:bg-amber-600"
            >
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </div>
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-700">
                <th className="px-3 py-2 text-left border-b w-[16%]">Product Name</th>
                <th className="px-3 py-2 text-left border-b w-[10%]">Size</th>
                <th className="px-3 py-2 text-left border-b w-[10%]">Pattern</th>
                <th className="px-3 py-2 text-left border-b w-[11%]">Product Type</th>
                <th className="px-3 py-2 text-left border-b w-[12%]">Design</th>
                <th className="px-3 py-2 text-left border-b w-[9%]">Average Stock</th>
                <th className="px-3 py-2 text-left border-b w-[11%]">Actual Stock in Shop</th>
                <th className="px-3 py-2 text-left border-b w-[11%]">Purchased Price</th>
                <th className="px-3 py-2 text-left border-b w-[8%]">Status</th>
                <th className="px-3 py-2 text-center border-b w-[8%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products
                .filter((p) => {
                  if (productTypeFilter === "All") return true;
                  const currentType = (p.productType || "").toLowerCase();
                  return currentType === productTypeFilter.toLowerCase();
                })
                .map((p) => {
                const isOutOfStock = p.avgStockNeeded !== undefined && p.stock < p.avgStockNeeded;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 align-top">
                    <td className="px-3 py-2 whitespace-normal break-words">
                      <Link href={`/products/${p.id}`} className="text-slate-900 font-medium hover:text-amber-700 hover:underline">{p.name}</Link>
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">{p.size || "-"}</td>
                    <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">{p.pattern || "-"}</td>
                    <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">{p.productType || "-"}</td>
                    <td className="px-3 py-2 text-slate-700 whitespace-normal break-words">{p.design || "-"}</td>
                    <td className="px-3 py-2 text-slate-700">{p.avgStockNeeded !== undefined ? String(p.avgStockNeeded) : "-"}</td>
                    <td className="px-3 py-2 text-slate-900 font-medium">{p.stock}</td>
                    <td className="px-3 py-2 text-slate-700">₹{Number(p.costPrice ?? 0).toFixed(2)}</td>
                    <td className={`px-3 py-2 font-medium ${isOutOfStock ? "text-red-600" : "text-green-600"}`}>
                      {isOutOfStock ? "Out of Stock" : "In Stock"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/products/${p.id}/edit`} className="text-xs px-3 py-1 rounded-md border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100">Edit</Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          disabled={deletingId === p.id}
                          className="text-xs px-3 py-1 rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
                        >
                          {deletingId === p.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!products.length ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={10}>No products available.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </main>

      {toast ? <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700">{toast}</div> : null}
    </div>
  );
}
