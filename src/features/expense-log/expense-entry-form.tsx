"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

type TransactionType = "expense" | "income";

type ExpenseFormState = {
  date: string;
  name: string;
  amount: string;
  category: string;
  type: TransactionType;
};

type ExpenseFormErrors = Partial<Record<keyof ExpenseFormState, string>>;

type ExpenseEntryFormProps = {
  onSubmitSimulationHint?: (expense: {
    date: string;
    name: string;
    category: string;
    amount: number;
    type: TransactionType;
  }) => void;
};

const initialState: ExpenseFormState = {
  date: "",
  name: "",
  amount: "",
  category: "식비",
  type: "expense"
};

const categoryOptionsByType: Record<TransactionType, string[]> = {
  expense: ["식비", "교통비", "고정비", "준고정비", "변동비"],
  income: ["급여", "용돈", "상여", "기타수입"]
};

function validate(form: ExpenseFormState) {
  const errors: ExpenseFormErrors = {};

  if (!form.date) {
    errors.date = "날짜를 선택해 주세요.";
  }

  if (!form.name.trim()) {
    errors.name = "항목명을 입력해 주세요.";
  }

  if (!form.amount.trim()) {
    errors.amount = "금액을 입력해 주세요.";
  } else if (!/^\d+$/.test(form.amount.trim())) {
    errors.amount = "금액은 숫자만 입력할 수 있습니다.";
  }

  if (!form.category) {
    errors.category = "카테고리를 선택해 주세요.";
  }

  return errors;
}

export function ExpenseEntryForm({ onSubmitSimulationHint }: ExpenseEntryFormProps) {
  const [form, setForm] = useState<ExpenseFormState>(initialState);
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [submittedCount, setSubmittedCount] = useState(0);

  const isAmountValid = /^\d+$/.test(form.amount.trim());
  const categoryOptions = categoryOptionsByType[form.type];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const nextExpense = {
      date: form.date,
      name: form.name.trim(),
      category: form.category,
      amount: Number(form.amount),
      type: form.type
    };

    setSubmittedCount((count) => count + 1);
    onSubmitSimulationHint?.(nextExpense);
    setForm((current) => ({
      ...initialState,
      type: current.type,
      category: categoryOptionsByType[current.type][0]
    }));
    setErrors({});
  }

  return (
    <section aria-labelledby="expense-entry-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Transaction entry</p>
        <h2 id="expense-entry-heading" className="text-xl font-semibold">
          수입 / 지출 기록
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          날짜, 항목명, 금액, 카테고리, 유형을 입력해 실제 발생한 수입과 지출을 기록합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 md:p-6" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="날짜" error={errors.date}>
            <input
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((current) => ({ ...current, date: event.target.value }))
              }
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </Field>

          <Field label="유형" error={errors.type}>
            <select
              value={form.type}
              onChange={(event) =>
                setForm((current) => {
                  const nextType = event.target.value as TransactionType;

                  return {
                    ...current,
                    type: nextType,
                    category: categoryOptionsByType[nextType][0]
                  };
                })
              }
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition-colors focus:border-primary"
            >
              <option value="expense">지출</option>
              <option value="income">수입</option>
            </select>
          </Field>

          <Field label="카테고리" error={errors.category}>
            <select
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition-colors focus:border-primary"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>

          <Field label="항목명" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="예: 치킨 배달"
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </Field>

          <Field label="금액" error={errors.amount}>
            <input
              type="text"
              inputMode="numeric"
              value={form.amount}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  amount: event.target.value.replace(/[^\d]/g, "")
                }))
              }
              placeholder="예: 12000"
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            숫자만 입력하면 금액을 검증합니다. 이 화면은 실제 결제와 입금만 저장합니다.
          </p>
          <button
            type="submit"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            기록 추가
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-border/70 bg-background px-4 py-3 text-sm">
          <span className="text-muted-foreground">최근 기록 수</span>
          <span className="font-medium text-foreground">{submittedCount}건</span>
        </div>

        {isAmountValid && form.amount ? (
          <p className="mt-3 text-xs text-muted-foreground">
            입력된 금액: {Number(form.amount).toLocaleString("ko-KR")}원
          </p>
        ) : null}
      </form>
    </section>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </label>
  );
}
