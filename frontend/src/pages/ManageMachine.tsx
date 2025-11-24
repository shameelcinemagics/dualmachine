import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const ManageMachines = () => {
  const [machines, setMachines] = useState([]);
  const navigate = useNavigate()

  const fetchMachines = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/addMachine");
      setMachines(res.data);
    } catch (err) {
      toast({ title: "Failed to fetch machines", variant: "destructive" });
    }
  };

  const handleDelete = async (machineId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/addMachine/${machineId}`);
      toast({ title: "Machine deleted" });
      fetchMachines();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🏭 Manage Machines</h1>
      <button
          onClick={() => navigate("/adminapp/test")}
          className="text-sm text-red-500 underline"
        >
          ⬅ Back to Home
        </button>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th>ID</th>
            <th>Machine ID</th>
            <th>Name</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {machines.map((m) => (
            <tr key={m.id} className="border-b hover:bg-muted/20">
              <td>{m.id}</td>
              <td>{m.machineId}</td>
              <td>{m.machineName}</td>
              <td>{m.location}</td>
              <td>
                <button onClick={() => handleDelete(m.machineId)} className="text-red-600">
                  🗑 Delete
                </button>
                {/* Add edit button here later */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageMachines;
