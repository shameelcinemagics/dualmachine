import { Home, Package, QrCode, ShoppingBag, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavigationProps {
  currentScreen: string;
  onNavigate: (screen: 'home' | 'orders' | 'qr' | 'store' | 'settings') => void;
}

export const MobileNavigation = ({ currentScreen, onNavigate }: MobileNavigationProps) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'qr', label: 'QR Code', icon: QrCode },
    { id: 'store', label: 'Store', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-background border-t border-border px-2 py-2 flex justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;
        
        return (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(item.id as any)}
            className={`flex flex-col items-center p-2 h-auto ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Button>
        );
      })}
    </div>
  );
};