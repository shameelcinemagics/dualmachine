import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface Product {
  slot: number | null
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  calories?: number;
  fat?: string;
  carbs?: string;
  protein?: string;
  sodium?: string;
  ingredients: string;
  healthRating: 1 | 2 | 3;
  outOfStock?: boolean;
  labels?: string[];
  stockQuantity?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => boolean;
  onViewDetails: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart, onViewDetails }: ProductCardProps) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const renderHealthStars = (rating: number, size: "sm" | "lg" = "sm") => {
    const starSize = size === "lg" ? "w-5 h-5" : "w-3 h-3";
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        className={`${starSize} ${
          i < rating ? "fill-foreground text-foreground" : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <Card
      className={`group relative overflow-hidden bg-card border-border/50 shadow-soft transition-all duration-300 cursor-pointer h-56 ${
        product.outOfStock 
          ? "opacity-60 grayscale" 
          : "hover:shadow-strong"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails(product)}
    >
      {/* Image section - takes up 2/3 of the card */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-muted/30 to-muted/50">
        <img
        src={`${product.image}`} // ✅ Add full path
        alt={product.name}
        className={`w-full h-full object-contain transition-transform duration-300 ${
          !product.outOfStock ? "group-hover:scale-110" : ""
        }`}
        />
        <div className="absolute top-1 right-1">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-xs px-1 py-0">
            {product.category}
          </Badge>
        </div>
        {/* Stock quantity label - priority over other labels */}
        {product.stockQuantity !== undefined && product.stockQuantity <= 2 && product.stockQuantity > 0 ? (
          <div className="absolute top-1 left-1">
            <Badge 
              variant="destructive" 
              className="text-xs px-2 py-0.5 backdrop-blur-sm bg-red-500/90 text-white border-red-500"
            >
              {product.stockQuantity === 1 ? "Last one" : `${product.stockQuantity} remaining`}
            </Badge>
          </div>
        ) : (
          product.labels && product.labels.length > 0 && (
            <div className="absolute top-1 left-1">
              <Badge 
                variant={product.labels[0] === "Best Seller" ? "default" : product.labels[0] === "Selling Fast" ? "secondary" : "outline"} 
                className={`text-xs px-1 py-0 backdrop-blur-sm ${
                  product.labels[0] === "Selling Fast" ? "bg-orange-500 text-white border-orange-500" : "bg-card/90"
                }`}
              >
                {t(`labels.${product.labels[0].toLowerCase().replace(" ", "_")}`)}
              </Badge>
            </div>
          )
        )}
        {product.outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Badge variant="destructive" className="text-xs font-semibold">
              {t("labels.out_of_stock")}
            </Badge>
          </div>
        )}
      </div>
      
      {/* Content section - takes up remaining space */}
      <div className="p-2 flex flex-col justify-between h-24">
        <div className="flex justify-center">
          <div className="flex gap-0.5">
            {renderHealthStars(product.healthRating, "sm")}
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="font-semibold text-xs text-foreground line-clamp-1">{product.name}</h3>
          <p className="text-xs text-muted-foreground">{product.price.toFixed(3)} KWD</p>
        </div>
        
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="w-full text-xs py-1 h-7"
          variant="kiosk"
          size="sm"
          disabled={product.outOfStock}
        >
          {product.outOfStock ? t("labels.out_of_stock") : t("buttons.add_to_cart")}
        </Button>
      </div>
    </Card>
  );
};
