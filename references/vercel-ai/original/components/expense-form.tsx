"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const categories = [
  { value: "food", label: "식비" },
  { value: "transport", label: "교통비" },
  { value: "living", label: "생활용품" },
  { value: "entertainment", label: "유흥" },
  { value: "subscription", label: "구독료" },
  { value: "etc", label: "기타" },
];

interface ExpenseFormProps {
  onAdd: (expense: {
    date: Date;
    name: string;
    amount: number;
    category: string;
  }) => void;
}

export function ExpenseForm({ onAdd }: ExpenseFormProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = () => {
    if (!name || !amount || !category) return;

    onAdd({
      date,
      name,
      amount: parseInt(amount),
      category,
    });

    // Reset form
    setName("");
    setAmount("");
    setCategory("");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-6 text-lg font-semibold text-card-foreground">
        새로운 지출 추가
      </h2>

      <div className="flex flex-col gap-4">
        {/* Date Picker */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground">날짜</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-input border-border hover:bg-muted",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "PPP", { locale: ko })
                ) : (
                  <span>날짜 선택</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Item Name */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground">항목명</label>
          <Input
            placeholder="예: 점심 식사"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-input border-border placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground">금액</label>
          <Input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-input border-border placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground">카테고리</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full bg-input border-border">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          추가하기
        </Button>
      </div>
    </div>
  );
}
