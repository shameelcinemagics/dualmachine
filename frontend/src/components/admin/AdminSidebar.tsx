import { NavLink } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  ShoppingCart, 
  Warehouse, 
  Users, 
  BarChart3,
  Calendar
} from 'lucide-react';

const navigationItems = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/admin/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  { to: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/admin/receiving', label: 'Receiving', icon: Calendar },
];

export const AdminSidebar = () => {
  return (
    <div className="w-64 bg-card border-r border-border/50 h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground">VendIT Admin</h2>
        <p className="text-sm text-muted-foreground">Warehouse Management</p>
      </div>
      
      <nav className="px-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};