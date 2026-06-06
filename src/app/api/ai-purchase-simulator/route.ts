import { NextResponse } from "next/server";

type RequestBody = {
  itemName?: string;
  price?: number;
  availableCash?: number;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
};

function buildPrompt({
  itemName,
  price,
  availableCash
}: Required<RequestBody>) {
  const remainingCash = availableCash - price;

  return `
You are a personal finance assistant for a Korean single-person household dashboard.
Analyze whether buying the following item is safe based on available cash and upcoming expenses.

Return ONLY strict JSON with these keys:
- riskLevel: "safe" | "watch" | "danger"
- headline: short Korean headline
- summary: 2-3 Korean sentences explaining the risk
- remainingCash: number after purchase
- advice: short Korean recommendation

Context:
- Item name: ${itemName}
- Price: ${price}
- Available cash today: ${availableCash}
- Remaining cash after purchase: ${remainingCash}

Use a practical tone and make the recommendation conservative.
`.trim();
}

function extractText(payload: GeminiResponse) {
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini response did not contain text.");
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

  if (!itemName || typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    return NextResponse.json(
      {
        error: "itemName과 price를 올바르게 전달해야 합니다."
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
        contents: [
          {
            parts: [
              {
                text: buildPrompt({
                  itemName,
                  price,
                  availableCash
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
