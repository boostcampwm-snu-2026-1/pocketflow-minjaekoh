"use client";

import { useState } from "react";
import { Sparkles, Send, ShieldCheck, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SafetyLevel = "safe" | "warning" | "danger" | null;

interface AnalysisResult {
  level: SafetyLevel;
  message: string;
  details: string;
}

const mockAnalyze = (input: string): AnalysisResult => {
  // Extract amount from input (look for number patterns like 130만원, 50000원, etc.)
  const amountMatch = input.match(/(\d+)(만)?원/);
  let amount = 0;
  
  if (amountMatch) {
    amount = parseInt(amountMatch[1]);
    if (amountMatch[2] === "만") {
      amount = amount * 10000;
    }
  }

  // Mock analysis based on amount
  if (amount > 1000000) {
    return {
      level: "danger",
      message: "이번 달 예산 초과 위험",
      details: `현재 가용 현금흐름을 분석한 결과, ${new Intl.NumberFormat("ko-KR").format(amount)}원 지출 시 이번 달 적자가 예상됩니다. 다음 달로 구매를 미루거나, 할부 결제를 고려해보세요.`,
    };
  } else if (amount > 500000) {
    return {
      level: "warning",
      message: "주의가 필요한 지출",
      details: `이 물건을 구매하면 이번 달 저축 목표 달성이 어려울 수 있습니다. 하지만 기본 생활비와 고정 지출은 충당 가능합니다.`,
    };
  } else {
    return {
      level: "safe",
      message: "안전한 지출입니다",
      details: "현재 가용 현금흐름과 다음 주 예정된 고정 지출을 고려할 때, 이 물건을 구매해도 이번 달 흑자 유지가 가능합니다.",
    };
  }
};

export function AIPurchaseSimulator() {
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const analysisResult = mockAnalyze(input);
    setResult(analysisResult);
    setIsAnalyzing(false);
  };

  const getSafetyConfig = (level: SafetyLevel) => {
    switch (level) {
      case "safe":
        return {
          icon: ShieldCheck,
          color: "text-safe",
          bgColor: "bg-safe/10",
          borderColor: "border-safe/30",
          barColor: "bg-safe",
          percentage: 85,
        };
      case "warning":
        return {
          icon: AlertTriangle,
          color: "text-warning",
          bgColor: "bg-warning/10",
          borderColor: "border-warning/30",
          barColor: "bg-warning",
          percentage: 50,
        };
      case "danger":
        return {
          icon: XCircle,
          color: "text-danger",
          bgColor: "bg-danger/10",
          borderColor: "border-danger/30",
          barColor: "bg-danger",
          percentage: 15,
        };
      default:
        return null;
    }
  };

  const config = result ? getSafetyConfig(result.level) : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">
            AI 소비 시뮬레이터
          </h2>
          <p className="text-sm text-muted-foreground">
            이거 사도 될까?
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex flex-col gap-4 mb-6">
        <label className="text-sm text-muted-foreground">
          무엇을 사고 싶으신가요?
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="예: 아이패드 프로 130만원"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            className="flex-1 bg-input border-border placeholder:text-muted-foreground/60"
          />
          <Button
            onClick={handleAnalyze}
            disabled={!input.trim() || isAnalyzing}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isAnalyzing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Result Area */}
      {result && config && (
        <div className={cn(
          "flex-1 rounded-xl border p-5 transition-all",
          config.bgColor,
          config.borderColor
        )}>
          {/* Status Icon and Message */}
          <div className="flex items-center gap-3 mb-4">
            <config.icon className={cn("h-6 w-6", config.color)} />
            <span className={cn("font-semibold", config.color)}>
              {result.message}
            </span>
          </div>

          {/* Safety Gauge */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>재정 안전도</span>
              <span>{config.percentage}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div 
                className={cn("h-full rounded-full transition-all duration-500", config.barColor)}
                style={{ width: `${config.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>위험</span>
              <span>안전</span>
            </div>
          </div>

          {/* Detailed Analysis */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.details}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!result && !isAnalyzing && (
        <div className="flex-1 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border p-6">
          <Sparkles className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            구매하고 싶은 물건과 가격을 입력하면
            <br />
            AI가 현금흐름을 분석해드립니다.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="flex-1 flex flex-col items-center justify-center text-center rounded-xl border border-border bg-secondary/30 p-6">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent mb-3" />
          <p className="text-sm text-muted-foreground">
            현금흐름을 분석하고 있습니다...
          </p>
        </div>
      )}
    </div>
  );
}
