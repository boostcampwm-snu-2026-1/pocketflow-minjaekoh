"use client";

import { useState } from "react";
import { PocketflowSidebar } from "@/components/pocketflow-sidebar";
import { Bell, Settings, Plus, Check, Trash2, Link2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  cycle: string;
  cycleUnit: "days" | "weeks" | "months";
  cycleValue: number;
  apiSync: boolean;
  category: "fixed" | "semi-fixed";
}

// Dummy data
const initialFixedExpenses: RecurringExpense[] = [
  {
    id: "1",
    name: "월세",
    amount: 500000,
    cycle: "매월 26일",
    cycleUnit: "months",
    cycleValue: 1,
    apiSync: false,
    category: "fixed",
  },
  {
    id: "2",
    name: "관리비",
    amount: 50000,
    cycle: "매월 26일",
    cycleUnit: "months",
    cycleValue: 1,
    apiSync: false,
    category: "fixed",
  },
  {
    id: "3",
    name: "통신비",
    amount: 55000,
    cycle: "매월 10일",
    cycleUnit: "months",
    cycleValue: 1,
    apiSync: false,
    category: "fixed",
  },
];

const initialSemiFixedExpenses: RecurringExpense[] = [
  {
    id: "4",
    name: "식료품",
    amount: 45000,
    cycle: "3주 주기",
    cycleUnit: "weeks",
    cycleValue: 3,
    apiSync: true,
    category: "semi-fixed",
  },
  {
    id: "5",
    name: "생활용품",
    amount: 25000,
    cycle: "2개월 주기",
    cycleUnit: "months",
    cycleValue: 2,
    apiSync: true,
    category: "semi-fixed",
  },
];

export default function RecurringExpensesPage() {
  const [fixedExpenses] = useState<RecurringExpense[]>(initialFixedExpenses);
  const [semiFixedExpenses] = useState<RecurringExpense[]>(initialSemiFixedExpenses);
  const [selectedExpense, setSelectedExpense] = useState<RecurringExpense | null>(null);
  
  // Form state for detail panel
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCycleValue, setEditCycleValue] = useState("1");
  const [editCycleUnit, setEditCycleUnit] = useState<"days" | "weeks" | "months">("months");
  const [editApiSync, setEditApiSync] = useState(false);

  const handleSelectExpense = (expense: RecurringExpense) => {
    setSelectedExpense(expense);
    setEditName(expense.name);
    setEditAmount(expense.amount.toString());
    setEditCycleValue(expense.cycleValue.toString());
    setEditCycleUnit(expense.cycleUnit);
    setEditApiSync(expense.apiSync);
  };

  const handleNewFixed = () => {
    setSelectedExpense({
      id: "new",
      name: "",
      amount: 0,
      cycle: "",
      cycleUnit: "months",
      cycleValue: 1,
      apiSync: false,
      category: "fixed",
    });
    setEditName("");
    setEditAmount("");
    setEditCycleValue("1");
    setEditCycleUnit("months");
    setEditApiSync(false);
  };

  const handleNewSemiFixed = () => {
    setSelectedExpense({
      id: "new",
      name: "",
      amount: 0,
      cycle: "",
      cycleUnit: "weeks",
      cycleValue: 2,
      apiSync: true,
      category: "semi-fixed",
    });
    setEditName("");
    setEditAmount("");
    setEditCycleValue("2");
    setEditCycleUnit("weeks");
    setEditApiSync(true);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <PocketflowSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-border px-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="https://github.com/shadcn.png" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Welcome Back!</p>
              <p className="text-lg font-semibold text-foreground">John Doe</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-secondary border-border">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-secondary border-border">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page Content - 3 Column Layout */}
        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            
            {/* Section A: Fixed Costs */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-foreground">고정비 (매월 정기 지출)</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1 rounded-lg bg-secondary border-border text-xs"
                  onClick={handleNewFixed}
                >
                  <Plus className="h-3 w-3" />
                  추가
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                월세, 관리비, 통신비 등 금액이 고정된 지출
              </p>

              <div className="flex flex-col gap-3">
                {fixedExpenses.map((expense) => (
                  <button
                    key={expense.id}
                    onClick={() => handleSelectExpense(expense)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                      selectedExpense?.id === expense.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/50 hover:bg-secondary"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-foreground">{expense.name}</span>
                      <span className="text-xs text-muted-foreground">{expense.cycle}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {expense.amount.toLocaleString()}원
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section B: Semi-Fixed Costs */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-foreground">준고정비 (주기적 생필품)</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1 rounded-lg bg-secondary border-border text-xs"
                  onClick={handleNewSemiFixed}
                >
                  <Plus className="h-3 w-3" />
                  추가
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                식자재, 생활용품 등 주기가 있는 변동 지출
              </p>

              <div className="flex flex-col gap-3">
                {semiFixedExpenses.map((expense) => (
                  <button
                    key={expense.id}
                    onClick={() => handleSelectExpense(expense)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                      selectedExpense?.id === expense.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/50 hover:bg-secondary"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{expense.name}</span>
                        {expense.apiSync && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-1/20 text-chart-1 text-[10px] font-medium">
                            <Link2 className="h-2.5 w-2.5" />
                            API
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{expense.cycle}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {expense.amount.toLocaleString()}원
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section C: Detail & API Setup Panel */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">상세 설정 및 스마트 예측</h2>
              <p className="text-sm text-muted-foreground mb-6">
                항목을 선택하여 상세 정보를 편집하세요
              </p>

              {selectedExpense ? (
                <div className="flex flex-col gap-5">
                  {/* Item Name */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name" className="text-sm text-muted-foreground">항목명</Label>
                    <Input
                      id="name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="지출 항목명 입력"
                      className="bg-secondary border-border"
                    />
                  </div>

                  {/* Amount */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="amount" className="text-sm text-muted-foreground">금액 (원)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      placeholder="0"
                      className="bg-secondary border-border"
                    />
                  </div>

                  {/* Cycle */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm text-muted-foreground">결제 주기</Label>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        min="1"
                        value={editCycleValue}
                        onChange={(e) => setEditCycleValue(e.target.value)}
                        className="w-20 bg-secondary border-border"
                      />
                      <Select value={editCycleUnit} onValueChange={(v) => setEditCycleUnit(v as "days" | "weeks" | "months")}>
                        <SelectTrigger className="flex-1 bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">일 마다</SelectItem>
                          <SelectItem value="weeks">주 마다</SelectItem>
                          <SelectItem value="months">개월 마다</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* API Sync Toggle */}
                  <div className="flex flex-col gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-foreground">네이버 쇼핑 API 연동</span>
                        <span className="text-xs text-muted-foreground">최저가 자동 업데이트</span>
                      </div>
                      <Switch
                        checked={editApiSync}
                        onCheckedChange={setEditApiSync}
                      />
                    </div>
                    {editApiSync && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-chart-1/20 text-chart-1 text-xs font-medium">
                          <Check className="h-3 w-3" />
                          API Sync Active
                        </span>
                        <span className="text-xs text-muted-foreground">마지막 동기화: 2시간 전</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                      저장
                    </Button>
                    <Button variant="outline" className="gap-2 border-destructive text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                      삭제
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Settings className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    왼쪽 목록에서 항목을 선택하거나<br />
                    새 항목을 추가하세요
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
