"use client";

import { useState } from "react";
import { PocketflowSidebar } from "@/components/pocketflow-sidebar";
import { ExpenseForm } from "@/components/expense-form";
import { RecentExpenses } from "@/components/recent-expenses";
import { AIPurchaseSimulator } from "@/components/ai-purchase-simulator";
import { Bell, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Expense {
  id: string;
  date: Date;
  name: string;
  amount: number;
  category: string;
}

// Initial dummy data
const initialExpenses: Expense[] = [
  {
    id: "1",
    date: new Date(),
    name: "닭가슴살 5kg",
    amount: 39900,
    category: "food",
  },
  {
    id: "2",
    date: new Date(Date.now() - 86400000),
    name: "마늘 및 파스타 재료",
    amount: 12000,
    category: "food",
  },
  {
    id: "3",
    date: new Date(Date.now() - 86400000 * 2),
    name: "블랙 머스크 디퓨저",
    amount: 25000,
    category: "living",
  },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  const handleAddExpense = (expense: {
    date: Date;
    name: string;
    amount: number;
    category: string;
  }) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      ...expense,
    };
    setExpenses([newExpense, ...expenses]);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <PocketflowSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between border-b border-border px-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarImage src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/01-Dashboard-ntPNCQ44l3ywrwvQlWM6TK0CvFJmx7.png" />
              <AvatarFallback className="bg-secondary text-foreground">JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Welcome Back!</p>
              <p className="text-lg font-semibold text-foreground">John Doe</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">지출 관리</h1>
            <p className="text-sm text-muted-foreground mt-1">
              지출을 기록하고 AI로 소비 패턴을 분석하세요.
            </p>
          </div>

          {/* Three Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Expense Form */}
            <div className="lg:col-span-1">
              <ExpenseForm onAdd={handleAddExpense} />
            </div>

            {/* Center Column - Recent Expenses */}
            <div className="lg:col-span-1">
              <RecentExpenses expenses={expenses} />
            </div>

            {/* Right Column - AI Purchase Simulator */}
            <div className="lg:col-span-1">
              <AIPurchaseSimulator />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
