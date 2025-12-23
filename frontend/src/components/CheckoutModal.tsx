import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QrCode, CheckCircle, XCircle, Loader2 } from "lucide-react";
import paymentQR from "@/assets/payment-qr.png";
import QRCode from "react-qr-code";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

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
  onPaymentComplete: (products?: CartItem[]) => void;
  onClearCart: () => void;
  trackId?: string;
  isProcessing?: boolean;
}

type PaymentStatus = 'idle' | 'processing' | 'cancelling' | 'cancelled' | 'success';

export const CheckoutModal = ({
  isOpen,
  onClose,
  items,
  onPaymentComplete,
  onClearCart,
  trackId,
  isProcessing = false,
}: CheckoutModalProps) => {
  const [status, setStatus] = useState<PaymentStatus>('idle');

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Sync internal status with props, but don't override if we are in a local terminal state
  useEffect(() => {
    if (isOpen) {
      if (isProcessing && status !== 'cancelling' && status !== 'cancelled' && status !== 'success') {
        setStatus('processing');
      } else if (!isProcessing && status === 'processing') {
        // If processing stops externally and we haven't set another state, go back to idle
        // This might happen if payment fails without a specific event?
        // But usually we want to control this.
        setStatus('idle');
      }
    } else {
      // Reset on close
      setStatus('idle');
    }
  }, [isOpen, isProcessing]);


  useEffect(() => {
    if (isOpen || items.length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      onClearCart();
    }, 60000);

    return () => clearTimeout(timeoutId);
  }, [isOpen, items.length, onClearCart]);

  const handleCancelPayment = async () => {
    if (!trackId) {
      toast({
        title: "Error",
        description: "No transaction to cancel",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setStatus('cancelling');

    try {
      const response = await axios.post('http://localhost:5000/api/payment/cancel', {
        trackId: trackId
      });

      if (response.data.success) {
        setStatus('cancelled');
        toast({
          title: "Payment Cancelled",
          description: "Your payment has been cancelled successfully",
          duration: 3000,
        });

        // Close modal and clear cart after a short delay
        setTimeout(() => {
          onClose();
          onClearCart();
        }, 1500);
      }
    } catch (error) {
      console.error('Cancel payment error:', error);
      setStatus('processing'); // Go back to processing if cancel failed? Or stay in limbo?
      toast({
        title: "Cancel Failed",
        description: "Unable to cancel payment. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'processing': return "Processing Payment...";
      case 'cancelling': return "Cancelling...";
      case 'cancelled': return "Payment Cancelled";
      case 'success': return "Payment Successful";
      default: return "PAY USING KNET";
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Prevent closing while processing or cancelling, unless explicitly allowed
        if (!open && (status === 'processing' || status === 'cancelling')) {
          return;
        }
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-md bg-card border-border/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {getTitle()}
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

          {/* Payment Status Section */}
          <div className="text-center space-y-4">
            {status === 'processing' && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Please complete payment on the POS terminal
                </p>
                {trackId && (
                  <p className="text-xs text-muted-foreground font-mono">
                    Track ID: {trackId}
                  </p>
                )}
              </div>
            )}

            {status === 'cancelled' && (
              <div className="flex flex-col items-center gap-3 py-4">
                <XCircle className="w-12 h-12 text-destructive" />
                <p className="text-sm text-foreground font-medium">
                  Transaction Cancelled
                </p>
              </div>
            )}
          </div>

          {/* Cancel Button */}
          {status === 'processing' && (
            <div className="space-y-2">
              <Button
                onClick={handleCancelPayment}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Payment
                </>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You can also cancel by pressing the back button on the KNET terminal
              </p>
            </div>
          )}

          {status === 'cancelling' && (
            <div className="space-y-2">
              <Button disabled variant="destructive" className="w-full" size="lg">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};