"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: number;
  产品名称: string;
  规格型号: string;
  品牌: string;
  单位: string;
  市场价: string;
  VIP价格: string;
  库存: string;
  备注: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [brandFilter, setBrandFilter] = useState("全部");
  const [brands, setBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchBrands();
    fetchProducts();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/products?action=brands");
      const data = await res.json();
      if (data.brands) setBrands(data.brands);
    } catch (error) {
      console.error("获取品牌失败:", error);
    }
  };

  const fetchProducts = async (searchKeyword?: string, searchBrand?: string, min?: string, max?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("action", "list");
      if (searchKeyword) params.append("keyword", searchKeyword);
      if (searchBrand && searchBrand !== "全部") params.append("brand", searchBrand);
      if (min) params.append("minPrice", min);
      if (max) params.append("maxPrice", max);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error("获取产品失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const keywords = keyword.split("，").filter(k => k.trim());
    fetchProducts(keywords.join(","), brandFilter, minPrice, maxPrice);
  };

  const handleExport = async () => {
    const keywords = keyword.split("，").filter(k => k.trim());
    const params = new URLSearchParams();
    params.append("action", "export");
    if (keywords.join(",") && brandFilter !== "全部") {
      params.append("keyword", keywords.join(","));
      params.append("brand", brandFilter);
    }

    window.location.href = `/api/products?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">产品库查询</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">关键词搜索</label>
                <Input
                  placeholder="多个关键词用中文逗号分隔"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">品牌筛选</label>
                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部品牌</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">VIP价格区间</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="最低价"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="最高价"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleSearch} disabled={loading} className="flex-1">
                  {loading ? "搜索中..." : "搜索"}
                </Button>
                <Button onClick={handleExport} variant="outline">
                  导出
                </Button>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              共找到 <Badge variant="secondary">{totalCount}</Badge> 条产品记录
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">序号</TableHead>
                    <TableHead>产品名称</TableHead>
                    <TableHead>规格型号</TableHead>
                    <TableHead>品牌</TableHead>
                    <TableHead>单位</TableHead>
                    <TableHead className="text-right">市场价</TableHead>
                    <TableHead className="text-right">VIP价格</TableHead>
                    <TableHead>库存</TableHead>
                    <TableHead>备注</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        {loading ? "加载中..." : "暂无数据，请使用搜索功能"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product, index) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{product.产品名称}</TableCell>
                        <TableCell className="text-sm text-gray-600">{product.规格型号}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.品牌}</Badge>
                        </TableCell>
                        <TableCell>{product.单位}</TableCell>
                        <TableCell className="text-right line-through text-gray-400">
                          ¥{product.市场价}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          ¥{product.VIP价格}
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.库存 === "有货" ? "default" : "secondary"}>
                            {product.库存}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{product.备注}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
