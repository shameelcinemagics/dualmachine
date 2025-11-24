import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

const ManageSlots = () => {
  const [slots, setSlots] = useState([]);

  const fetchSlots = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/slots");
      setSlots(res.data);
    } catch (err) {
      toast({ title: "Failed to fetch slots", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/slots/${id}`);
      toast({ title: "Slot deleted" });
      fetchSlots();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📦 Manage Slots</h1>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th>Slot</th>
            <th>Status</th>
            <th>Quantity</th>
            <th>Machine</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((s) => (
            <tr key={s.id} className="border-b hover:bg-muted/20">
              <td>{s.slotNumber}</td>
              <td>{s.status}</td>
              <td>{s.quantity}</td>
              <td>{s.vendingMachineId}</td>
              <td>
                <button onClick={() => handleDelete(s.id)} className="text-red-600">
                  🗑 Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageSlots;
