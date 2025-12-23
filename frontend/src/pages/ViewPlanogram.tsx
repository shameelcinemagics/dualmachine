import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
}

interface Slot {
  id: string;
  vending_machine_id: string;
  slot_number: number;
  product_id: string | null;
  quantity: number;
  max_capacity: number;
  product?: Product;
}

interface VendingMachine {
  id: string;
  machine_id: string;
  location: string;
}

const EditPlanogramPage = () => {
  const [machine, setMachine] = useState<VendingMachine | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Update Dialog State
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'updating' | 'success' | 'error'>('idle');
  const [updateMessage, setUpdateMessage] = useState('');

  const machineId = import.meta.env.VITE_MACHINEID;
  const API_URL = import.meta.env.VITE_API_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    fetchMachineDetails();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (machine?.id) {
      fetchSlots();
    }
  }, [machine]);

  const fetchMachineDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/rest/v1/vending_machines?machine_id=eq.${machineId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'apikey': API_KEY,
          'Content-Type': 'application/json',
        }
      });
      if (response.data.length > 0) {
        setMachine(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching machine details:', error);
      toast({ title: 'Error', description: 'Failed to fetch machine details', variant: 'destructive' });
    }
  };

  const handleUpdate = async () => {
    setIsUpdateDialogOpen(true);
    setUpdateStatus('updating');
    setUpdateMessage('Updating planogram from database...');

    try {
      const response = await fetch('http://localhost:5000/api/planogram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUpdateStatus('success');
        setUpdateMessage('Planogram updated successfully!');
        // Refresh data
        fetchSlots();
        fetchProducts();
      } else {
        throw new Error('Update failed');
      }

    } catch (error) {
      console.error('❌ Update failed:', error);
      setUpdateStatus('error');
      setUpdateMessage('Failed to update planogram. Please try again.');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/rest/v1/products`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'apikey': API_KEY,
          'Content-Type': 'application/json',
        }
      });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({ title: 'Error', description: 'Failed to fetch product data', variant: 'destructive' });
    }
  };

  const fetchSlots = async () => {
    if (!machine) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/rest/v1/slots?vending_machine_id=eq.${machine.id}&select=*,product:product_id(id,name,price,image_url)`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'apikey': API_KEY,
          'Content-Type': 'application/json',
        }
      });
      setSlots(response.data || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast({ title: 'Error', description: 'Failed to fetch slot data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getRow = (slotNumbers: number[]) => {
    const rowSlots = slots
      .filter(slot => slotNumbers.includes(slot.slot_number))
      .sort((a, b) => a.slot_number - b.slot_number); // ✅ sort by slot_number

    return (
      <div className="flex gap-6 mb-10">
        {rowSlots.map(slot => (
          <Card key={slot.id} className="w-72 h-auto">
            <CardContent className="p-4">
              <div className="flex justify-between mb-2">
                <Badge variant="outline">{slot.slot_number}</Badge>
              </div>
              {slot.product ? (
                <div className="flex flex-col items-center space-y-3">
                  {slot.product.image_url && (
                    <img
                      src={slot.product.image_url}
                      alt={slot.product.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                  <div className="font-medium truncate text-center w-full">
                    {slot.product.name}
                  </div>
                  <div className="text-muted-foreground">KWD {slot.product.price.toFixed(2)}</div>
                  <div className="text-sm text-center">
                    Quantity: <strong>{slot.quantity}</strong> / {slot.max_capacity}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10">Empty Slot</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Planogram View</h1>
      <button
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
        onClick={handleUpdate}
      >
        Update
      </button>
      {loading ? (
        <div className="text-center">Loading slots...</div>
      ) : (
        <>
          {getRow([1, 3, 5, 7, 9])}
          {getRow([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])}
          {getRow([21, 23, 25, 27, 29])}
          {getRow([31, 32, 33, 34, 35, 36, 37, 38, 39, 40])}
          {getRow([41, 42, 43, 44, 45, 46, 47, 48, 49, 50])}
          {getRow([51, 52, 53, 54, 55, 56, 57, 58, 59, 60])}
          {getRow([101, 103, 105, 107, 109])}
          {getRow([111, 112, 113, 114, 115, 116, 117, 118, 119, 120])}
          {getRow([121, 123, 125, 127, 129])}
          {getRow([131, 132, 133, 134, 135, 136, 137, 138, 139, 140])}
          {getRow([141, 142, 143, 144, 145, 146, 147, 148, 149, 150])}
          {getRow([151, 152, 153, 154, 155, 156, 157, 158, 159, 160])}
        </>
      )}
      <button
        onClick={() => navigate("/adminapp/test")}
        className="mt-4 text-sm text-gray-500 underline"
      >
        ⬅ Back to Test Tool
      </button>

      {/* Update Status Dialog */}
      <Dialog
        open={isUpdateDialogOpen}
        onOpenChange={(open) => {
          // Prevent closing if updating
          if (!open && updateStatus === 'updating') return;
          setIsUpdateDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {updateStatus === 'updating' && 'Updating Planogram'}
              {updateStatus === 'success' && 'Update Complete'}
              {updateStatus === 'error' && 'Update Failed'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            {updateStatus === 'updating' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <p className="text-sm text-muted-foreground">{updateMessage}</p>
              </>
            )}

            {updateStatus === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-lg font-medium text-green-700">{updateMessage}</p>
              </>
            )}

            {updateStatus === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-red-500" />
                <p className="text-lg font-medium text-red-700">{updateMessage}</p>
              </>
            )}
          </div>

          <div className="flex justify-center">
            {updateStatus !== 'updating' && (
              <Button
                onClick={() => setIsUpdateDialogOpen(false)}
                className={updateStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditPlanogramPage;