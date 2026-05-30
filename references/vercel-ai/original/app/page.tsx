"use client";

import { PocketflowSidebar } from "@/components/pocketflow-sidebar";
import { Bell, Settings, Calendar, TrendingUp, Wallet, CreditCard, ArrowUpRight, BarChart3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Stats data
const stats = [
  { label: "오늘 사용 가능 금액", value: "₩127,000", icon: Wallet },
  { label: "예상 월말 잔액", value: "₩342,000", icon: TrendingUp },
  { label: "예산 사용률", value: "68%", icon: BarChart3 },
  { label: "이번 달 예정 지출", value: "₩89,000", icon: CreditCard },
];

// Upcoming expenses
const upcomingExpenses = [
  { label: "통신비", dDay: 2, amount: "55,000원" },
  { label: "넷플릭스", dDay: 5, amount: "17,000원" },
  { label: "닭가슴살", dDay: 7, amount: "39,900원" },
];

// Daily cash flow data for the current month (November) - 더 현실적인 금액
const dailyCashFlowData = [
  { day: 1, balance: 520000, label: "1일" },
  { day: 2, balance: 498000, label: "2일" },
  { day: 3, balance: 485000, label: "3일" },
  { day: 4, balance: 462000, label: "4일" },
  { day: 5, balance: 445000, label: "5일" },
  { day: 6, balance: 423000, label: "6일" },
  { day: 7, balance: 398000, label: "7일" },
  { day: 8, balance: 375000, label: "8일" },
  { day: 9, balance: 358000, label: "9일" },
  { day: 10, balance: 342000, label: "10일" },
  { day: 11, balance: 315000, label: "11일" },
  { day: 12, balance: 298000, label: "12일" },
  { day: 13, balance: 275000, label: "13일" },
  { day: 14, balance: 248000, label: "14일" },
  { day: 15, balance: 225000, label: "15일" },
  { day: 16, balance: 198000, label: "16일" },
  { day: 17, balance: 182000, label: "17일" },
  { day: 18, balance: 165000, label: "18일" },
  { day: 19, balance: 148000, label: "19일" },
  { day: 20, balance: 125000, label: "20일" },
  { day: 21, balance: 108000, label: "21일" },
  { day: 22, balance: 95000, label: "22일" },
  { day: 23, balance: 78000, label: "23일" },
  { day: 24, balance: 62000, label: "24일" },
  { day: 25, balance: 580000, label: "25일" }, // 월급날
  { day: 26, balance: 545000, label: "26일" },
  { day: 27, balance: 512000, label: "27일" },
  { day: 28, balance: 485000, label: "28일" },
  { day: 29, balance: 358000, label: "29일" },
  { day: 30, balance: 342000, label: "30일" },
];

// Custom Tooltip component
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { day: number; balance: number } }> }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-popover px-4 py-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">11월 {data.day}일</p>
        <p className="text-sm text-muted-foreground">
          예상 잔액: <span className="font-semibold text-foreground">₩{data.balance.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function Page() {
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

        {/* Main Area with Right Sidebar */}
        <div className="flex flex-1">
          {/* Center Content */}
          <main className="flex-1 p-8">
            {/* Date Selector */}
            <div className="mb-6">
              <Button variant="outline" className="bg-secondary border-border text-foreground hover:bg-muted">
                <Calendar className="mr-2 h-4 w-4" />
                11 Nov - 11 Dec, 2026
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Cash Flow Chart Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">예상 현금흐름 (일별 추이)</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-secondary border-border">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-secondary border-border">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Daily Line Chart */}
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyCashFlowData}
                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                  >
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#a1a1a1", fontSize: 11 }}
                      interval={4}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#a1a1a1", fontSize: 11 }}
                      tickFormatter={(value) => `₩${(value / 10000).toFixed(0)}만`}
                      domain={["dataMin - 20000", "dataMax + 20000"]}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3a3a3a", strokeWidth: 1 }} />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="#ffffff"
                      strokeWidth={2}
                      dot={{ fill: "#ffffff", strokeWidth: 0, r: 4 }}
                      activeDot={{ fill: "#f5e942", strokeWidth: 0, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Summary */}
              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border">
                <p className="text-2xl font-bold text-foreground">₩342,000</p>
                <p className="text-sm text-muted-foreground">
                  예상 월말 잔액 (11월 30일 기준)
                </p>
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="w-80 border-l border-border p-6">
            {/* Upcoming Expenses */}
            <div className="rounded-2xl border border-border bg-card p-5 mb-6">
              <h3 className="text-base font-semibold text-foreground mb-4">다가오는 지출</h3>
              <div className="flex flex-col gap-3">
                {upcomingExpenses.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">D-{expense.dDay}</span>
                      <span className="text-sm text-foreground">{expense.label}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{expense.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis Card */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-base font-semibold text-foreground mb-4">AI 소비분석</h3>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-muted-foreground to-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                이번 달 소비 패턴 분석 중...
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
