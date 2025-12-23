import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart as CartIcon, Plus, Minus, Trash2 } from "lucide-react";
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";

interface Product {
  slot: number;
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stockQuantity?: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onStartCheckout: (trackId: string) => void;
  onPaymentComplete: (products: CartItem[]) => void;
  onPaymentProcessing: (isProcessing: boolean) => void;
  onPaymentFailed: () => void;
}


export const ShoppingCart = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onStartCheckout,
  onPaymentComplete,
  onPaymentProcessing,
  onPaymentFailed,
}: ShoppingCartProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCheckoutInProgress, setIsCheckoutInProgress] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (items.length > 0) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
      setIsCheckoutInProgress(false);
    }
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setIsCheckoutInProgress(true);
    const trackId = 'TRK-' + Date.now();
    onStartCheckout(trackId);
    onPaymentProcessing(true);

    try {
      const payload = {
        amount: totalPrice,
        slot: 1, // or dynamically pass the selected slot
        trackId: trackId, // ✅ Pass trackId to backend
        products: items.map(({ slot, name, price, quantity, image }) => ({
          slot,
          name,
          price,
          quantity,
          image,
        })),
      };

      console.log('🛒 Initiating payment:', { trackId, amount: totalPrice });

      const result = await axios.post('http://localhost:5000/api/payment', payload);
      console.log('💳 Payment response:', result.data);

      const data = result.data;

      if (data.message === "Payment successful") {
        console.log("✅ Payment Success");
        toast({
          title: "Payment Successful",
          description: "Dispensing your items...",
          variant: "default", // or "success" if configured
          duration: 3000,
        });
        onPaymentComplete(data.products);
      } else if (data.cancelled) {
        console.log("🚫 Payment Cancelled");
        toast({
          title: "Payment Cancelled",
          description: "Transaction was cancelled.",
        });
        onPaymentFailed();
      } else if (data.declined) {
        console.log("❌ Payment Declined:", data.message);
        toast({
          title: "Payment Declined",
          description: data.message || "Your card was declined.",
          variant: "destructive",
        });
        onPaymentFailed();
      }
    } catch (err: any) {
      console.error("❌ Payment error:", err);

      let errorMessage = "An unexpected error occurred.";
      if (err.response?.data?.declined) {
        errorMessage = err.response.data.message || "Payment Declined";
        toast({
          title: "Payment Declined",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (err.response?.data?.cancelled) {
        toast({
          title: "Payment Cancelled",
          description: "Transaction was cancelled.",
        });
      } else {
        errorMessage = err.response?.data?.message || err.message;
        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
      onPaymentFailed();
    } finally {
      setIsCheckoutInProgress(false);
      onPaymentProcessing(false);
    }
  };


  if (items.length === 0) {
    return (
      <Card className="fixed bottom-6 right-6 p-4 bg-card border-border/50 shadow-strong">
        <div className="flex items-center gap-3">
          <CartIcon className="w-6 h-6 text-muted-foreground" />
          <span className="text-muted-foreground">Cart is empty</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 bg-card border-border/50 shadow-strong max-w-sm w-80">
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <CartIcon className="w-6 h-6 text-primary" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                {totalItems}
              </Badge>
            </div>
            <span className="font-medium">Cart ({totalItems} items)</span>
          </div>
          {isExpanded && (
            <div className="text-xl font-bold text-primary">
              {totalPrice.toFixed(3)} KWD
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border/50">
          <div className="max-h-60 overflow-y-auto p-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.name}</h4>
                  <p className="text-primary font-medium">{item.price.toFixed(3)} KWD</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      if (item.quantity < item.stockQuantity) {
                        onUpdateQuantity(item.id, item.quantity + 1);
                      }
                    }}
                    disabled={item.quantity >= item.stockQuantity}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">
                {totalPrice.toFixed(3)} KWD
              </span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full"
              variant="kiosk"
              size="kiosk"
            >
              Checkout
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};