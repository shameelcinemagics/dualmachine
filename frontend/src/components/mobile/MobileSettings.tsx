import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Wallet, 
  Gift, 
  FileText, 
  Shield, 
  Trash2, 
  LogOut,
  ChevronRight 
} from 'lucide-react';
import { usePhoneAuth } from '@/hooks/usePhoneAuth';
import { supabase } from '@/integrations/supabase/client';

interface MobileSettingsProps {
  onLogout: () => void;
}

export const MobileSettings = ({ onLogout }: MobileSettingsProps) => {
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const { customerPhone, signOut } = usePhoneAuth();

  useEffect(() => {
    if (customerPhone) {
      loadLoyaltyPoints();
    }
  }, [customerPhone]);

  const loadLoyaltyPoints = async () => {
    if (!customerPhone) return;

    const { data } = await supabase
      .from('customer_loyalty_points')
      .select('current_balance')
      .eq('customer_phone', customerPhone)
      .single();

    if (data) {
      setLoyaltyPoints(data.current_balance);
    }
  };

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  const handleInviteFriend = () => {
    const message = "Join VendIT and get convenient access to snacks and drinks! Download the app and use my referral code for a free drink.";
    const shareData = {
      title: 'VendIT - Smart Vending',
      text: message,
      url: window.location.origin
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(`${message} ${window.location.origin}`);
    }
  };

  const settingsMenuItems = [
    {
      icon: User,
      title: 'Account Information',
      subtitle: customerPhone || 'Not available',
      action: () => console.log('Account info')
    },
    {
      icon: Wallet,
      title: 'Wallet & Payment',
      subtitle: 'Manage payment methods',
      action: () => console.log('Wallet')
    },
    {
      icon: Gift,
      title: 'Invite Friends',
      subtitle: 'Share and earn free drinks',
      action: handleInviteFriend
    }
  ];

  const legalMenuItems = [
    {
      icon: FileText,
      title: 'Terms & Conditions',
      action: () => console.log('Terms')
    },
    {
      icon: Shield,
      title: 'Privacy Policy',
      action: () => console.log('Privacy')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Loyalty Points */}
          <Card className="p-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Loyalty Points</h3>
              <div className="text-3xl font-bold text-primary mb-2">{loyaltyPoints}</div>
              <p className="text-sm text-muted-foreground mb-4">
                Points available for redemption
              </p>
              <Badge variant="secondary" className="mb-2">
                1 KWD spent = 1 point earned
              </Badge>
            </div>
          </Card>

          {/* Account Settings */}
          <Card className="overflow-hidden">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Account</h3>
            </div>
            <div className="space-y-0">
              {settingsMenuItems.map((item, index) => (
                <div key={index}>
                  <button
                    onClick={item.action}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <div className="text-left">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {index < settingsMenuItems.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </Card>

          {/* Legal */}
          <Card className="overflow-hidden">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Legal</h3>
            </div>
            <div className="space-y-0">
              {legalMenuItems.map((item, index) => (
                <div key={index}>
                  <button
                    onClick={item.action}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <p className="font-medium">{item.title}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {index < legalMenuItems.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 text-red-600">Danger Zone</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => console.log('Delete account')}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};