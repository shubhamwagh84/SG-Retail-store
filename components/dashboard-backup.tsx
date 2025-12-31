"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowUpRight, Loader2, Plus, UtensilsCrossed, Trash2 } from "lucide-react";
import { Product, Sale, PortalConfig, DayRevenue } from "@/lib/types";
import clsx from "clsx";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });
const lowStockLimit = 5;

export function Dashboard({
  initialProducts,
  initialSales,
  config,
}: {
  initialProducts: Product[];
  initialSales: Sale[];
  config: PortalConfig;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [isAdding, setIsAdding] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Cookware",
    size: "",
    pattern: "",
    company: "",
    design: "",
    avgStockNeeded: "",
    costPrice: "",
    price: "",
    stock: "10",
    photoUrl: "",
  });
  const [saleForm, setSaleForm] = useState({ productId: products[0]?.id ?? "", qty: "1", amount: "0", paymentMethod: "cash" as const, note: "" });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (products.length && !saleForm.productId) {
      setSaleForm((s) => ({ ...s, productId: products[0].id }));
    }
  }, [products, saleForm.productId]);

  const dayRevenue = useMemo(() => {
    const grouped = new Map<string, { cash: number; qr: number; count: number }>();
    
    sales.forEach((s) => {
      const day = format(new Date(s.soldAt), "yyyy-MM-dd");
      const entry = grouped.get(day) || { cash: 0, qr: 0, count: 0 };
      
      if (s.paymentMethod === "qr_code") {
        entry.qr += s.amount;
      } else {
        entry.cash += s.amount;
      }
      entry.count++;
      grouped.set(day, entry);
    });

    return Array.from(grouped.entries())
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([date, data]) => ({
        date,
        cashSales: data.cash,
        qrSales: data.qr,
        totalSales: data.cash + data.qr,
        expenses: 0,
        stockPurchase: 0,
      }));
  }, [sales]);

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
          company: form.company,
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
        category: "Cookware",
        size: "",
        pattern: "",
        company: "",
        design: "",
        avgStockNeeded: "",
        costPrice: "",
        price: "",
        stock: "10",
        photoUrl: "",
      });
      showToast("Product added");
    } catch (err) {
      console.error(err);
      showToast("Could not add product");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((p) => p.filter((item) => item.id !== id));
      showToast("Product removed");
    } else {
      showToast("Delete failed");
    }
  }

  async function handleRecordSale(e: React.FormEvent) {
    e.preventDefault();
    setIsRecording(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...saleForm,
          qty: Number(saleForm.qty) || 0,
          amount: Number(saleForm.amount) || 0,
        }),
      });
      if (!res.ok) throw new Error("Sale failed");
      const sale: Sale = await res.json();
      setSales((s) => [sale, ...s]);
      setProducts((list) => list.map((p) => (p.id === sale.productId ? { ...p, stock: Math.max(0, p.stock - sale.qty), updatedAt: sale.soldAt } : p)));
      setSaleForm((f) => ({ ...f, note: "" }));
      showToast("Sale recorded");
    } catch (err) {
      console.error(err);
      showToast("Could not record sale");
    } finally {
      setIsRecording(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900">Utensils Shop Portal</h1>
              <p className="text-xs text-slate-500">Inventory & Daily Sales</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className={clsx("px-3 py-1 rounded-full border", config.storageConfigured ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-amber-300 bg-amber-50 text-amber-700")}>Images {config.storageConfigured ? "ready" : "not set"}</span>
            <a href="/products" className="px-3 py-1 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">Products</a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-10">
        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Inventory</p>
                <h2 className="text-lg font-semibold text-slate-900">Products</h2>
              </div>
              <button onClick={() => document.getElementById("add-product-panel")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-2 rounded-lg bg-amber-500 text-white px-3 py-2 text-sm font-semibold hover:bg-amber-600">
                <Plus className="h-4 w-4" /> Add product
              </button>
            </div>

            <div className="p-5">
              <div className="hidden md:grid grid-cols-12 text-xs text-slate-600 pb-2 font-medium">
                <span className="col-span-5">Product</span>
                <span className="col-span-3">Category</span>
                <span className="col-span-2">Price</span>
                <span className="col-span-2 text-right">Stock</span>
              </div>
              <div className="divide-y divide-slate-200">
                {products.map((product) => (
                  <div key={product.id} className="py-3 grid grid-cols-12 items-center gap-3">
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden">
                        {product.photoUrl ? <img src={product.photoUrl} alt={product.name} className="h-full w-full object-cover" /> : <UtensilsCrossed className="h-5 w-5 text-amber-600" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          <a href={`/products/${product.id}`} className="hover:underline hover:text-amber-700">
                            {product.name}
                          </a>
                          {product.stock <= lowStockLimit ? <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300">Low</span> : null}
                        </p>
                        <p className="text-xs text-slate-500">Updated {format(new Date(product.updatedAt), "MMM dd")}</p>
                      </div>
                    </div>
                    <div className="col-span-3 text-sm text-slate-700">{product.category}</div>
                    <div className="col-span-2 text-sm text-slate-700 font-medium">{currency.format(product.price / 100)}</div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span className="text-sm text-slate-700 font-medium">{product.stock}</span>
                      <button onClick={() => handleDelete(product.id)} className="p-2 rounded-md hover:bg-slate-100 text-slate-600 hover:text-red-600" aria-label={`Delete ${product.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {!products.length ? <p className="text-sm text-slate-500 py-6 text-center">No products yet.</p> : null}
              </div>
            </div>
          </section>

          <section id="add-product-panel" className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add product</h3>
                <p className="text-xs text-slate-500">Create a new inventory item</p>
              </div>
              <form className="space-y-3" onSubmit={handleAddProduct}>
                <label className="block text-sm">
                  <span className="text-slate-700 font-medium">Name</span>
                  <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
                <label className="block text-sm">
                  <span className="text-slate-700 font-medium">Category</span>
                  <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm">
                    <span className="text-slate-700 font-medium">Size</span>
                    <input value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                  <label className="block text-sm">
                    <span className="text-slate-700 font-medium">Pattern</span>
                    <input value={form.pattern} onChange={(e) => setForm((f) => ({ ...f, pattern: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm">
                    <span className="text-slate-700 font-medium">Company</span>
                    <input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                  <label className="block text-sm">
                    <span className="text-slate-700 font-medium">Design</span>
                    <input value={form.design} onChange={(e) => setForm((f) => ({ ...f, design: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm">
                    <span className="text-slate-700 font-medium">Purchased Price (₹)</span>
                    <input value={form.costPrice} onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                  <label className="block text-sm">
                    <span className="text-slate-700 font-medium">Selling Price (₹)</span>
                    <input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm">
                    <span className="text-slate-700 font-medium">Average Stock Needed</span>
                    <input value={form.avgStockNeeded} onChange={(e) => setForm((f) => ({ ...f, avgStockNeeded: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                  <label className="block text-sm">
                    <span className="text-slate-700 font-medium">Actual Stock in Shop</span>
                    <input value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                </div>
                <label className="block text-sm">
                  <span className="text-slate-700 font-medium">Photo URL (optional)</span>
                  <input value={typeof form.photoUrl === "string" ? form.photoUrl : ""} onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
                <button type="submit" disabled={isAdding} className="w-full flex items-center justify-center gap-2 rounded-md bg-amber-500 text-white font-semibold py-2 hover:bg-amber-600 disabled:opacity-60">
                  {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save product
                </button>
                <p className="text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-md px-3 py-2">Data writes go to MySQL. Configure DB vars to persist beyond runtime.</p>
              </form>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Record sale</h3>
                <p className="text-xs text-slate-500">Log a sale and update stock</p>
              </div>
              <form className="space-y-3" onSubmit={handleRecordSale}>
                <label className="block text-sm">
                  <span className="text-slate-700 font-medium">Product</span>
                  <select value={saleForm.productId} onChange={(e) => setSaleForm((f) => ({ ...f, productId: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm">
                    <span className="text-slate-700 font-medium">Qty</span>
                    <input value={saleForm.qty} onChange={(e) => setSaleForm((f) => ({ ...f, qty: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </label>
                  <label className="block text-sm">
                    <span className="text-slate-700 font-medium">Amount (₹)</span>
                    <input value={saleForm.amount} onChange={(e) => setSaleForm((f) => ({ ...f, amount: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </label>
                </div>
                <label className="block text-sm">
                  <span className="text-slate-700 font-medium">Note (optional)</span>
                  <input value={saleForm.note} onChange={(e) => setSaleForm((f) => ({ ...f, note: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </label>
                <button type="submit" disabled={isRecording} className="w-full flex items-center justify-center gap-2 rounded-md bg-emerald-500 text-white font-semibold py-2 hover:bg-emerald-600 disabled:opacity-60">
                  {isRecording ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />} Save sale
                </button>
              </form>
            </div>
          </section>
        </div>

        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Recent sales</h3>
              <p className="text-xs text-slate-500">Latest activity</p>
            </div>
            <span className="text-xs text-slate-500">{format(new Date(), "MMM dd")}</span>
          </div>
          <div className="divide-y divide-slate-200">
            {sales.map((sale) => {
              const product = products.find((p) => p.id === sale.productId);
              return (
                <div key={sale.id} className="py-3 flex items-center justify-between text-sm text-slate-700">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{product?.name || "Product"}</p>
                    <p className="text-xs text-slate-500">{format(new Date(sale.soldAt), "MMM dd, h:mm a")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-700">{sale.qty} pcs</p>
                    <p className="font-semibold text-emerald-600">{currency.format(sale.amount / 100)}</p>
                  </div>
                </div>
              );
            })}
            {!sales.length ? <p className="text-sm text-slate-500 py-4 text-center">No sales yet.</p> : null}
          </div>
        </section>
      </main>

      {toast ? <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700">{toast}</div> : null}
    </div>
  );
}
