import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePhoneAuth } from '@/hooks/usePhoneAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Order {
  id: string;
  total_amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  loyalty_points_earned: number;
  created_at: string;
  vending_machines: {
    name: string;
    location_name: string;
  };
  customer_order_items: Array<{
    quantity: number;
    unit_price: number;
    products: {
      name: string;
    };
  }>;
}

export const MobileOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { customerPhone } = usePhoneAuth();

  useEffect(() => {
    if (customerPhone) {
      loadOrders();
    }
  }, [customerPhone]);

  const loadOrders = async () => {
    if (!customerPhone) return;

    const { data, error } = await supabase
      .from('customer_orders')
      .select(`
        *,
        vending_machines (name, location_name),
        customer_order_items (
          quantity,
          unit_price,
          products (name)
        )
      `)
      .eq('customer_phone', customerPhone)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setOrders(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="min-h-screen bg-background">
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Order History</h1>
          <p className="text-muted-foreground">View your previous purchases</p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{order.vending_machines.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.vending_machines.location_name}
                  </p>
                </div>
                <Badge className={getStatusColor(order.order_status)}>
                  {order.order_status}
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                {order.customer_order_items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.products.name}</span>
                    <span>{order.currency} {(item.quantity * Number(item.unit_price)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">
                    {order.currency} {Number(order.total_amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Points Earned</span>
                  <span>+{order.loyalty_points_earned} points</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Date</span>
                  <span>{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No orders found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start shopping to see your order history here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};