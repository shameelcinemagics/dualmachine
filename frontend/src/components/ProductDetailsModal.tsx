import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";

interface Product {
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
  stockQuantity?: number;
}

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => boolean;
}

export const ProductDetailsModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailsModalProps) => {
  if (!product) return null;

  const renderHealthStars = (rating: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "fill-foreground text-foreground" : "fill-muted text-muted-foreground"
        }`}
      />
    ));
  };

  const getHealthRatingInfo = (rating: number) => {
    switch (rating) {
      case 1:
        return {
          title: "Lower Nutritional Value",
          description: "Enjoy occasionally as part of a balanced diet. Higher in calories, sugar, or sodium."
        };
      case 2:
        return {
          title: "Moderate Nutritional Value", 
          description: "Good choice for occasional snacking. Balanced nutritional profile with some beneficial nutrients."
        };
      case 3:
        return {
          title: "Higher Nutritional Value",
          description: "Excellent choice! Rich in nutrients, vitamins, or minerals with minimal processing."
        };
      default:
        return { title: "", description: "" };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 to-muted/50">
              <img
                src={`${product.image}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex items-center justify-center">
              <Badge variant="secondary">{product.category}</Badge>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Health Rating</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex gap-1">
                    {renderHealthStars(product.healthRating)}
                  </div>
                  <span className="font-semibold text-foreground">
                    {getHealthRatingInfo(product.healthRating).title}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {getHealthRatingInfo(product.healthRating).description}
                </p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Health Rating Guide:</span> ⭐ Lower • ⭐⭐ Moderate • ⭐⭐⭐ Higher nutritional value
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Nutrition Facts</h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Calories</span>
                  <span className="font-medium">{product.calories}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Total Fat</span>
                  <span className="font-medium">{product.fat}</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbohydrates</span>
                  <span className="font-medium">{product.carbs}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protein</span>
                  <span className="font-medium">{product.protein}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sodium</span>
                  <span className="font-medium">{product.sodium}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Ingredients</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {product.ingredients}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="text-3xl font-bold text-primary">
                {product.price.toFixed(3)} KWD
              </div>
              <Button
                onClick={() => {
                  const added = onAddToCart(product);
                  if (added) {
                    onClose();
                  }
                }}
                className="w-full"
                variant="kiosk"
                size="kiosk"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
