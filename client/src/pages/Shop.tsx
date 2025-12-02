import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";
import type { ShopProduct } from "@shared/schema";

export function Shop() {
  const [activeTab, setActiveTab] = useState<"Turfs" | "Spawners" | "Cosmetics">("Turfs");

  const { data: allProducts = [] } = useQuery<ShopProduct[]>({
    queryKey: ["/api/shop-products"],
    queryFn: async () => {
      const res = await fetch("/api/shop-products");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const products = allProducts.filter((p) => p.category === activeTab);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <ShoppingBag className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gaming-red">Shop</span>
          </h1>
          <p className="text-muted-foreground text-lg">Browse our exclusive products</p>
        </div>

        <div className="flex gap-3 mb-8 justify-center">
          {(["Turfs", "Spawners", "Cosmetics"] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? "default" : "secondary"}
              data-testid={`button-shop-tab-${tab.toLowerCase()}`}
            >
              {tab}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <div className="md:col-span-3">
              <Card className="p-12 bg-gradient-to-br from-card via-card to-background border-card-border text-center">
                <p className="text-muted-foreground">No products available in this category</p>
              </Card>
            </div>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="p-6 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d hover-elevate transition-all">
                <h3 className="text-lg font-bold mb-2 text-foreground">{product.name}</h3>
                <Badge className="bg-primary/20 text-primary mb-4">{product.price}</Badge>
                <p className="text-sm text-muted-foreground mb-4">{product.category}</p>
                <Button
                  onClick={() => window.open(product.link, "_blank")}
                  className="w-full"
                  data-testid={`button-buy-${product.id}`}
                >
                  Buy Now
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
