import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { QrCode, Camera } from 'lucide-react';

export const MobileQRScanner = () => {
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleScanQR = () => {
    setScanning(true);
    // In a real implementation, you would integrate with a QR code scanning library
    // For now, we'll simulate the scanning process
    setTimeout(() => {
      setScanning(false);
      // Simulate finding a machine code
      setManualCode('VM001_LOCATION_ABC');
    }, 2000);
  };

  const handleSubmitCode = () => {
    if (manualCode) {
      // Process the QR code - redirect to machine details or perform action
      console.log('Processing QR code:', manualCode);
      // In a real app, you would parse the QR code and navigate accordingly
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">QR Code Scanner</h1>
          <p className="text-muted-foreground">Scan QR codes on vending machines for quick access</p>
        </div>

        <div className="space-y-6">
          {/* QR Scanner */}
          <Card className="p-6">
            <div className="text-center">
              <div className="w-48 h-48 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                {scanning ? (
                  <div className="space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Scanning...</p>
                  </div>
                ) : (
                  <QrCode className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
              
              <Button 
                onClick={handleScanQR} 
                disabled={scanning}
                className="mb-4"
              >
                <Camera className="w-4 h-4 mr-2" />
                {scanning ? 'Scanning...' : 'Start QR Scan'}
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Point your camera at the QR code on the vending machine
              </p>
            </div>
          </Card>

          {/* Manual Entry */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Enter Code Manually</h3>
              <div className="space-y-2">
                <Label htmlFor="code">Machine Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter machine code"
                />
              </div>
              <Button 
                onClick={handleSubmitCode} 
                disabled={!manualCode}
                className="w-full"
              >
                Access Machine
              </Button>
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-3">How to use QR Scanner</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Look for the QR code sticker on the vending machine</li>
              <li>• Tap "Start QR Scan" and point your camera at the code</li>
              <li>• The app will automatically detect and process the code</li>
              <li>• You'll be taken directly to that machine's product catalog</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};