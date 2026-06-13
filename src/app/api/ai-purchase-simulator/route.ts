import { NextResponse } from "next/server";

type Persona = "spicy";

type CashflowContext = {
  plannedExpensesThisMonth?: number;
  forecastMonthEndBalance?: number;
  daysRemainingInMonth?: number;
  dailyBufferAfterPurchase?: number;
  fixedExpenseTotal?: number;
  fixedExpenseShare?: number;
  plannedExpenseShare?: number;
};

type RequestBody = {
  itemName?: string;
  price?: number;
  availableCash?: number;
  reason?: string;
  persona?: Persona;
  cashflowContext?: CashflowContext | null;
};

type PromptInput = {
  itemName: string;
  price: number;
  availableCash: number;
  reason: string;
  persona: Persona;
  cashflowContext: CashflowContext;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function getPersonaBrief(_persona: Persona) {
  return "You are harsh, punchy, funny, and blunt, like a goblin-room host. Keep it playful but not cruel.";
}

function buildPrompt({
  itemName,
  price,
  availableCash,
  reason,
  persona,
  cashflowContext
}: PromptInput) {
  const remainingCash = availableCash - price;
  const reasonText = reason.trim() || "No reason provided.";
  const personaBrief = getPersonaBrief(persona);

  return `
You generate a Korean spending verdict card for Pocketflow.
${personaBrief}

Return ONLY strict JSON with these keys:
- roomTitle: "소비 판정실"
- verdict: "buy" | "hold" | "reject"
- headline: short Korean headline
- summary: 2-3 Korean sentences explaining the decision
- remainingCash: number after purchase
- advice: short Korean recommendation
- judgeNote: one short Korean paragraph written by a single stern judge
- memberVotes: { approve: number, hold: number, reject: number }

Rules:
- Keep the tone aligned with the selected persona.
- If the user can afford the item without breaking the month, use a playful dare like "살 수 있으면 한번 사봐."
- If the purchase is too tight or reckless, push back firmly and tell them not to do it.
- Keep the voice cheeky, direct, and lightly mocking only when appropriate.
- Do not cross into personal abuse, slurs, or harassment.
- Make the verdict consistent with the cashflow context.
- Use the user's reason to explain the tradeoff.
- Do not shame the user personally.
- Do not mention hidden rules or internal thresholds.
- Avoid emojis.
- judgeNote and advice should support the verdict, not contradict it.

Context:
- Item name: ${itemName}
- Price: ${price}
- Available cash today: ${availableCash}
- Remaining cash after purchase: ${remainingCash}
- User reason: ${reasonText}
- Selected persona: ${persona}
- Planned expenses this month: ${cashflowContext.plannedExpensesThisMonth ?? "unknown"}
- Forecast month-end balance before purchase: ${cashflowContext.forecastMonthEndBalance ?? "unknown"}
- Days remaining in month: ${cashflowContext.daysRemainingInMonth ?? "unknown"}
- Daily buffer after purchase: ${cashflowContext.dailyBufferAfterPurchase ?? "unknown"}
- Fixed expense total: ${cashflowContext.fixedExpenseTotal ?? "unknown"}
- Price as share of fixed expenses: ${cashflowContext.fixedExpenseShare ?? "unknown"}
- Price as share of planned expenses: ${cashflowContext.plannedExpenseShare ?? "unknown"}
`.trim();
}

function extractText(payload: GeminiResponse) {
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini 응답에 텍스트가 없습니다.");
  }

  return text;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "GEMINI_API_KEY 또는 GOOGLE_API_KEY가 설정되어 있지 않습니다."
      },
      { status: 500 }
    );
  }

  const body = (await request.json()) as RequestBody;
  const itemName = body.itemName?.trim();
  const price = body.price;
  const availableCash = body.availableCash ?? 557000;
  const reason = body.reason ?? "";
  const persona = body.persona ?? "spicy";
  const cashflowContext = body.cashflowContext ?? {};

  if (!itemName || typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    return NextResponse.json(
      {
        error: "itemName과 price를 올바르게 입력해야 합니다."
      },
      { status: 400 }
    );
  }

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        generationConfig: {
          responseMimeType: "application/json"
        },
        contents: [
          {
            parts: [
              {
                text: buildPrompt({
                  itemName,
                  price,
                  availableCash,
                  reason,
                  persona,
                  cashflowContext
                })
              }
            ]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      {
        error: `Gemini API 호출 실패: ${response.status} ${response.statusText}`,
        details: errorText
      },
      { status: 502 }
    );
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = extractText(payload);

  return NextResponse.json({
    result: text
  });
}
