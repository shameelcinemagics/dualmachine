import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QrCode, CheckCircle } from "lucide-react";
import paymentQR from "@/assets/payment-qr.png";
import QRCode from "react-qr-code";
import axios from "axios";

interface CartItem {
  id: string;
  slot: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onPaymentComplete: () => void;
  onClearCart: () => void;
}

export const CheckoutModal = ({
  isOpen,
  onClose,
  items,
  onPaymentComplete,
  onClearCart,
}: CheckoutModalProps) => {
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (isOpen || items.length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      onClearCart();
    }, 15000);

    return () => clearTimeout(timeoutId);
  }, [isOpen, items.length, onClearCart]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md bg-card border-border/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            PAY USING KNET
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Order Summary</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>{(item.price * item.quantity).toFixed(3)} KWD</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{totalPrice.toFixed(3)} KWD</span>
            </div>
          </div>

          {/* Payment Section */}
          <div className="text-center space-y-4">
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground text-red-500"><span>To cancel payment, click on back arrow on knet app</span></div>
      </DialogContent>
    </Dialog>
  );
};
