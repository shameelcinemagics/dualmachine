import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VendingMachine {
  id: string;
  name: string;
  location_name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface MobileHomeProps {
  onMachineSelect: (machineId: string) => void;
}

export const MobileHome = ({ onMachineSelect }: MobileHomeProps) => {
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserLocation();
    loadMachines();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Kuwait City coordinates
          setUserLocation({ lat: 29.3759, lng: 47.9774 });
        }
      );
    } else {
      // Fallback to Kuwait City coordinates
      setUserLocation({ lat: 29.3759, lng: 47.9774 });
    }
  };

  const loadMachines = async () => {
    const { data, error } = await supabase
      .from('vending_machines')
      .select('*')
      .eq('is_active', true);

    if (data && !error) {
      setMachines(data);
    }
    setLoading(false);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const machinesWithDistance = machines.map(machine => ({
    ...machine,
    distance: userLocation ? calculateDistance(
      userLocation.lat,
      userLocation.lng,
      Number(machine.latitude),
      Number(machine.longitude)
    ) : 0
  })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Find Vending Machines</h1>
          <p className="text-muted-foreground">Discover VendIT machines near you</p>
        </div>

        <div className="space-y-4">
          {machinesWithDistance.map((machine) => (
            <Card key={machine.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{machine.name}</h3>
                  <p className="text-sm text-muted-foreground">{machine.location_name}</p>
                </div>
                <Badge variant="secondary">
                  {machine.distance ? `${machine.distance.toFixed(1)} km` : 'Distance unknown'}
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{machine.address}</span>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => onMachineSelect(machine.id)}
                  className="flex-1"
                >
                  View Products
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    const url = `https://maps.google.com/?q=${machine.latitude},${machine.longitude}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {machinesWithDistance.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No vending machines found nearby.</p>
          </div>
        )}
      </div>
    </div>
  );
};