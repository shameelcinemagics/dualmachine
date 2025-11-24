import { useState, useEffect } from 'react';
import { PhoneAuthProvider } from '@/hooks/usePhoneAuth';
import { MobileLogin } from '@/components/mobile/MobileLogin';
import { MobileSplash } from '@/components/mobile/MobileSplash';
import { MobileHome } from '@/components/mobile/MobileHome';
import { MobileOrders } from '@/components/mobile/MobileOrders';
import { MobileQRScanner } from '@/components/mobile/MobileQRScanner';
import { MobileStore } from '@/components/mobile/MobileStore';
import { MobileSettings } from '@/components/mobile/MobileSettings';
import { MobileNavigation } from '@/components/mobile/MobileNavigation';
import { MachineDetails } from '@/components/mobile/MachineDetails';
import { usePhoneAuth } from '@/hooks/usePhoneAuth';

type Screen = 'splash' | 'login' | 'home' | 'orders' | 'qr' | 'store' | 'settings' | 'machine';

const MobileAppContent = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const { isAuthenticated, loading } = usePhoneAuth();

  useEffect(() => {
    // Show splash screen for 3 seconds, then determine next screen
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        setCurrentScreen('home');
      } else {
        setCurrentScreen('login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  if (loading) {
    return <MobileSplash />;
  }

  const handleMachineSelect = (machineId: string) => {
    setSelectedMachineId(machineId);
    setCurrentScreen('machine');
  };

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    if (currentScreen === 'splash') {
      return <MobileSplash />;
    }

    if (!isAuthenticated && currentScreen !== 'login') {
      return <MobileLogin onLogin={() => setCurrentScreen('home')} />;
    }

    switch (currentScreen) {
      case 'login':
        return <MobileLogin onLogin={() => setCurrentScreen('home')} />;
      case 'home':
        return <MobileHome onMachineSelect={handleMachineSelect} />;
      case 'orders':
        return <MobileOrders />;
      case 'qr':
        return <MobileQRScanner />;
      case 'store':
        return <MobileStore />;
      case 'settings':
        return <MobileSettings onLogout={() => setCurrentScreen('login')} />;
      case 'machine':
        return selectedMachineId ? 
          <MachineDetails 
            machineId={selectedMachineId} 
            onBack={() => setCurrentScreen('home')} 
          /> : 
          <MobileHome onMachineSelect={handleMachineSelect} />;
      default:
        return <MobileHome onMachineSelect={handleMachineSelect} />;
    }
  };

  const showNavigation = isAuthenticated && currentScreen !== 'splash' && currentScreen !== 'login' && currentScreen !== 'machine';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-hidden">
        {renderScreen()}
      </div>
      {showNavigation && (
        <MobileNavigation currentScreen={currentScreen} onNavigate={navigateToScreen} />
      )}
    </div>
  );
};

const MobileApp = () => {
  return (
    <PhoneAuthProvider>
      <MobileAppContent />
    </PhoneAuthProvider>
  );
};

export default MobileApp;