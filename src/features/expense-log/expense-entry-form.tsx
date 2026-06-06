"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

type ExpenseFormState = {
  date: string;
  name: string;
  amount: string;
  category: string;
};

type ExpenseFormErrors = Partial<Record<keyof ExpenseFormState, string>>;

type ExpenseEntryFormProps = {
  onSubmitSimulationHint?: (expense: {
    date: string;
    name: string;
    category: string;
    amount: number;
  }) => void;
};

const initialState: ExpenseFormState = {
  date: "",
  name: "",
  amount: "",
  category: "식비"
};

const categoryOptions = ["식비", "생활용품", "교통비", "주거비", "기타"] as const;

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

export function ExpenseEntryForm({
  onSubmitSimulationHint
}: ExpenseEntryFormProps) {
  const [form, setForm] = useState<ExpenseFormState>(initialState);
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [submittedCount, setSubmittedCount] = useState(0);

  const isAmountValid = /^\d+$/.test(form.amount.trim());

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmittedCount((count) => count + 1);
    onSubmitSimulationHint?.({
      date: form.date,
      name: form.name.trim(),
      category: form.category,
      amount: Number(form.amount)
    });
    setForm((current) => ({
      ...initialState,
      category: current.category
    }));
    setErrors({});
  }

  return (
    <section aria-labelledby="expense-entry-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Expense entry</p>
        <h2 id="expense-entry-heading" className="text-xl font-semibold">
          신규 지출 추가
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          날짜, 항목명, 금액, 카테고리를 입력하면 다음 단계에서 리스트와 상태에 연결할 수 있습니다.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border bg-card p-5 md:p-6"
        noValidate
      >
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
              placeholder="예: 점심 식사"
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
            숫자만 입력되며, 제출 전에 필수값을 검증합니다.
          </p>
          <button
            type="submit"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            추가하기
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-border/70 bg-background px-4 py-3 text-sm">
          <span className="text-muted-foreground">최근 제출 횟수</span>
          <span className="font-medium text-foreground">{submittedCount}회</span>
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
