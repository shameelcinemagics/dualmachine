import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const MobileSplash = () => {
  const [promotion, setPromotion] = useState<any>(null);

  useEffect(() => {
    loadActivePromotion();
  }, []);

  const loadActivePromotion = async () => {
    const { data } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (data) setPromotion(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-foreground flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-white mb-2">VendIT</h1>
        <p className="text-white/80 text-lg">Smart Vending Solutions</p>
      </div>
      
      {promotion && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-sm w-full text-center">
          <h2 className="text-xl font-semibold text-white mb-2">{promotion.title}</h2>
          <p className="text-white/80">{promotion.description}</p>
        </div>
      )}
      
      <div className="mt-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    </div>
  );
};