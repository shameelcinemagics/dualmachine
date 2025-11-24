import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Gift } from 'lucide-react';
import qrCodeImage from '@/assets/qr-code.png';

export const QRCodePromo = () => {
  const { t } = useTranslation();

  return (
    <Card className="fixed top-4 left-4 z-10 p-3 bg-card/95 backdrop-blur-sm border-border/50 shadow-lg max-w-48">
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Smartphone className="w-4 h-4 text-primary" />
          <Badge variant="secondary" className="text-xs px-2 py-0">
            {t('qr_promo.mobile_app')}
          </Badge>
        </div>
        
        <img 
          src={qrCodeImage} 
          alt="QR Code for Mobile App" 
          className="w-20 h-20 rounded border border-border/30"
        />
        
        <div className="text-center space-y-1">
          <p className="text-xs font-medium text-foreground">
            {t('qr_promo.scan_download')}
          </p>
          <div className="flex items-center gap-1 justify-center">
            <Gift className="w-3 h-3 text-primary" />
            <p className="text-xs text-muted-foreground">
              {t('qr_promo.loyalty_points')}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};