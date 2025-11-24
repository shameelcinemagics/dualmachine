import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Package, Truck, ShoppingCart, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalSuppliers: number;
  pendingPOs: number;
  lowStock: number;
  expiringItems: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSuppliers: 0,
    pendingPOs: 0,
    lowStock: 0,
    expiringItems: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Get total products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get total suppliers
      const { count: suppliersCount } = await supabase
        .from('suppliers')
        .select('*', { count: 'exact', head: true });

      // Get pending purchase orders
      const { count: pendingPOsCount } = await supabase
        .from('purchase_orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'sent']);

      // Get low stock items (less than 10 units)
      const { data: inventoryData } = await supabase
        .from('inventory')
        .select('product_id, quantity')
        .eq('status', 'in_stock');

      const productStock = inventoryData?.reduce((acc, item) => {
        acc[item.product_id] = (acc[item.product_id] || 0) + item.quantity;
        return acc;
      }, {} as Record<string, number>) || {};

      const lowStockCount = Object.values(productStock).filter(stock => stock < 10).length;

      // Get expiring items (within 7 days)
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      const { count: expiringCount } = await supabase
        .from('inventory')
        .select('*', { count: 'exact', head: true })
        .lte('expiry_date', sevenDaysFromNow.toISOString().split('T')[0])
        .eq('status', 'in_stock');

      setStats({
        totalProducts: productsCount || 0,
        totalSuppliers: suppliersCount || 0,
        pendingPOs: pendingPOsCount || 0,
        lowStock: lowStockCount,
        expiringItems: expiringCount || 0
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Total Suppliers',
      value: stats.totalSuppliers,
      icon: Truck,
      color: 'text-green-600'
    },
    {
      title: 'Pending POs',
      value: stats.pendingPOs,
      icon: ShoppingCart,
      color: 'text-yellow-600'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStock,
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringItems,
      icon: AlertTriangle,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your warehouse operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">System initialized successfully</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">Database schema created</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-muted-foreground">Ready to start managing inventory</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">• Add suppliers to start ordering</p>
            <p className="text-sm text-muted-foreground">• Create products with SKU and barcodes</p>
            <p className="text-sm text-muted-foreground">• Generate purchase orders</p>
            <p className="text-sm text-muted-foreground">• Receive and track inventory</p>
          </div>
        </Card>
      </div>
    </div>
  );
};