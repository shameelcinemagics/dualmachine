import { Routes, Route } from 'react-router-dom';
import { AdminDashboard } from './AdminDashboard';
import { ProductsManagement } from './ProductsManagement';
import { SuppliersManagement } from './SuppliersManagement';
import { PurchaseOrdersManagement } from './PurchaseOrdersManagement';
import { InventoryManagement } from './InventoryManagement';
import { ReceivingManagement } from './ReceivingManagement';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/products" element={<ProductsManagement />} />
      <Route path="/suppliers" element={<SuppliersManagement />} />
      <Route path="/purchase-orders" element={<PurchaseOrdersManagement />} />
      <Route path="/inventory" element={<InventoryManagement />} />
      <Route path="/receiving" element={<ReceivingManagement />} />
    </Routes>
  );
};