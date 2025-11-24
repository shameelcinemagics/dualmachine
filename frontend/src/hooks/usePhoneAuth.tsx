import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PhoneAuthContextType {
  isAuthenticated: boolean;
  customerPhone: string | null;
  loading: boolean;
  sendOTP: (phone: string) => Promise<{ error: any }>;
  verifyOTP: (phone: string, otp: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const PhoneAuthContext = createContext<PhoneAuthContextType | undefined>(undefined);

export const PhoneAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const phone = localStorage.getItem('customer_phone');
    const authToken = localStorage.getItem('customer_auth_token');
    
    if (phone && authToken) {
      setCustomerPhone(phone);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const sendOTP = async (phone: string) => {
    try {
      // In a real app, you'd integrate with a service like Twilio
      // For now, we'll simulate OTP sending
      console.log(`Sending OTP to ${phone}`);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const verifyOTP = async (phone: string, otp: string) => {
    try {
      // In a real app, you'd verify the OTP with your service
      // For demo purposes, accept any 4-digit code
      if (otp.length === 4) {
        const authToken = Date.now().toString();
        localStorage.setItem('customer_phone', phone);
        localStorage.setItem('customer_auth_token', authToken);
        
        setCustomerPhone(phone);
        setIsAuthenticated(true);
        
        // Initialize loyalty points if first time user
        const { data: existingPoints } = await supabase
          .from('customer_loyalty_points')
          .select('*')
          .eq('customer_phone', phone)
          .single();
          
        if (!existingPoints) {
          await supabase
            .from('customer_loyalty_points')
            .insert({ customer_phone: phone });
        }
        
        return { error: null };
      } else {
        return { error: { message: 'Invalid OTP' } };
      }
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('customer_phone');
    localStorage.removeItem('customer_auth_token');
    setCustomerPhone(null);
    setIsAuthenticated(false);
  };

  return (
    <PhoneAuthContext.Provider value={{ 
      isAuthenticated, 
      customerPhone, 
      loading, 
      sendOTP, 
      verifyOTP, 
      signOut 
    }}>
      {children}
    </PhoneAuthContext.Provider>
  );
};

export const usePhoneAuth = () => {
  const context = useContext(PhoneAuthContext);
  if (context === undefined) {
    throw new Error('usePhoneAuth must be used within a PhoneAuthProvider');
  }
  return context;
};