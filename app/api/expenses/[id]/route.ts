import { NextResponse } from "next/server";
import { getPool, isMySqlConfigured } from "@/lib/mysql";
import { memoryExpenses, updateMemoryExpenses } from "../../store";
import { Expense } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: expenseId } = await params;
  
  if (isMySqlConfigured()) {
    const pool = getPool();
    const [[expense]] = await pool.execute<any>(
      "SELECT * FROM expenses WHERE id = ?",
      [expenseId]
    );
    
    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    // Parse JSON items if they exist
    if (expense.items && typeof expense.items === "string") {
      expense.items = JSON.parse(expense.items);
    }
    
    return NextResponse.json(expense);
  }

  const expense = memoryExpenses.find((e) => e.id === expenseId);
  if (!expense) {
    return NextResponse.json({ message: "Expense not found" }, { status: 404 });
  }

  return NextResponse.json(expense);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: expenseId } = await params;
  const body = await request.json();
  const { type, amount, paymentMethod, description, date, items } = body;

  if (!type && typeof amount === "undefined" && !paymentMethod && !description && !date) {
    return NextResponse.json(
      { message: "At least one field must be provided" },
      { status: 400 }
    );
  }

  if (isMySqlConfigured()) {
    const pool = getPool();
    
    // Get the original expense
    const [[originalExpense]] = await pool.execute<any>(
      "SELECT * FROM expenses WHERE id = ?",
      [expenseId]
    );

    if (!originalExpense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];

    if (type) {
      updates.push("type = ?");
      values.push(type);
    }
    if (typeof amount !== "undefined") {
      updates.push("amount = ?");
      values.push(Number(amount));
    }
    if (paymentMethod) {
      updates.push("paymentMethod = ?");
      values.push(paymentMethod);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description || null);
    }
    if (date) {
      updates.push("date = ?");
      values.push(date);
    }
    if (items) {
      updates.push("items = ?");
      values.push(JSON.stringify(items));
    }

    values.push(expenseId);

    await pool.execute(
      `UPDATE expenses SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const [[updatedExpense]] = await pool.execute<any>(
      "SELECT * FROM expenses WHERE id = ?",
      [expenseId]
    );

    if (updatedExpense.items && typeof updatedExpense.items === "string") {
      updatedExpense.items = JSON.parse(updatedExpense.items);
    }

    return NextResponse.json(updatedExpense);
  }

  // Memory storage update
  const expenseIndex = memoryExpenses.findIndex((e) => e.id === expenseId);
  if (expenseIndex === -1) {
    return NextResponse.json({ message: "Expense not found" }, { status: 404 });
  }

  const originalExpense = memoryExpenses[expenseIndex];
  const updatedExpense: Expense = {
    ...originalExpense,
    type: (type || originalExpense.type) as any,
    amount: typeof amount !== "undefined" ? Number(amount) : originalExpense.amount,
    paymentMethod: (paymentMethod || originalExpense.paymentMethod) as any,
    description: description !== undefined ? description : originalExpense.description,
    date: date || originalExpense.date,
    items: items || originalExpense.items,
  };

  updateMemoryExpenses([
    ...memoryExpenses.slice(0, expenseIndex),
    updatedExpense,
    ...memoryExpenses.slice(expenseIndex + 1),
  ]);

  return NextResponse.json(updatedExpense);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: expenseId } = await params;

  if (isMySqlConfigured()) {
    const pool = getPool();
    
    // Get the expense before deleting
    const [[expense]] = await pool.execute<any>(
      "SELECT * FROM expenses WHERE id = ?",
      [expenseId]
    );

    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    // Delete the expense
    await pool.execute("DELETE FROM expenses WHERE id = ?", [expenseId]);

    return NextResponse.json({ message: "Expense deleted successfully" });
  }

  // Memory storage delete
  const expenseIndex = memoryExpenses.findIndex((e) => e.id === expenseId);
  if (expenseIndex === -1) {
    return NextResponse.json({ message: "Expense not found" }, { status: 404 });
  }

  updateMemoryExpenses([
    ...memoryExpenses.slice(0, expenseIndex),
    ...memoryExpenses.slice(expenseIndex + 1),
  ]);

  return NextResponse.json({ message: "Expense deleted successfully" });
}
