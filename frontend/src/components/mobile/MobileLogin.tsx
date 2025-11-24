import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePhoneAuth } from '@/hooks/usePhoneAuth';
import { useToast } from '@/hooks/use-toast';

interface MobileLoginProps {
  onLogin: () => void;
}

export const MobileLogin = ({ onLogin }: MobileLoginProps) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState('+965');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendOTP, verifyOTP } = usePhoneAuth();
  const { toast } = useToast();

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      toast({ title: "Error", description: "Please enter your phone number", variant: "destructive" });
      return;
    }

    setLoading(true);
    const fullPhone = countryCode + phoneNumber;
    const { error } = await sendOTP(fullPhone);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "OTP sent to your phone" });
      setStep('otp');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast({ title: "Error", description: "Please enter the OTP", variant: "destructive" });
      return;
    }

    setLoading(true);
    const fullPhone = countryCode + phoneNumber;
    const { error } = await verifyOTP(fullPhone, otp);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Login successful!" });
      onLogin();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to VendIT</h1>
          <p className="text-muted-foreground mt-2">
            {step === 'phone' ? 'Enter your phone number to continue' : 'Enter the OTP sent to your phone'}
          </p>
        </div>

        {step === 'phone' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+965">🇰🇼 Kuwait (+965)</SelectItem>
                  <SelectItem value="+971">🇦🇪 UAE (+971)</SelectItem>
                  <SelectItem value="+966">🇸🇦 Saudi Arabia (+966)</SelectItem>
                  <SelectItem value="+1">🇺🇸 USA (+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex">
                <div className="bg-muted px-3 py-2 rounded-l-md border border-r-0 flex items-center">
                  {countryCode}
                </div>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="12345678"
                  className="rounded-l-none"
                />
              </div>
            </div>

            <Button onClick={handleSendOTP} disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1234"
                maxLength={4}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <Button onClick={handleVerifyOTP} disabled={loading} className="w-full">
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <Button variant="outline" onClick={() => setStep('phone')} className="w-full">
              Change Phone Number
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};