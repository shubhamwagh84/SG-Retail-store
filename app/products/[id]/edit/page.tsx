"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Cookware",
    size: "",
    pattern: "",
    productType: "Regular",
    design: "",
    avgStockNeeded: "",
    costPrice: "",
    price: "",
    stock: "10",
    photoUrl: "",
  });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      if (p.id !== "new") {
        fetch(`/api/products/${p.id}`)
          .then((res) => res.json())
          .then((data: Product) => {
            setProduct(data);
            setForm({
              name: data.name,
              category: data.category,
              size: data.size || "",
              pattern: data.pattern || "",
              productType: data.productType || "Regular",
              design: data.design || "",
              avgStockNeeded: data.avgStockNeeded ? String(data.avgStockNeeded) : "",
              costPrice: String(data.costPrice),
              price: String(data.price),
              stock: String(data.stock),
              photoUrl: data.photoUrl || "",
            });
          })
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });
  }, [params]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = id === "new" ? "POST" : "PATCH";
      const url = id === "new" ? "/api/products" : `/api/products/${id}`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          size: form.size,
          pattern: form.pattern,
          productType: form.productType,
          design: form.design,
          category: form.category,
          price: Number(form.price) || 0,
          costPrice: Number(form.costPrice) || 0,
          avgStockNeeded: form.avgStockNeeded ? Number(form.avgStockNeeded) : undefined,
          stock: Number(form.stock) || 0,
          photoUrl: form.photoUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to save product");
      const saved: Product = await res.json();
      showToast(id === "new" ? "Product added" : "Product updated");
      setTimeout(() => {
        window.location.href = "/products";
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast("Could not save product");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-900">{id === "new" ? "Add Product" : "Edit Product"}</h1>
            <p className="text-xs text-slate-500">{product ? "Update product details" : "Create a new product"}</p>
          </div>
          <Link href="/products" className="text-sm text-amber-700 hover:underline">← Back to products</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" onSubmit={handleSave}>
            <label className="block text-sm">
              <span className="text-slate-700 font-medium">Product Name *</span>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </label>
            <label className="block text-sm">
              <span className="text-slate-700 font-medium">Category</span>
              <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
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
                <option value="Tamba Pital">Tamba Pital</option>
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
            <label className="block text-sm">
              <span className="text-slate-700 font-medium">Photo URL (optional)</span>
              <input value={form.photoUrl} onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </label>
            <div className="md:col-span-2 lg:col-span-3 flex gap-3 pt-4">
              <button type="submit" disabled={isSaving} className="flex items-center justify-center gap-2 rounded-md bg-amber-500 text-white font-semibold px-6 py-2 hover:bg-amber-600 disabled:opacity-60">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {id === "new" ? "Add Product" : "Update Product"}
              </button>
              <Link href="/products" className="px-6 py-2 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">Cancel</Link>
            </div>
          </form>
        </div>
      </main>

      {toast ? <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700">{toast}</div> : null}
    </div>
  );
}
