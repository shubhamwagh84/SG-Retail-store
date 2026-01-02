"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Loader2, Plus, UtensilsCrossed, Calendar, RotateCcw, ChevronLeft, ChevronRight, Database, Edit2, Trash2 } from "lucide-react";
import { Product, Sale, PortalConfig, Expense } from "@/lib/types";
import clsx from "clsx";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ configured: boolean; healthy: boolean; loading: boolean; error: string | null }>({ configured: false, healthy: false, loading: true, error: null });
  const currentDate = new Date();
  const [startDate, setStartDate] = useState(format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), "yyyy-MM-dd"));
  const [saleForm, setSaleForm] = useState({ productId: products[0]?.id ?? "", qty: "1", amount: "0", paymentMethod: "cash" as "cash" | "qr_code", note: "", date: format(new Date(), "yyyy-MM-dd") });
  const [saleProductSearch, setSaleProductSearch] = useState("");
  const [saleProductDropdownOpen, setSaleProductDropdownOpen] = useState(false);
  const [saleProductInitialized, setSaleProductInitialized] = useState(false);
  const [saleProductSearchDirty, setSaleProductSearchDirty] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ type: "salary" as "salary" | "operational_cost" | "other" | "advertisement" | "shop_rent", amount: "", paymentMethod: "cash" as "cash" | "bank", description: "", date: format(new Date(), "yyyy-MM-dd") });
  const [stockForm, setStockForm] = useState({ items: [] as Array<{ productId: string; qty: number }>, totalAmount: "", paymentMethod: "cash" as "cash" | "bank", description: "", date: format(new Date(), "yyyy-MM-dd"), tempProductId: products[0]?.id ?? "", tempQty: "" });
  const [toast, setToast] = useState<string | null>(null);
  const [selectedDayDetails, setSelectedDayDetails] = useState<null | {
    date: string;
    sales: Sale[];
    expenses: Expense[];
  }>(null);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<string>("");
  const [editAmount, setEditAmount] = useState<string>("");
  const [isEditingLoading, setIsEditingLoading] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editExpenseType, setEditExpenseType] = useState<string>("");
  const [editExpenseAmount, setEditExpenseAmount] = useState<string>("");
  const [editExpenseDescription, setEditExpenseDescription] = useState<string>("");

  const productName = (id: string) => products.find((p) => p.id === id)?.name || "Unknown product";

  async function refetchProducts() {
    try {
      const res = await fetch(`/api/products?t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setProducts(data || []);
      console.log("Products refetched:", data.map((p: Product) => ({ name: p.name, stock: p.stock })));
    } catch (err) {
      console.error("Failed to refetch products:", err);
    }
  }

  useEffect(() => {
    if (!products.length) return;
    const current = products.find((p) => p.id === saleForm.productId);
    if (!saleProductInitialized || !current) {
      const target = current ?? products[0];
      setSaleForm((s) => ({ ...s, productId: target.id }));
      setSaleProductSearch(`${target.name}${target.size ? ` - ${target.size}` : ""}`);
      setSaleProductSearchDirty(false);
      setSaleProductInitialized(true);
    }
  }, [products, saleForm.productId, saleProductInitialized]);

  useEffect(() => {
    fetch("/api/expenses")
      .then((res) => res.json())
      .then((data) => setExpenses(data || []))
      .catch(() => setExpenses([]));
  }, []);

  useEffect(() => {
    refreshDbStatus();
  }, []);

  const dayRevenue = useMemo(() => {
    const grouped = new Map<string, { cash: number; qr: number; expenses: number; stockPurchase: number }>();
    
    // Group sales by day
    sales.forEach((s) => {
      const day = format(new Date(s.soldAt), "yyyy-MM-dd");
      if (day < startDate || day > endDate) return;
      const entry = grouped.get(day) || { cash: 0, qr: 0, expenses: 0, stockPurchase: 0 };
      
      if (s.paymentMethod === "qr_code") {
        entry.qr += s.amount;
      } else {
        entry.cash += s.amount;
      }
      grouped.set(day, entry);
    });

    // Group expenses by day
    expenses.forEach((e) => {
      if (e.date < startDate || e.date > endDate) return;
      const day = e.date;
      const entry = grouped.get(day) || { cash: 0, qr: 0, expenses: 0, stockPurchase: 0 };
      
      if (e.type === "salary" || e.type === "operational_cost" || e.type === "other" || e.type === "shop_rent") {
        entry.expenses += e.amount;
      } else if (e.type === "stock_purchase") {
        entry.stockPurchase += e.amount;
      }
      grouped.set(day, entry);
    });

    return Array.from(grouped.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, data]) => ({
        date,
        cashSales: data.cash,
        qrSales: data.qr,
        expenses: data.expenses,
        stockPurchase: data.stockPurchase,
      }));
  }, [sales, expenses, startDate, endDate]);

  const filteredSaleProducts = useMemo(() => {
    const term = saleProductSearch.trim().toLowerCase();
    if (!saleProductSearchDirty || !term) return products;
    return products.filter((p) => `${p.name} ${p.size || ""} ${p.productType || ""}`.toLowerCase().includes(term));
  }, [products, saleProductSearch, saleProductSearchDirty]);

  const summary = useMemo(() => {
    // Treat missing paymentMethod as cash for legacy/sample data
    const totalCash = sales.filter(s => s.paymentMethod !== "qr_code").reduce((sum, s) => sum + s.amount, 0);
    const totalBank = sales.filter(s => s.paymentMethod === "qr_code").reduce((sum, s) => sum + s.amount, 0);
    const totalExpenseCash = expenses.filter(e => e.paymentMethod === "cash" && (e.type === "salary" || e.type === "operational_cost" || e.type === "other" || e.type === "shop_rent")).reduce((sum, e) => sum + e.amount, 0);
    const totalExpenseBank = expenses.filter(e => e.paymentMethod === "bank" && (e.type === "salary" || e.type === "operational_cost" || e.type === "other" || e.type === "shop_rent")).reduce((sum, e) => sum + e.amount, 0);
    const totalStockCash = expenses.filter(e => e.paymentMethod === "cash" && e.type === "stock_purchase").reduce((sum, e) => sum + e.amount, 0);
    const totalStockBank = expenses.filter(e => e.paymentMethod === "bank" && e.type === "stock_purchase").reduce((sum, e) => sum + e.amount, 0);
    const salaryCash = expenses.filter(e => e.paymentMethod === "cash" && e.type === "salary").reduce((sum, e) => sum + e.amount, 0);
    const salaryBank = expenses.filter(e => e.paymentMethod === "bank" && e.type === "salary").reduce((sum, e) => sum + e.amount, 0);
    
    return {
      totalCash,
      totalBank,
      totalExpense: totalExpenseCash + totalExpenseBank,
      totalStock: totalStockCash + totalStockBank,
      // Remaining = sales (by payment rail) minus all expenses and stock purchases on that rail
      remainingCash: totalCash - totalExpenseCash - totalStockCash,
      remainingBank: totalBank - totalExpenseBank - totalStockBank,
    };
  }, [sales, expenses]);

  const allocationSummary = useMemo(() => {
    const inRangeExpenses = expenses.filter((e) => {
      if (!startDate || !endDate) return true;
      return e.date >= startDate && e.date <= endDate;
    });

    const totalRevenueCents = dayRevenue.reduce((sum, day) => sum + day.cashSales + day.qrSales, 0);

    const allocatedAdvertisementCents = Math.round(totalRevenueCents * 0.081);
    const allocatedExpenseStockCents = Math.round(totalRevenueCents * 0.70);

    const spentAdvertisementCents = inRangeExpenses
      .filter((e) => e.type === "advertisement")
      .reduce((sum, e) => sum + e.amount, 0);

    const spentExpenseStockCents = inRangeExpenses
      .filter((e) => e.type === "stock_purchase" || e.type === "salary" || e.type === "operational_cost" || e.type === "other" || e.type === "shop_rent")
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      allocatedAdvertisementCents,
      allocatedExpenseStockCents,
      spentAdvertisementCents,
      spentExpenseStockCents,
      diffAdvertisementCents: allocatedAdvertisementCents - spentAdvertisementCents,
      diffExpenseStockCents: allocatedExpenseStockCents - spentExpenseStockCents,
      totalRevenueCents,
    };
  }, [dayRevenue, expenses, startDate, endDate]);

  const carryForwardSummary = useMemo(() => {
    const endBound = endDate || format(new Date(), "yyyy-MM-dd");

    const revenueUpToEndCents = sales
      .filter((s) => format(new Date(s.soldAt), "yyyy-MM-dd") <= endBound)
      .reduce((sum, s) => sum + s.amount, 0);

    const allocatedAdCents = Math.round(revenueUpToEndCents * 0.081);
    const allocatedExpStockCents = Math.round(revenueUpToEndCents * 0.70);

    const expensesUpToEnd = expenses.filter((e) => e.date <= endBound);

    const spentAdCents = expensesUpToEnd
      .filter((e) => e.type === "advertisement")
      .reduce((sum, e) => sum + e.amount, 0);

    const spentExpStockCents = expensesUpToEnd
      .filter((e) => e.type === "stock_purchase" || e.type === "salary" || e.type === "operational_cost" || e.type === "other" || e.type === "shop_rent")
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      revenueUpToEndCents,
      allocatedAdCents,
      allocatedExpStockCents,
      spentAdCents,
      spentExpStockCents,
      bucketAdCents: allocatedAdCents - spentAdCents,
      bucketExpStockCents: allocatedExpStockCents - spentExpStockCents,
      endBound,
    };
  }, [sales, expenses, endDate]);

  function resetDateRange() {
    const now = new Date();
    setStartDate(format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd"));
    setEndDate(format(new Date(now.getFullYear(), now.getMonth() + 1, 0), "yyyy-MM-dd"));
    showToast("Date range reset to current month");
  }

  function goToMonth(offset: number) {
    const current = new Date(startDate || new Date());
    const targetStart = new Date(current.getFullYear(), current.getMonth() + offset, 1);
    const targetEnd = new Date(targetStart.getFullYear(), targetStart.getMonth() + 1, 0);
    setStartDate(format(targetStart, "yyyy-MM-dd"));
    setEndDate(format(targetEnd, "yyyy-MM-dd"));
  }

  function goToPreviousMonth() {
    goToMonth(-1);
  }

  function goToNextMonth() {
    goToMonth(1);
  }

  function openDayDetails(date: string) {
    const salesForDay = sales.filter((s) => format(new Date(s.soldAt), "yyyy-MM-dd") === date);
    const expensesForDay = expenses.filter((e) => e.date === date);
    setSelectedDayDetails({ date, sales: salesForDay, expenses: expensesForDay });
  }

  function closeDayDetails() {
    setSelectedDayDetails(null);
    setEditingSaleId(null);
    setEditQty("");
    setEditAmount("");
    setEditingExpenseId(null);
    setEditExpenseType("");
    setEditExpenseAmount("");
    setEditExpenseDescription("");
  }

  function startEditSale(sale: Sale) {
    setEditingSaleId(sale.id);
    setEditQty(sale.qty.toString());
    setEditAmount((sale.amount / 100).toString());
  }

  async function handleSaveEdit() {
    if (!editingSaleId) return;

    const updates: Record<string, number> = {};
    if (editQty && editQty !== "") {
      updates.qty = Number(editQty);
    }
    if (editAmount && editAmount !== "") {
      updates.amount = Number(editAmount) * 100; // Convert to paise
    }

    if (Object.keys(updates).length === 0) {
      showToast("No changes made");
      return;
    }

    setIsEditingLoading(true);
    try {
      const res = await fetch(`/api/sales/${editingSaleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const error = await res.json();
        showToast(`Error: ${error.message}`);
        setIsEditingLoading(false);
        return;
      }

      const updatedSale = await res.json();

      // Update the sales list
      setSales((prevSales) =>
        prevSales.map((s) => (s.id === editingSaleId ? updatedSale : s))
      );

      // Refresh the day details
      if (selectedDayDetails) {
        const updatedDaySales = selectedDayDetails.sales.map((s) =>
          s.id === editingSaleId ? updatedSale : s
        );
        setSelectedDayDetails({ ...selectedDayDetails, sales: updatedDaySales });
      }

      // Refresh products to update stock
      refetchProducts();

      showToast("Sale updated successfully");
      setEditingSaleId(null);
      setEditQty("");
      setEditAmount("");
    } catch (error) {
      showToast(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsEditingLoading(false);
    }
  }

  async function handleDeleteSale(saleId: string) {
    if (!confirm("Are you sure you want to delete this sale? This will restore the product stock.")) {
      return;
    }

    setIsEditingLoading(true);
    try {
      const res = await fetch(`/api/sales/${saleId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        showToast(`Error: ${error.message}`);
        setIsEditingLoading(false);
        return;
      }

      // Remove from sales list
      setSales((prevSales) => prevSales.filter((s) => s.id !== saleId));

      // Refresh the day details
      if (selectedDayDetails) {
        const updatedDaySales = selectedDayDetails.sales.filter(
          (s) => s.id !== saleId
        );
        setSelectedDayDetails({ ...selectedDayDetails, sales: updatedDaySales });
      }

      // Refresh products to update stock
      refetchProducts();

      showToast("Sale deleted successfully");
    } catch (error) {
      showToast(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsEditingLoading(false);
    }
  }

  function startEditExpense(expense: Expense) {
    setEditingExpenseId(expense.id);
    setEditExpenseType(expense.type);
    setEditExpenseAmount((expense.amount / 100).toString());
    setEditExpenseDescription(expense.description || "");
  }

  async function handleSaveExpenseEdit() {
    if (!editingExpenseId) return;

    const updates: Record<string, any> = {};
    if (editExpenseType) {
      updates.type = editExpenseType;
    }
    if (editExpenseAmount) {
      updates.amount = Number(editExpenseAmount) * 100;
    }
    if (editExpenseDescription !== undefined) {
      updates.description = editExpenseDescription || null;
    }

    if (Object.keys(updates).length === 0) {
      showToast("No changes made");
      return;
    }

    setIsEditingLoading(true);
    try {
      const res = await fetch(`/api/expenses/${editingExpenseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const error = await res.json();
        showToast(`Error: ${error.message}`);
        setIsEditingLoading(false);
        return;
      }

      const updatedExpense = await res.json();

      // Update the expenses list
      setExpenses((prevExpenses) =>
        prevExpenses.map((e) => (e.id === editingExpenseId ? updatedExpense : e))
      );

      // Refresh the day details
      if (selectedDayDetails) {
        const updatedDayExpenses = selectedDayDetails.expenses.map((e) =>
          e.id === editingExpenseId ? updatedExpense : e
        );
        setSelectedDayDetails({ ...selectedDayDetails, expenses: updatedDayExpenses });
      }

      showToast("Expense updated successfully");
      setEditingExpenseId(null);
      setEditExpenseType("");
      setEditExpenseAmount("");
      setEditExpenseDescription("");
    } catch (error) {
      showToast(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsEditingLoading(false);
    }
  }

  async function handleDeleteExpense(expenseId: string) {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    setIsEditingLoading(true);
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        showToast(`Error: ${error.message}`);
        setIsEditingLoading(false);
        return;
      }

      // Remove from expenses list
      setExpenses((prevExpenses) => prevExpenses.filter((e) => e.id !== expenseId));

      // Refresh the day details
      if (selectedDayDetails) {
        const updatedDayExpenses = selectedDayDetails.expenses.filter(
          (e) => e.id !== expenseId
        );
        setSelectedDayDetails({ ...selectedDayDetails, expenses: updatedDayExpenses });
      }

      showToast("Expense deleted successfully");
    } catch (error) {
      showToast(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsEditingLoading(false);
    }
  }

  async function refreshDbStatus() {
    setDbStatus((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const data = await res.json();
      setDbStatus({
        configured: Boolean(data.mysqlConfigured),
        healthy: Boolean(data.mysqlHealthy),
        loading: false,
        error: res.ok ? null : data.error || data.message || "Health check failed",
      });
    } catch (error: unknown) {
      setDbStatus({ configured: false, healthy: false, loading: false, error: error instanceof Error ? error.message : String(error) });
    }
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleRecordSale(e: React.FormEvent) {
    e.preventDefault();
    setIsRecording(true);
    try {
      const saleDate = new Date(`${saleForm.date}T00:00:00`).toISOString();
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: saleForm.productId,
          qty: Number(saleForm.qty) || 0,
          amount: Math.round((Number(saleForm.amount) || 0) * 100),
          paymentMethod: saleForm.paymentMethod,
          note: saleForm.note,
          soldAt: saleDate,
        }),
      });
      if (!res.ok) throw new Error("Sale failed");
      const sale: Sale = await res.json();
      setSales((s) => [sale, ...s]);
      setProducts((list) => list.map((p) => (p.id === sale.productId ? { ...p, stock: Math.max(0, p.stock - sale.qty), updatedAt: sale.soldAt } : p)));
      setSaleForm((f) => ({ ...f, qty: "1", amount: "0", note: "", date: format(new Date(), "yyyy-MM-dd") }));
      showToast("Sale recorded");
    } catch (err) {
      console.error(err);
      showToast("Could not record sale");
    } finally {
      setIsRecording(false);
    }
  }

  async function handleRecordExpense(e: React.FormEvent) {
    e.preventDefault();
    setIsAddingExpense(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: expenseForm.type,
          amount: Math.round((Number(expenseForm.amount) || 0) * 100),
          paymentMethod: expenseForm.paymentMethod,
          description: expenseForm.description,
          date: expenseForm.date,
        }),
      });
      if (!res.ok) throw new Error("Failed to record expense");
      const expense: Expense = await res.json();
      setExpenses((e) => [expense, ...e]);
      setExpenseForm({ type: "salary" as "salary" | "operational_cost" | "other" | "advertisement" | "shop_rent", amount: "", paymentMethod: "cash", description: "", date: format(new Date(), "yyyy-MM-dd") });
      showToast("Expense recorded");
    } catch (err) {
      console.error(err);
      showToast("Could not record expense");
    } finally {
      setIsAddingExpense(false);
    }
  }

  async function handleRecordStockPurchase(e: React.FormEvent) {
    e.preventDefault();
    if (!stockForm.items.length) {
      showToast("Please add at least one product");
      return;
    }
    setIsAddingExpense(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "stock_purchase",
          amount: Math.round((Number(stockForm.totalAmount) || 0) * 100),
          paymentMethod: stockForm.paymentMethod,
          description: stockForm.description,
          date: stockForm.date,
          items: stockForm.items,
        }),
      });
      if (!res.ok) throw new Error("Failed to record stock purchase");
      const expense: Expense = await res.json();
      setExpenses((e) => [expense, ...e]);

      // Products are updated on the server; just refetch to sync UI
      await refetchProducts();

      setStockForm({ items: [], totalAmount: "", paymentMethod: "cash", description: "", date: format(new Date(), "yyyy-MM-dd"), tempProductId: products[0]?.id ?? "", tempQty: "" });
      showToast("Stock purchase recorded and products updated");
    } catch (err) {
      console.error("Stock purchase error:", err);
      showToast("Could not record stock purchase");
    } finally {
      setIsAddingExpense(false);
    }
  }

  function addStockItem() {
    if (!stockForm.tempProductId || !stockForm.tempQty || Number(stockForm.tempQty) <= 0) {
      showToast("Please select product and enter quantity");
      return;
    }
    const qty = Number(stockForm.tempQty);
    const alreadyExists = stockForm.items.find((i) => i.productId === stockForm.tempProductId);
    if (alreadyExists) {
      showToast("Product already added");
      return;
    }
    setStockForm((f) => ({
      ...f,
      items: [...f.items, { productId: f.tempProductId, qty }],
      tempQty: "",
    }));
  }

  function removeStockItem(productId: string) {
    setStockForm((f) => ({
      ...f,
      items: f.items.filter((i) => i.productId !== productId),
    }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900">SG Retail store</h1>
              <p className="text-xs text-slate-500">Daily Revenue & Sales</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <a
              href="/products"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
            >
              Products
            </a>
            <a
              href="/stock-purchases"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
            >
              Stock Purchases
            </a>
            <button
              type="button"
              onClick={refreshDbStatus}
              title={dbStatus.error || "Check database connection"}
              className={clsx(
                "inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors",
                dbStatus.loading
                  ? "bg-slate-100 text-slate-600"
                  : dbStatus.healthy
                  ? "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
              )}
            >
              {dbStatus.loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Database className="h-3.5 w-3.5" />
              )}
              {dbStatus.configured ? (dbStatus.healthy ? "DB ✓" : "DB ✗") : "DB —"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-10">
        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-emerald-600 font-medium mb-1">Total Cash</p>
            <p className="text-2xl font-bold text-emerald-900">{currency.format(summary.totalCash / 100)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-blue-600 font-medium mb-1">Total Bank</p>
            <p className="text-2xl font-bold text-blue-900">{currency.format(summary.totalBank / 100)}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-amber-600 font-medium mb-1">Total Expense</p>
            <p className="text-2xl font-bold text-amber-900">{currency.format(summary.totalExpense / 100)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-purple-600 font-medium mb-1">Stock Purchase</p>
            <p className="text-2xl font-bold text-purple-900">{currency.format(summary.totalStock / 100)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-green-600 font-medium mb-1">Remaining Cash</p>
            <p className={`text-2xl font-bold ${summary.remainingCash >= 0 ? 'text-green-900' : 'text-red-700'}`}>{currency.format(summary.remainingCash / 100)}</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-cyan-600 font-medium mb-1">Remaining Bank</p>
            <p className={`text-2xl font-bold ${summary.remainingBank >= 0 ? 'text-cyan-900' : 'text-red-700'}`}>{currency.format(summary.remainingBank / 100)}</p>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto w-full max-w-full">
            <div className="px-4 sm:px-5 py-4 border-b border-slate-200">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Day-wise Sales</h2>
                  </div>
                  <div className="w-full lg:w-auto flex flex-wrap items-center gap-2 justify-start lg:justify-end">
                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                      <button
                        type="button"
                        aria-label="Previous month"
                        onClick={goToPreviousMonth}
                        className="h-9 w-9 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <label htmlFor="start-date" className="text-xs text-slate-600">From</label>
                      <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-9 min-w-[140px] rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      />
                      <label htmlFor="end-date" className="text-xs text-slate-600">To</label>
                      <input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-9 min-w-[140px] rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      />
                      <button
                        type="button"
                        aria-label="Next month"
                        onClick={goToNextMonth}
                        className="h-9 w-9 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Reset to current month"
                        onClick={resetDateRange}
                        className="h-9 w-9 rounded-md border border-amber-400 bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-700">
                  <th className="px-4 py-2 text-left border-b">Date</th>
                  <th className="px-4 py-2 text-right border-b">Sell in Cash</th>
                  <th className="px-4 py-2 text-right border-b">Sell in QR Code</th>
                  <th className="px-4 py-2 text-right border-b">Expense</th>
                  <th className="px-4 py-2 text-right border-b">Stock Purchase</th>
                  <th className="px-4 py-2 text-right border-b">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dayRevenue.map((day) => (
                  <tr key={day.date} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900 font-medium">{format(new Date(day.date), "MMM dd, yyyy")}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{currency.format(day.cashSales / 100)}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{currency.format(day.qrSales / 100)}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{currency.format(day.expenses / 100)}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{currency.format(day.stockPurchase / 100)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openDayDetails(day.date)}
                        className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {!dayRevenue.length ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>No data recorded yet.</td>
                  </tr>
                ) : null}
                {dayRevenue.length > 0 ? (
                  <tr className="bg-slate-100 font-semibold border-t-2 border-slate-300">
                    <td className="px-4 py-3 text-slate-900">Total</td>
                    <td className="px-4 py-3 text-right text-slate-900">{currency.format(dayRevenue.reduce((sum, day) => sum + day.cashSales, 0) / 100)}</td>
                    <td className="px-4 py-3 text-right text-slate-900">{currency.format(dayRevenue.reduce((sum, day) => sum + day.qrSales, 0) / 100)}</td>
                    <td className="px-4 py-3 text-right text-slate-900">{currency.format(dayRevenue.reduce((sum, day) => sum + day.expenses, 0) / 100)}</td>
                    <td className="px-4 py-3 text-right text-slate-900">{currency.format(dayRevenue.reduce((sum, day) => sum + day.stockPurchase, 0) / 100)}</td>
                    <td className="px-4 py-3 text-right text-slate-900">—</td>
                  </tr>
                ) : null}
              </tbody>
            </table>

            {/* Revenue Breakdown */}
            {dayRevenue.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-5 mt-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Revenue Breakdown</h3>
                {(() => {
                  const totalCash = dayRevenue.reduce((sum, day) => sum + day.cashSales, 0) / 100;
                  const totalQR = dayRevenue.reduce((sum, day) => sum + day.qrSales, 0) / 100;
                  const totalRevenue = totalCash + totalQR;
                  
                  const advertisement = totalRevenue * 0.081;
                  const tejus = totalRevenue * 0.084;
                  const shubham = totalRevenue * 0.135;
                  const expenseSalary = totalRevenue * 0.70;
                  
                  return (
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-4 border border-emerald-100">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-900">Total Revenue</span>
                          <span className="text-lg font-bold text-emerald-600">{currency.format(totalRevenue)}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Cash: {currency.format(totalCash)} + QR: {currency.format(totalQR)}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-blue-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-slate-700">Advertisement</p>
                            </div>
                            <span className="text-sm font-bold text-blue-600">{currency.format(advertisement)}</span>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 border border-purple-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-slate-700">Tejus Revenue</p>
                            </div>
                            <span className="text-sm font-bold text-purple-600">{currency.format(tejus)}</span>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 border border-orange-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-slate-700">Shop Revenue</p>
                            </div>
                            <span className="text-sm font-bold text-orange-600">{currency.format(shubham)}</span>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 border border-red-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-slate-700">Expense + Stock</p>
                            </div>
                            <span className="text-sm font-bold text-red-600">{currency.format(expenseSalary)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-100 rounded-lg p-3 text-xs text-slate-600">
                        <p>Total distributed: <span className="font-semibold">{currency.format(advertisement + tejus + shubham + expenseSalary)}</span></p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {dayRevenue.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-5 mt-4 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 mb-3">Monthly Allocation vs Spend</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-blue-100 rounded-lg p-4 bg-blue-50/40">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-slate-900">Advertisement</span>
                      <span className="text-sm text-slate-600">Allocated</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-600">From revenue</span>
                      <span className="text-sm font-bold text-blue-700">{currency.format(allocationSummary.allocatedAdvertisementCents / 100)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-600">Spent</span>
                      <span className="text-sm font-bold text-blue-700">{currency.format(allocationSummary.spentAdvertisementCents / 100)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-600 pt-1 border-t border-blue-100 mt-2">
                      <span>Difference (Allocated - Spent)</span>
                      <span className="font-semibold text-blue-700">{currency.format(allocationSummary.diffAdvertisementCents / 100)}</span>
                    </div>
                  </div>

                  <div className="border border-red-100 rounded-lg p-4 bg-red-50/40">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-slate-900">Expense + Stock</span>
                      <span className="text-sm text-slate-600">Allocated</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-600">From revenue</span>
                      <span className="text-sm font-bold text-red-700">{currency.format(allocationSummary.allocatedExpenseStockCents / 100)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-600">Spent (expense + stock)</span>
                      <span className="text-sm font-bold text-red-700">{currency.format(allocationSummary.spentExpenseStockCents / 100)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-600 pt-1 border-t border-red-100 mt-2">
                      <span>Difference (Allocated - Spent)</span>
                      <span className="font-semibold text-red-700">{currency.format(allocationSummary.diffExpenseStockCents / 100)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3">Based on selected date range. Allocation uses total revenue (cash + QR): {currency.format(allocationSummary.totalRevenueCents / 100)}</p>
              </div>
            )}

            {dayRevenue.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-5 mt-4 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 mb-3">Bucket Balance (carry forward)</h3>
                <p className="text-xs text-slate-500 mb-3">All-time up to {carryForwardSummary.endBound} based on total revenue and spend.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-blue-100 rounded-lg p-4 bg-blue-50/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-slate-900">Advertisement bucket</span>
                      <span className="text-sm font-bold text-blue-700">{currency.format(carryForwardSummary.bucketAdCents / 100)}</span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between"><span>Allocated</span><span>{currency.format(carryForwardSummary.allocatedAdCents / 100)}</span></div>
                      <div className="flex justify-between"><span>Spent</span><span>{currency.format(carryForwardSummary.spentAdCents / 100)}</span></div>
                    </div>
                  </div>

                  <div className="border border-red-100 rounded-lg p-4 bg-red-50/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-slate-900">Expense + Stock bucket</span>
                      <span className="text-sm font-bold text-red-700">{currency.format(carryForwardSummary.bucketExpStockCents / 100)}</span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between"><span>Allocated</span><span>{currency.format(carryForwardSummary.allocatedExpStockCents / 100)}</span></div>
                      <div className="flex justify-between"><span>Spent</span><span>{currency.format(carryForwardSummary.spentExpStockCents / 100)}</span></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3">Revenue considered (cash + QR) up to this date: {currency.format(carryForwardSummary.revenueUpToEndCents / 100)}</p>
              </div>
            )}
          </div>

          <section className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Record Sale</h3>
                <p className="text-xs text-slate-500">Log a sale</p>
              </div>
              <form className="space-y-3" onSubmit={handleRecordSale}>
                <label htmlFor="sale-date" className="block text-sm cursor-pointer">
                  <span className="text-slate-700 font-medium flex items-center gap-2"><Calendar className="h-4 w-4" /> Date</span>
                  <input id="sale-date" type="date" value={saleForm.date} onChange={(e) => setSaleForm((f) => ({ ...f, date: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer" />
                </label>
                <label className="block text-sm relative">
                  <span className="text-slate-700 font-medium">Product</span>
                  <input
                    value={saleProductSearch}
                    onChange={(e) => {
                      setSaleProductSearch(e.target.value);
                      setSaleProductSearchDirty(true);
                    }}
                    onFocus={() => setSaleProductDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setSaleProductDropdownOpen(false), 120)}
                    placeholder="Search product"
                    className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {saleProductDropdownOpen && (
                    <div className="absolute z-30 mt-1 w-full max-h-56 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
                      {!filteredSaleProducts.length ? (
                        <div className="px-3 py-2 text-sm text-slate-500">No matches</div>
                      ) : (
                        filteredSaleProducts.map((p) => (
                          <button
                            type="button"
                            key={p.id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setSaleForm((f) => ({ ...f, productId: p.id }));
                              setSaleProductSearch(`${p.name}${p.size ? ` - ${p.size}` : ""}`);
                              setSaleProductSearchDirty(false);
                              setSaleProductDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm transition hover:bg-emerald-50 ${saleForm.productId === p.id ? "bg-emerald-100 text-emerald-800" : "text-slate-900"}`}
                          >
                            <div className="font-semibold">{p.name}</div>
                            <div className="text-xs text-slate-600">{p.size || "Size N/A"} · {p.productType || "Type N/A"}</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm">
                    <span className="text-slate-700 font-medium">Qty</span>
                    <input type="number" min="0" step="1" value={saleForm.qty} onChange={(e) => setSaleForm((f) => ({ ...f, qty: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </label>
                  <label className="block text-sm">
                    <span className="text-slate-700 font-medium">Amount (₹)</span>
                    <input type="number" min="0" step="0.01" value={saleForm.amount} onChange={(e) => setSaleForm((f) => ({ ...f, amount: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </label>
                </div>
                <label className="block text-sm">
                  <span className="text-slate-700 font-medium">Payment Method</span>
                  <select value={saleForm.paymentMethod} onChange={(e) => setSaleForm((f) => ({ ...f, paymentMethod: e.target.value as "cash" | "qr_code" }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="cash">Cash</option>
                    <option value="qr_code">QR Code</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-slate-700 font-medium">Note (optional)</span>
                  <input value={saleForm.note} onChange={(e) => setSaleForm((f) => ({ ...f, note: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </label>
                <button type="submit" disabled={isRecording || !saleForm.amount || Number(saleForm.amount) <= 0} className="w-full flex items-center justify-center gap-2 rounded-md bg-emerald-500 text-white font-semibold py-2 hover:bg-emerald-600 disabled:opacity-60">
                  {isRecording ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save sale
                </button>
              </form>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Expense / Salary</h3>
                <p className="text-xs text-slate-500">Record operational costs</p>
              </div>
              <form className="space-y-3" onSubmit={handleRecordExpense}>
                <label className="block text-sm">
                  <span className="text-slate-700 font-medium">Type</span>
                  <select value={expenseForm.type} onChange={(e) => setExpenseForm((f) => ({ ...f, type: e.target.value as "salary" | "operational_cost" | "other" | "advertisement" | "shop_rent" }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="salary">Salary</option>
                    <option value="operational_cost">Operational Cost</option>
                    <option value="shop_rent">Shop Rent</option>
                    <option value="advertisement">Advertisement</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-slate-700 font-medium">Amount (₹)</span>
                  <input type="number" min="0" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
                <label className="block text-sm">
                  <span className="text-slate-700 font-medium">Payment Method</span>
                  <select value={expenseForm.paymentMethod} onChange={(e) => setExpenseForm((f) => ({ ...f, paymentMethod: e.target.value as "cash" | "bank" }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                  </select>
                </label>
                <label htmlFor="expense-date" className="block text-sm cursor-pointer">
                  <span className="text-slate-700 font-medium flex items-center gap-2"><Calendar className="h-4 w-4" /> Date</span>
                  <input id="expense-date" type="date" value={expenseForm.date} onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer" />
                </label>
                <label className="block text-sm">
                  <span className="text-slate-700 font-medium">Description (optional)</span>
                  <input value={expenseForm.description} onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
                <button type="submit" disabled={isAddingExpense || !expenseForm.amount || Number(expenseForm.amount) <= 0} className="w-full flex items-center justify-center gap-2 rounded-md bg-amber-500 text-white font-semibold py-2 hover:bg-amber-600 disabled:opacity-60">
                  {isAddingExpense ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save expense
                </button>
              </form>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Stock Purchase</h3>
                <p className="text-xs text-slate-500">Manage purchases on the dedicated page</p>
              </div>
              <a
                href="/stock-purchases"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 text-white font-semibold px-4 py-2 hover:bg-amber-600"
              >
                Go to Stock Purchase
              </a>
            </div>
          </section>
        </section>
      </main>

      {toast ? <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700">{toast}</div> : null}

      {selectedDayDetails ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <p className="text-xs text-slate-500">Day details</p>
                <h3 className="text-lg font-semibold text-slate-900">{format(new Date(selectedDayDetails.date), "MMM dd, yyyy")}</h3>
              </div>
              <button onClick={closeDayDetails} className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">Close</button>
            </div>

            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">Sales</h4>
                  <span className="text-xs text-slate-500">{selectedDayDetails.sales.length} item(s)</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-auto">
                  {selectedDayDetails.sales.length ? selectedDayDetails.sales.map((s) => (
                    <div key={s.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      {editingSaleId === s.id ? (
                        // Edit form
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-slate-600 block font-medium mb-1">Qty</label>
                            <input
                              type="number"
                              min="0"
                              value={editQty}
                              onChange={(e) => setEditQty(e.target.value)}
                              className="w-full rounded-md border border-slate-300 bg-white text-slate-900 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-600 block font-medium mb-1">Amount (₹)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-full rounded-md border border-slate-300 bg-white text-slate-900 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              disabled={isEditingLoading}
                              className="flex-1 rounded-md bg-emerald-600 text-white text-xs font-medium px-2 py-1 hover:bg-emerald-700 disabled:bg-slate-400 flex items-center justify-center gap-1"
                            >
                              {isEditingLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                              Save
                            </button>
                            <button
                              onClick={() => setEditingSaleId(null)}
                              disabled={isEditingLoading}
                              className="flex-1 rounded-md border border-slate-300 text-slate-700 text-xs font-medium px-2 py-1 hover:bg-slate-100 disabled:bg-slate-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display mode
                        <>
                          <div className="flex items-center justify-between text-sm text-slate-900 font-medium">
                            <span>{productName(s.productId)}</span>
                            <span>{currency.format(s.amount / 100)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-600 mt-1">
                            <span>Qty: {s.qty}</span>
                            <span className="capitalize">Payment: {s.paymentMethod === "qr_code" ? "QR" : "Cash"}</span>
                          </div>
                          {s.note ? <p className="text-xs text-slate-500 mt-1">{s.note}</p> : null}
                          <div className="flex gap-1 mt-2">
                            <button
                              onClick={() => startEditSale(s)}
                              disabled={isEditingLoading}
                              className="flex-1 rounded-md border border-slate-300 text-slate-700 text-xs font-medium px-2 py-1 hover:bg-slate-100 flex items-center justify-center gap-1 disabled:bg-slate-200"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSale(s.id)}
                              disabled={isEditingLoading}
                              className="flex-1 rounded-md border border-red-300 text-red-700 text-xs font-medium px-2 py-1 hover:bg-red-50 flex items-center justify-center gap-1 disabled:bg-slate-200"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )) : (
                    <p className="text-sm text-slate-500">No sales recorded.</p>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">Expenses</h4>
                  <span className="text-xs text-slate-500">{selectedDayDetails.expenses.length} item(s)</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-auto">
                  {selectedDayDetails.expenses.length ? selectedDayDetails.expenses.map((e) => (
                    <div key={e.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      {editingExpenseId === e.id ? (
                        // Edit form for expense
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-slate-600 block font-medium mb-1">Type</label>
                            <select
                              value={editExpenseType}
                              onChange={(e) => setEditExpenseType(e.target.value)}
                              className="w-full rounded-md border border-slate-300 bg-white text-slate-900 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="salary">Salary</option>
                              <option value="operational_cost">Operational Cost</option>
                              <option value="stock_purchase">Stock Purchase</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-slate-600 block font-medium mb-1">Amount (₹)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editExpenseAmount}
                              onChange={(e) => setEditExpenseAmount(e.target.value)}
                              className="w-full rounded-md border border-slate-300 bg-white text-slate-900 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-600 block font-medium mb-1">Description</label>
                            <input
                              type="text"
                              value={editExpenseDescription}
                              onChange={(e) => setEditExpenseDescription(e.target.value)}
                              className="w-full rounded-md border border-slate-300 bg-white text-slate-900 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveExpenseEdit}
                              disabled={isEditingLoading}
                              className="flex-1 rounded-md bg-emerald-600 text-white text-xs font-medium px-2 py-1 hover:bg-emerald-700 disabled:bg-slate-400 flex items-center justify-center gap-1"
                            >
                              {isEditingLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                              Save
                            </button>
                            <button
                              onClick={() => setEditingExpenseId(null)}
                              disabled={isEditingLoading}
                              className="flex-1 rounded-md border border-slate-300 text-slate-700 text-xs font-medium px-2 py-1 hover:bg-slate-100 disabled:bg-slate-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display mode
                        <>
                          <div className="flex items-center justify-between text-sm text-slate-900 font-medium">
                            <span className="capitalize">{e.type.replace("_", " ")}</span>
                            <span>{currency.format(e.amount / 100)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-600 mt-1">
                            <span className="capitalize">Payment: {e.paymentMethod}</span>
                            {e.description ? <span className="text-slate-500 truncate max-w-[160px]" title={e.description}>{e.description}</span> : <span className="text-slate-400">No note</span>}
                          </div>
                          {e.items && e.items.length ? (
                            <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-slate-600">
                              {e.items.map((item) => (
                                <span key={`${e.id}-${item.productId}`} className="rounded-full border border-slate-200 bg-white px-2 py-1">
                                  {productName(item.productId)} × {item.qty}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          <div className="flex gap-1 mt-2">
                            <button
                              onClick={() => startEditExpense(e)}
                              disabled={isEditingLoading}
                              className="flex-1 rounded-md border border-slate-300 text-slate-700 text-xs font-medium px-2 py-1 hover:bg-slate-100 flex items-center justify-center gap-1 disabled:bg-slate-200"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(e.id)}
                              disabled={isEditingLoading}
                              className="flex-1 rounded-md border border-red-300 text-red-700 text-xs font-medium px-2 py-1 hover:bg-red-50 flex items-center justify-center gap-1 disabled:bg-slate-200"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )) : (
                    <p className="text-sm text-slate-500">No expenses recorded.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
