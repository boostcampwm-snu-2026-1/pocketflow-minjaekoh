import { NextResponse } from "next/server";

type NaverShoppingItem = {
  title?: string;
  link?: string;
  image?: string;
  lprice?: string;
  hprice?: string;
  mallName?: string;
  productId?: string;
  brand?: string;
  maker?: string;
  category1?: string;
  category2?: string;
  category3?: string;
  category4?: string;
};

type NaverShoppingResponse = {
  total?: number;
  start?: number;
  display?: number;
  items?: NaverShoppingItem[];
};

type ShoppingSearchItem = {
  title: string;
  link: string;
  image: string | null;
  price: number;
  mallName: string;
  productId: string;
  brand: string | null;
  maker: string | null;
  categoryPath: string[];
};

type ShoppingSearchSummary = {
  minPrice: number;
  medianPrice: number;
  maxPrice: number;
  averagePrice: number;
  recommendedPrice: number;
  pricedItemCount: number;
  rawPricedItemCount: number;
  discardedItemCount: number;
  priceFloor: number;
};

type ShoppingSearchResponse = {
  provider: "naver-shopping";
  query: string;
  fetchedAt: string;
  total: number;
  summary: ShoppingSearchSummary;
  items: ShoppingSearchItem[];
};

type CacheEntry = {
  expiresAt: number;
  response: ShoppingSearchResponse;
};

type PriceFilteringResult = {
  items: ShoppingSearchItem[];
  rawPricedItemCount: number;
  discardedItemCount: number;
  priceFloor: number;
};

const cache = new Map<string, CacheEntry>();
const cacheTtlMs = 5 * 60 * 1000;

function normalizeTitle(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function clampDisplay(value: number | null) {
  if (!Number.isFinite(value ?? NaN)) {
    return 10;
  }

  return Math.min(100, Math.max(1, Math.trunc(value ?? 10)));
}

function median(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  }

  return sorted[middle];
}

function percentile(sortedValues: number[], ratio: number) {
  if (sortedValues.length === 0) {
    return 0;
  }

  if (sortedValues.length === 1) {
    return sortedValues[0];
  }

  const clampedRatio = Math.min(1, Math.max(0, ratio));
  const index = (sortedValues.length - 1) * clampedRatio;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sortedValues[lower];
  }

  const weight = index - lower;
  return Math.round(sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight);
}

function filterSuspiciousPrices(items: ShoppingSearchItem[]): PriceFilteringResult {
  const pricedItems = items.filter((item) => item.price > 0);

  if (pricedItems.length === 0) {
    return {
      items: [],
      rawPricedItemCount: 0,
      discardedItemCount: 0,
      priceFloor: 0
    };
  }

  const prices = pricedItems.map((item) => item.price).sort((left, right) => left - right);
  const highestPrice = prices[prices.length - 1];

  if (highestPrice <= 10) {
    return {
      items: [],
      rawPricedItemCount: pricedItems.length,
      discardedItemCount: pricedItems.length,
      priceFloor: 0
    };
  }

  const splitIndex = prices.findIndex((price, index) => {
    if (index === prices.length - 1) {
      return false;
    }

    const next = prices[index + 1];
    const gap = next - price;
    return gap >= 5000 && price <= 1000 && next >= 1000;
  });

  if (splitIndex >= 0) {
    const threshold = prices[splitIndex + 1];
    const clusteredItems = pricedItems.filter((item) => item.price >= threshold);

    if (clusteredItems.length >= 2) {
      return {
        items: clusteredItems,
        rawPricedItemCount: pricedItems.length,
        discardedItemCount: pricedItems.length - clusteredItems.length,
        priceFloor: threshold
      };
    }
  }

  const medianPrice = median(prices);
  const priceFloor = Math.max(100, Math.floor(medianPrice * 0.1));
  const floorFiltered = pricedItems.filter((item) => item.price >= priceFloor);

  if (floorFiltered.length === 0) {
    return {
      items: pricedItems,
      rawPricedItemCount: pricedItems.length,
      discardedItemCount: 0,
      priceFloor
    };
  }

  if (floorFiltered.length < 5) {
    return {
      items: floorFiltered,
      rawPricedItemCount: pricedItems.length,
      discardedItemCount: pricedItems.length - floorFiltered.length,
      priceFloor
    };
  }

  const cleanedPrices = floorFiltered
    .map((item) => item.price)
    .sort((left, right) => left - right);
  const q1 = percentile(cleanedPrices, 0.25);
  const q3 = percentile(cleanedPrices, 0.75);
  const iqr = q3 - q1;
  const lowerFence = Math.max(priceFloor, Math.floor(q1 - iqr * 1.5));
  const upperFence = Math.ceil(q3 + iqr * 1.5);
  const finalItems = floorFiltered.filter(
    (item) => item.price >= lowerFence && item.price <= upperFence
  );

  return {
    items: finalItems.length > 0 ? finalItems : floorFiltered,
    rawPricedItemCount: pricedItems.length,
    discardedItemCount:
      pricedItems.length - (finalItems.length > 0 ? finalItems.length : floorFiltered.length),
    priceFloor
  };
}

function getSummary(items: ShoppingSearchItem[]): ShoppingSearchSummary {
  const filtered = filterSuspiciousPrices(items);
  const prices = filtered.items.map((item) => item.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const averagePrice =
    prices.length > 0
      ? Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)
      : 0;
  const medianPrice = median(prices);

  return {
    minPrice,
    medianPrice,
    maxPrice,
    averagePrice,
    recommendedPrice: medianPrice || averagePrice || minPrice,
    pricedItemCount: filtered.items.length,
    rawPricedItemCount: filtered.rawPricedItemCount,
    discardedItemCount: filtered.discardedItemCount,
    priceFloor: filtered.priceFloor
  };
}

function toResponse(payload: ShoppingSearchResponse, status = 200) {
  const response = NextResponse.json(payload, { status });
  response.headers.set("Cache-Control", "private, max-age=300");
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.trim();
  const display = clampDisplay(Number(url.searchParams.get("display")));
  const filter = url.searchParams.get("filter") ?? "";
  const exclude = url.searchParams.get("exclude") ?? "";
  const sort = "sim";

  if (!query) {
    return NextResponse.json(
      { error: "query가 필요합니다." },
      { status: 400 }
    );
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error: "NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET이 설정되어 있지 않습니다."
      },
      { status: 500 }
    );
  }

  const cacheKey = JSON.stringify({ query, display, sort, filter, exclude });
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return toResponse(cached.response);
  }

  const upstream = new URL("https://openapi.naver.com/v1/search/shop.json");
  upstream.searchParams.set("query", query);
  upstream.searchParams.set("display", String(display));
  upstream.searchParams.set("start", "1");
  upstream.searchParams.set("sort", sort);

  if (filter) {
    upstream.searchParams.set("filter", filter);
  }

  if (exclude) {
    upstream.searchParams.set("exclude", exclude);
  }

  const response = await fetch(upstream.toString(), {
    method: "GET",
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret
    }
  });

  if (!response.ok) {
    const errorText = await response.text();

    return NextResponse.json(
      {
        error: `Naver shopping API 호출 실패: ${response.status} ${response.statusText}`,
        details: errorText
      },
      { status: 502 }
    );
  }

  const payload = (await response.json()) as NaverShoppingResponse;
  const items = (payload.items ?? [])
    .map<ShoppingSearchItem>((item) => {
      const price = Number(item.lprice ?? 0);

      return {
        title: normalizeTitle(item.title ?? ""),
        link: item.link ?? "",
        image: item.image ?? null,
        price: Number.isFinite(price) ? price : 0,
        mallName: item.mallName ?? "네이버",
        productId: item.productId ?? "",
        brand: item.brand?.trim() || null,
        maker: item.maker?.trim() || null,
        categoryPath: [
          item.category1,
          item.category2,
          item.category3,
          item.category4
        ].filter((value): value is string => Boolean(value?.trim()))
      };
    })
    .filter((item) => item.title.length > 0)
    .sort((left, right) => left.price - right.price);

  const filtered = filterSuspiciousPrices(items);

  const result: ShoppingSearchResponse = {
    provider: "naver-shopping",
    query,
    fetchedAt: new Date().toISOString(),
    total: Number(payload.total ?? items.length),
    summary: getSummary(items),
    items: filtered.items
  };

  cache.set(cacheKey, {
    expiresAt: Date.now() + cacheTtlMs,
    response: result
  });

  return toResponse(result);
}
