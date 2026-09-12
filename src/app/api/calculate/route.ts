import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      fineness, 
      weight, 
      gold_rate_24k, 
      making_charges, 
      making_charges_type, 
      wastage, 
      stone_charges, 
      jeweller_quote, 
      huid 
    } = body;
    
    const hallmarkMap: Record<number, string> = {
        417: "10K",
        583: "14K",
        750: "18K",
        916: "22K",
        999: "24K"
    };
    const detected_karat = hallmarkMap[fineness] || "Unknown";
    
    const effective_rate = gold_rate_24k * (fineness / 999.0);
    const base_gold_value = weight * effective_rate;
    const wastage_value = base_gold_value * (wastage / 100.0);
    
    let making_charges_value = 0.0;
    if (making_charges_type === "percentage") {
        making_charges_value = (base_gold_value + wastage_value) * (making_charges / 100.0);
    } else {
        making_charges_value = making_charges;
    }
    
    const pre_tax_total = base_gold_value + wastage_value + making_charges_value + stone_charges;
    const gst_value = pre_tax_total * 0.03;
    const estimated_total = pre_tax_total + gst_value;
    
    let difference = 0.0;
    let rating = null;
    
    if (jeweller_quote) {
        difference = jeweller_quote - estimated_total;
        if (difference <= estimated_total * 0.02) {
            rating = "Fair Price";
        } else if (difference <= estimated_total * 0.05) {
            rating = "Slightly Higher";
        } else {
            rating = "Significantly Higher";
        }
    }
    
    return NextResponse.json({
        effective_rate: Math.round(effective_rate * 100) / 100,
        detected_karat,
        huid,
        gold_value: Math.round(base_gold_value * 100) / 100,
        wastage_value: Math.round(wastage_value * 100) / 100,
        making_charges_value: Math.round(making_charges_value * 100) / 100,
        stone_charges: Math.round(stone_charges * 100) / 100,
        gst_value: Math.round(gst_value * 100) / 100,
        estimated_total: Math.round(estimated_total * 100) / 100,
        jeweller_quote: jeweller_quote ? Math.round(jeweller_quote * 100) / 100 : null,
        difference: Math.round(difference * 100) / 100,
        rating
    });
  } catch (error) {
    console.error("Calculation error:", error);
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
