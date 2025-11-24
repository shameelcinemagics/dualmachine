import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, ShoppingBag } from 'lucide-react';

export const MobileStore = () => {
  const handleOpenShopify = () => {
    // Replace with your actual Shopify store URL
    window.open('https://your-store.myshopify.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Online Store</h1>
          <p className="text-muted-foreground">Shop our full catalog online</p>
        </div>

        <div className="space-y-6">
          {/* Store Access */}
          <Card className="p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-primary" />
              </div>
              
              <h3 className="font-semibold text-lg mb-2">VendIT Online Store</h3>
              <p className="text-muted-foreground mb-6">
                Browse our complete product catalog and have items delivered to your door
              </p>
              
              <Button onClick={handleOpenShopify} className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Online Store
              </Button>
            </div>
          </Card>

          {/* Store Features */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">What's available online</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Bulk Orders</p>
                  <p className="text-sm text-muted-foreground">Order in larger quantities with discounts</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Home Delivery</p>
                  <p className="text-sm text-muted-foreground">Get products delivered to your location</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Exclusive Products</p>
                  <p className="text-sm text-muted-foreground">Access to items not available in vending machines</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Subscription Boxes</p>
                  <p className="text-sm text-muted-foreground">Monthly curated snack boxes</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Loyalty Points */}
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Earn More Points Online</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Earn double loyalty points on all online orders. Points can be redeemed both online and at vending machines.
            </p>
            <div className="bg-primary/5 rounded-lg p-3">
              <p className="text-sm font-medium text-primary">
                Online orders: 2 points per KWD spent
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};