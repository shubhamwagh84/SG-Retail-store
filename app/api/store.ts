import { Product, Sale, Expense } from "@/lib/types";
import { sampleProducts, sampleSales } from "@/lib/sample";

// Shared in-memory storage across API routes
export let memoryProducts: Product[] = [...sampleProducts];
export let memorySales: Sale[] = [...sampleSales];
export let memoryExpenses: Expense[] = [];

export function updateMemoryProducts(products: Product[]) {
  memoryProducts = products;
}

export function updateMemorySales(sales: Sale[]) {
  memorySales = sales;
}

export function updateMemoryExpenses(expenses: Expense[]) {
  memoryExpenses = expenses;
}
