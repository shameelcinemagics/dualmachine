
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailsModal } from "@/components/ProductDetailsModal";
import { ShoppingCart } from "@/components/ShoppingCart";
import { CheckoutModal } from "@/components/CheckoutModal";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DispenseAnimation } from "@/components/DispenseAnimation";
import { Screensaver } from "@/components/Screensaver";
import { SpinWheel } from "@/components/SpinWheel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Settings, Smartphone, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";
import qrCodeImage from "@/assets/qr-code.png";
import { SecretTapArea } from "@/components/SecretTapArea";


interface Product {
  slot: number;
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

interface CartItem extends Product {
  quantity: number;
}


const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const clearCart = useCallback(() => setCartItems([]), []);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isDispensing, setIsDispensing] = useState(false);
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  // const [paymentUrl, setpaymentUrl] = useState<string |null>(null);
  const [isSpinWheelOpen, setIsSpinWheelOpen] = useState(false);
  const { toast } = useToast();
  const [temperature, setTemperature] = useState("");
  const [currentTemp, setCurrentTemp] = useState<{ temp1: number; temp2: number } | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Inactivity timer - triggers screensaver after 30 seconds of inactivity
  useInactivityTimer({
    timeout: 30000, // 30 seconds
    onInactive: () => {
      if (!isDispensing && !isCheckoutOpen) {
        setIsScreensaverActive(true);
      }
    },
    onActive: () => {
      setIsScreensaverActive(false);
    }
  });

  // Standalone cart auto-clear timer - clears cart after 15 seconds of inactivity
  useEffect(() => {
    let timerRef: NodeJS.Timeout | null = null;

    const resetCartTimer = () => {
      if (timerRef) {
        clearTimeout(timerRef);
      }

      // Only start timer if cart has items and not in checkout/dispensing
      if (cartItems.length > 0 && !isCheckoutOpen && !isDispensing) {
        timerRef = setTimeout(() => {
          console.log("🗑️ Cart auto-cleared after 60 seconds of inactivity");
          setCartItems([]);
        }, 60000);
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, resetCartTimer, true);
    });

    // Start initial timer
    resetCartTimer();

    return () => {
      if (timerRef) {
        clearTimeout(timerRef);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetCartTimer, true);
      });
    };
  }, [cartItems.length, isCheckoutOpen, isDispensing]);

  const categories = [
    t("all_categories"),
    t("categories.snacks"),
    t("categories.beverages"),
    t("categories.candy"),
    "Water",
    "Energy",
    "Sports",
    t("categories.healthy"),
    "Nuts",
    "Cookies",
    "Spreads"
  ];

  useEffect(() => {
    const fetchTemperature = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/temperature");
        setCurrentTemp(res.data);
        console.log("🌡 Auto-read temperature:", res.data);
      } catch (err) {
        console.error("❌ Auto-read failed:", err);
      }
    };

    fetchTemperature(); // fetch once on load

    const interval = setInterval(fetchTemperature, 5 * 60 * 1000); // every 5 minutes

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  const filteredProducts = products.filter((product) => {
    // Normalize the category values to lowercase to avoid case sensitivity issues
    const normalizedSelectedCategory = selectedCategory.trim().toLowerCase();
    const normalizedProductCategory = product.category.trim().toLowerCase();

    // Handling the "All" or "all_categories" cases
    const isCategoryAll =
      normalizedSelectedCategory === "all" || normalizedSelectedCategory === t("all_categories").toLowerCase();

    // Match the product category with the selected category
    const matchesCategory = isCategoryAll || normalizedProductCategory === normalizedSelectedCategory;

    return matchesCategory;
  });


  const handleAddToCart = (product: Product) => {
    let didAdd = false;
    let stockExceeded = false;

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      const currentQuantity = existingItem?.quantity ?? 0;
      const nextQuantity = currentQuantity + 1;

      if (
        typeof product.stockQuantity === "number" &&
        nextQuantity > product.stockQuantity
      ) {
        stockExceeded = true;
        return prev;
      }

      didAdd = true;

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: nextQuantity } : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });

    if (stockExceeded) {
      toast({
        variant: "destructive",
        title: "Insufficient stock",
        description: `Only ${product.stockQuantity} item(s) available.`,
      });
      return false;
    }

    if (didAdd) {
      setIsCartOpen(true);
    }

    return didAdd;
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = useCallback((productId: string) => {
    console.log('🔴 handleRemoveItem called for product:', productId);
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const handleCheckout = (trackId: string) => {
    console.log('🛒 Checkout initiated with trackId:', trackId);
    setCurrentTrackId(trackId);
    setIsCheckoutOpen(true);
  };

  const handlePaymentProcessing = (isProcessing: boolean) => {
    setIsPaymentProcessing(isProcessing);
  };

  const handlePaymentComplete = (products?: CartItem[]) => {
    console.log("Payment completed, starting dispense animation");
    if (products && products.length > 0) {
      console.log("Using returned products for dispense:", products);
      setCartItems(products);
    }
    setIsCheckoutOpen(false);
    setIsPaymentProcessing(false);
    setCurrentTrackId(null);
    setIsDispensing(true);
  };

  const handlePaymentFailed = useCallback(() => {
    console.log("Payment failed/declined, closing checkout modal");
    setIsCheckoutOpen(false);
    setIsPaymentProcessing(false);
    setCurrentTrackId(null);
  }, []);

  const handleDispenseComplete = () => {
    console.log("Dispense animation completed, clearing cart");
    setIsDispensing(false);
    clearCart();
  };

  useEffect(() => {

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/slots/api/products");
        const data = await response.json();
        console.log(data)
        const transformed = (Array.isArray(data) ? data : []).map((item: any) => {
          const price =
            item.price === null || item.price === undefined
              ? null
              : Number(item.price);

          return {
            // keep what you already have
            id: String(item.id ?? crypto.randomUUID()),
            name: item.name ?? null,
            price, // can be number or null
            image: item.image ?? "",
            category: item.category ?? "Uncategorized",
            calories: item.calories ?? undefined,
            fat: item.fat ?? undefined,
            carbs: item.carbs ?? undefined,
            protein: item.protein ?? undefined,
            sodium: item.sodium ?? undefined,
            ingredients: item.ingredients ?? "",
            healthRating: (item.healthRating as 1 | 2 | 3) ?? 2,
            stockQuantity:
              item.stockQuantity === null || item.stockQuantity === undefined
                ? 0
                : Number(item.stockQuantity),
            slot: item.slots?.[0]?.slotNumber ?? item.slot ?? 0,
            // helper
            isEmpty:
              !item?.name ||
              item?.price === null ||
              item?.price === undefined ||
              Number.isNaN(price),
          } as Product & { isEmpty: boolean };
        });

        // EITHER: only show “sellable” products in the grid
        const sellable = transformed.filter(p => !p.isEmpty && (p.stockQuantity ?? 0) > 0);

        setProducts(sellable as unknown as Product[]);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    const socket = new WebSocket("ws://localhost:8082");

    // ✅ Safe registration on connection open
    socket.onopen = () => {
      console.log("✅ WebSocket connected to backend");
    };

    // ✅ Handle incoming messages
    socket.onmessage = async (event) => {
      try {
        if (!event.data) return;

        // 1) Normalize event.data to text
        const text =
          typeof event.data === "string"
            ? event.data
            : event.data instanceof Blob
              ? await event.data.text()
              : new TextDecoder().decode(event.data as ArrayBuffer);

        // 2) Parse to object
        const msg = JSON.parse(text);
        console.log("WS message:", msg);

        // (optional) ignore other machines
        // if (msg.machineId && msg.machineId !== "kwt1") return;

        if (msg.type === "dispense") {
          // 3) Normalize products (string or array)
          const raw = Array.isArray(msg.products) ? msg.products : JSON.parse(msg.products);

          // 4) Map to your CartItem shape (id required by React lists)
          const incoming = raw.map((p: any, i: number) => ({
            slot: Number(p.slot) ?? 0,
            id: `disp-${Date.now()}-${i}`,
            name: String(p.name ?? "Item"),
            price: Number(p.price ?? 0),
            image: p.image ?? "",
            category: p.category ?? "Uncategorized",
            quantity: Number(p.quantity ?? 1),
          }));

          console.log("✅ Dispense message received:", incoming);

          // Close payment, set items, start animation
          setIsCheckoutOpen(false);
          // setpaymentUrl(null);
          setCartItems(incoming);
          setTimeout(() => setIsDispensing(true), 50);
        }
      } catch (err) {
        console.error("❌ Error handling WebSocket message:", err, event.data);
      }
    };


    socket.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="h-screen bg-background overflow-hidden overflow-x-hidden" style={{ height: '1920px', width: '1080px', maxWidth: '1080px' }}>
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left side - QR Code */}

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-foreground">VEND IT</h1>
              <p className="text-sm text-muted-foreground">Vend what's good for you!</p>
            </div>

            {/*temperature*/}
            <span className="relative p-2">
              <SecretTapArea className="absolute inset-0" />
              {currentTemp && (
                <div className="p-4 bg-muted/20 rounded text-sm">
                  <p><strong>{currentTemp.temperature1}°C</strong></p>
                </div>
              )}
            </span>
            {/* Right side - Controls */}
            <div className="flex gap-2">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-1 flex-wrap justify-center mt-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full text-xs px-3 py-1 h-7"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content with Scroll */}
      <main className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden relative" style={{ height: 'calc(1920px - 180px)', width: '100%' }}>
        <div className="grid grid-cols-5 gap-2 pb-4 w-full">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onViewDetails={setSelectedProduct}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              No products found matching your criteria.
            </p>
          </div>
        )}

        {/* Scroll Indicator */}
        <div className="absolute right-2 top-4 bottom-4 w-1 bg-muted rounded-full">
          <div
            className="w-full bg-primary rounded-full transition-all duration-300"
            style={{
              height: `${Math.min(100, (filteredProducts.length / 50) * 100)}%`
            }}
          />
        </div>
      </main>

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Shopping Cart */}
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onStartCheckout={handleCheckout}
        onPaymentComplete={handlePaymentComplete}
        onPaymentProcessing={handlePaymentProcessing}
        onPaymentFailed={handlePaymentFailed}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setIsPaymentProcessing(false);
          setCurrentTrackId(null);
        }}
        items={cartItems}
        trackId={currentTrackId || undefined}
        isProcessing={isPaymentProcessing}
        onPaymentComplete={handlePaymentComplete}
        onClearCart={clearCart}
      />

      <DispenseAnimation
        isVisible={isDispensing}
        items={cartItems}
        onComplete={handleDispenseComplete}
      />

      {/* Screensaver */}
      <Screensaver
        isActive={isScreensaverActive}
        onExit={(showSpinWheel) => {
          setIsScreensaverActive(false);
          if (showSpinWheel) {
            setIsSpinWheelOpen(true);
          }
        }}
      />

      {/* Spin Wheel */}
      <SpinWheel
        isOpen={isSpinWheelOpen}
        onClose={() => setIsSpinWheelOpen(false)}
      />
    </div>
  );
};

export default Index;