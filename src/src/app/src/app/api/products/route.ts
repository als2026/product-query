import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    if (action === "brands") {
      const { data, error } = await supabaseAdmin
        .from("products")
        .select("品牌")
        .order("品牌");

      if (error) throw error;

      const brands = [...new Set(data?.map((item) => item.品牌).filter(Boolean) || [])];
      return NextResponse.json({ brands });
    }

    if (action === "list") {
      const keyword = searchParams.get("keyword") || "";
      const brand = searchParams.get("brand");
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");

      let query = supabaseAdmin.from("products").select("*", { count: "exact" });

      if (keyword) {
        const keywords = keyword.split(",").filter(Boolean);
        if (keywords.length > 0) {
          query = query.or(
            keywords.map((k) => `产品名称.ilike.%${k.trim()}%,规格型号.ilike.%${k.trim()}%`).join(",")
          );
        }
      }

      if (brand && brand !== "全部") {
        query = query.eq("品牌", brand);
      }

      if (minPrice) {
        query = query.gte("VIP价格", parseFloat(minPrice));
      }

      if (maxPrice) {
        query = query.lte("VIP价格", parseFloat(maxPrice));
      }

      const { data, error, count } = await query.order("id").limit(500);

      if (error) throw error;

      return NextResponse.json({ products: data || [], total: count || 0 });
    }

    if (action === "export") {
      const keyword = searchParams.get("keyword") || "";
      const brand = searchParams.get("brand");

      let query = supabaseAdmin.from("products").select("*");

      if (keyword) {
        const keywords = keyword.split(",").filter(Boolean);
        if (keywords.length > 0) {
          query = query.or(
            keywords.map((k) => `产品名称.ilike.%${k.trim()}%,规格型号.ilike.%${k.trim()}%`).join(",")
          );
        }
      }

      if (brand && brand !== "全部") {
        query = query.eq("品牌", brand);
      }

      const { data, error } = await query.order("id");

      if (error) throw error;

      const csvContent = [
        ["序号", "产品名称", "规格型号", "品牌", "单位", "市场价", "VIP价格", "库存", "备注"].join(","),
        ...(data || []).map((item: any, index: number) =>
          [
            index + 1,
            `"${(item.产品名称 || "").replace(/"/g, '""')}"`,
            `"${(item.规格型号 || "").replace(/"/g, '""')}"`,
            `"${(item.品牌 || "").replace(/"/g, '""')}"`,
            `"${(item.单位 || "").replace(/"/g, '""')}"`,
            item.市场价 || "",
            item.VIP价格 || "",
            `"${(item.库存 || "").replace(/"/g, '""')}"`,
            `"${(item.备注 || "").replace(/"/g, '""')}"`,
          ].join(",")
        ),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="products_${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
