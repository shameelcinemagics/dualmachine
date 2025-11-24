import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  unit_price: number;
  category: string;
  image_url?: string;
  current_stock: number;
  is_available: boolean;
}

interface MachineDetailsProps {
  machineId: string;
  onBack: () => void;
}

export const MachineDetails = ({ machineId, onBack }: MachineDetailsProps) => {
  const [machine, setMachine] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{[productId: string]: number}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMachineData();
  }, [machineId]);

  const loadMachineData = async () => {
    // Load machine details
    const { data: machineData } = await supabase
      .from('vending_machines')
      .select('*')
      .eq('id', machineId)
      .single();

    if (machineData) {
      setMachine(machineData);
    }

    // Load available products in this machine
    const { data: inventoryData } = await supabase
      .from('machine_inventory')
      .select(`
        *,
        products (
          id,
          name,
          unit_price,
          category,
          image_url
        )
      `)
      .eq('machine_id', machineId)
      .eq('is_available', true)
      .gt('current_stock', 0);

    if (inventoryData) {
      const formattedProducts = inventoryData.map(item => ({
        id: item.products.id,
        name: item.products.name,
        unit_price: Number(item.products.unit_price),
        category: item.products.category,
        image_url: item.products.image_url,
        current_stock: item.current_stock,
        is_available: item.is_available
      }));
      setProducts(formattedProducts);
    }

    setLoading(false);
  };

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentQty = cart[productId] || 0;
    if (currentQty < product.current_stock) {
      setCart(prev => ({
        ...prev,
        [productId]: currentQty + 1
      }));
    }
  };

  const removeFromCart = (productId: string) => {
    const currentQty = cart[productId] || 0;
    if (currentQty > 0) {
      setCart(prev => ({
        ...prev,
        [productId]: currentQty - 1
      }));
    }
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [productId, qty]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.unit_price * qty : 0);
    }, 0);
  };

  const handleCheckout = () => {
    if (getTotalItems() > 0) {
      // Navigate to checkout process
      console.log('Proceeding to checkout with cart:', cart);
      // In a real app, this would open a checkout modal or navigate to checkout screen
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-background border-b border-border p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-3">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-semibold">{machine?.name}</h1>
          <p className="text-sm text-muted-foreground">{machine?.location_name}</p>
        </div>
      </div>

      {/* Products */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4">
              <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-muted-foreground text-xs">No Image</span>
                )}
              </div>
              
              <h3 className="font-medium text-sm mb-1">{product.name}</h3>
              <p className="text-primary font-semibold mb-2">
                KWD {product.unit_price.toFixed(2)}
              </p>
              
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                  {product.current_stock} left
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFromCart(product.id)}
                    disabled={!cart[product.id]}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  
                  <span className="w-8 text-center text-sm">
                    {cart[product.id] || 0}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => addToCart(product.id)}
                    disabled={cart[product.id] >= product.current_stock}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available in this machine.</p>
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {getTotalItems() > 0 && (
        <div className="bg-background border-t border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold">
                {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
              </p>
              <p className="text-sm text-muted-foreground">
                Total: KWD {getTotalPrice().toFixed(2)}
              </p>
            </div>
            <Button onClick={handleCheckout} className="flex items-center">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};