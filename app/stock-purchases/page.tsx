"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, Plus, Trash2, RotateCcw } from "lucide-react";
import { Expense, Product } from "@/lib/types";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export default function StockPurchasesPage() {
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<{ id: string; items: NonNullable<Expense["items"]>; description?: string; date: string } | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [form, setForm] = useState({
    items: [] as Array<{ productId: string; qty: number }>,
    tempProductId: "",
    tempQty: "1",
    totalAmount: "",
    paymentMethod: "cash" as "cash" | "bank",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    async function load() {
      try {
        const [productsRes, expensesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/expenses"),
        ]);
        const [productsData, expensesData] = await Promise.all([
          productsRes.json(),
          expensesRes.json(),
        ]);
        const list = productsData || [];
        setProducts(list);
        setPurchases((expensesData || []).filter((e: Expense) => e.type === "stock_purchase"));
        if (!form.tempProductId && list.length) {
          const first = list[0];
          setForm((f) => ({ ...f, tempProductId: first.id, tempQty: f.tempQty || "1" }));
          setProductSearch(`${first.name}${first.size ? ` - ${first.size}` : ""}`);
        }
      } catch (err) {
        console.error("Failed to load data", err);
        setProducts([]);
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => `${p.name} ${p.size || ""} ${p.productType || ""}`.toLowerCase().includes(term));
  }, [products, productSearch]);

  useEffect(() => {
    if (!filteredProducts.length) return;
    const exists = filteredProducts.some((p) => p.id === form.tempProductId);
    if (!exists) {
      setForm((f) => ({ ...f, tempProductId: filteredProducts[0].id }));
    }
  }, [filteredProducts, form.tempProductId]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  function productName(id: string) {
    return products.find((p) => p.id === id)?.name || "Unknown";
  }

  function addItem() {
    if (!form.tempProductId) {
      showToast("Select a product and quantity");
      return;
    }
    const qty = Number(form.tempQty || 1);
    if (Number.isNaN(qty) || qty <= 0) {
      showToast("Quantity must be greater than 0");
      return;
    }
    const exists = form.items.some((i) => i.productId === form.tempProductId);
    if (exists) {
      showToast("Product already added");
      return;
    }
    setForm((f) => ({
      ...f,
      items: [...f.items, { productId: f.tempProductId, qty }],
      tempQty: "1",
    }));
  }

  function removeItem(productId: string) {
    setForm((f) => ({
      ...f,
      items: f.items.filter((i) => i.productId !== productId),
    }));
  }

  function openItems(expense: Expense) {
    if (!expense.items || !expense.items.length) return;
    setSelectedItems({ id: expense.id, items: expense.items, description: expense.description, date: expense.date });
  }

  function closeItems() {
    setSelectedItems(null);
  }

  function resetForm() {
    setForm({
      items: [],
      tempProductId: products[0]?.id ?? "",
      tempQty: "1",
      totalAmount: "",
      paymentMethod: "cash",
      description: "",
      date: today,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.items.length) {
      showToast("Add at least one product");
      return;
    }
    if (!form.totalAmount) {
      showToast("Enter total amount");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "stock_purchase",
          amount: Math.round((Number(form.totalAmount) || 0) * 100),
          paymentMethod: form.paymentMethod,
          description: form.description,
          date: form.date,
          items: form.items,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const expense: Expense = await res.json();
      setPurchases((prev) => [expense, ...prev]);
      resetForm();
      showToast("Stock purchase recorded");
    } catch (err) {
      console.error("Save error", err);
      showToast("Could not save stock purchase");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Stock Purchases</h1>
            <p className="text-xs text-slate-500">Add and review stock purchase entries</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
            >
              Products
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
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500">Inventory</p>
              <h2 className="text-lg font-semibold text-slate-900">Record Stock Purchase</h2>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" /> Reset form
            </button>
          </div>

          <form className="grid grid-cols-1 lg:grid-cols-3 gap-4" onSubmit={handleSubmit}>
            <div className="space-y-3 lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="text-sm text-slate-700 font-medium flex flex-col gap-1">
                  Date
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>
                <label className="text-sm text-slate-700 font-medium flex flex-col gap-1">
                  Payment Method
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value as "cash" | "bank" }))}
                    className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                  </select>
                </label>
                <label className="text-sm text-slate-700 font-medium flex flex-col gap-1">
                  Description (optional)
                  <input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex flex-wrap items-end gap-3">
                  <label className="text-sm text-slate-700 font-medium flex flex-col gap-2 min-w-[240px] relative">
                    Product
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      onFocus={() => setProductDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setProductDropdownOpen(false), 120)}
                      placeholder="Search by name, size, type"
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    {productDropdownOpen && (
                      <div className="absolute z-20 top-full mt-1 w-full max-h-56 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
                        {!filteredProducts.length ? (
                          <div className="px-3 py-2 text-sm text-slate-500">No matches</div>
                        ) : (
                          filteredProducts.map((p) => (
                            <button
                              type="button"
                              key={p.id}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setForm((f) => ({ ...f, tempProductId: p.id }));
                                setProductSearch(`${p.name}${p.size ? ` - ${p.size}` : ""}`);
                                setProductDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm transition hover:bg-amber-50 ${form.tempProductId === p.id ? "bg-amber-100 text-amber-800" : "text-slate-900"}`}
                            >
                              <div className="font-semibold">{p.name}</div>
                              <div className="text-xs text-slate-600">{p.size || "Size N/A"} · {p.productType || "Type N/A"}</div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </label>
                  <label className="text-sm text-slate-700 font-medium flex flex-col gap-1">
                    Quantity
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.tempQty}
                      onChange={(e) => setForm((f) => ({ ...f, tempQty: e.target.value }))}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 w-32"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={!products.length || !form.tempProductId}
                    className="mt-1 flex items-center gap-2 rounded-md bg-amber-500 text-white px-4 py-2 text-sm font-semibold hover:bg-amber-600 disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" /> Add item
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700">
                        <th className="px-3 py-2 text-left">Product</th>
                        <th className="px-3 py-2 text-left">Qty</th>
                        <th className="px-3 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {form.items.map((item) => (
                        <tr key={item.productId}>
                          <td className="px-3 py-2 text-slate-900 font-medium">{productName(item.productId)}</td>
                          <td className="px-3 py-2 text-slate-700">{item.qty}</td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                            >
                              <Trash2 className="h-4 w-4" /> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!form.items.length ? (
                        <tr>
                          <td className="px-3 py-3 text-slate-500" colSpan={3}>No items added yet.</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-lg p-4 h-fit">
              <label className="text-sm text-slate-700 font-medium flex flex-col gap-1">
                Total Amount (₹)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.totalAmount}
                  onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-amber-500 text-white font-semibold px-4 py-2 hover:bg-amber-600 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save stock purchase
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">History</p>
              <h2 className="text-lg font-semibold text-slate-900">Purchase Records</h2>
            </div>
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-500" /> : null}
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-700">
                <th className="px-4 py-2 text-left border-b">Date</th>
                <th className="px-4 py-2 text-left border-b">Amount</th>
                <th className="px-4 py-2 text-left border-b">Payment</th>
                <th className="px-4 py-2 text-left border-b">Description</th>
                <th className="px-4 py-2 text-left border-b">Items</th>
                <th className="px-4 py-2 text-left border-b">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900 font-medium">{format(new Date(p.date), "MMM dd, yyyy")}</td>
                  <td className="px-4 py-3 text-slate-900">{currency.format(p.amount / 100)}</td>
                  <td className="px-4 py-3 text-slate-700 capitalize">{p.paymentMethod}</td>
                  <td className="px-4 py-3 text-slate-700">{p.description || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {p.items && p.items.length ? `${p.items.length} item(s)` : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {p.items && p.items.length ? (
                      <button
                        type="button"
                        onClick={() => openItems(p)}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {!purchases.length ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>No stock purchases recorded yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      </main>

      {toast ? <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700">{toast}</div> : null}

      {selectedItems ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <p className="text-xs text-slate-500">Purchase Items</p>
                <h3 className="text-lg font-semibold text-slate-900">{format(new Date(selectedItems.date), "MMM dd, yyyy")}</h3>
                {selectedItems.description ? <p className="text-xs text-slate-500 mt-1">{selectedItems.description}</p> : null}
              </div>
              <button onClick={closeItems} className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">Close</button>
            </div>
            <div className="p-4 space-y-2 max-h-[360px] overflow-auto">
              {selectedItems.items.map((item) => (
                <div key={`${selectedItems.id}-${item.productId}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{productName(item.productId)}</p>
                    <p className="text-xs text-slate-500">Product ID: {item.productId}</p>
                  </div>
                  <div className="text-sm text-slate-700">Qty: {item.qty}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
