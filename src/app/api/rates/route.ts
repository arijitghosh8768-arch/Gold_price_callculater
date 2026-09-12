import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch("https://api.goldprice.dev/v1/carat?currency=INR", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }
    
    const data = await res.json();
    
    const response = {
      rates: {
        "24K": parseFloat(data.price_gram_24k) || 7400.0,
        "22K": parseFloat(data.price_gram_22k) || 6800.0,
        "18K": parseFloat(data.price_gram_18k) || 5550.0
      },
      updated_at: data.timestamp || new Date().toISOString(),
      source: "GoldPrice.dev (Next.js Cached)"
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching live rates:", error);
    return NextResponse.json({
      rates: {
        "24K": 7400.0,
        "22K": 6800.0,
        "18K": 5550.0
      },
      updated_at: new Date().toISOString(),
      source: "Mock Data (Fallback)"
    });
  }
}
