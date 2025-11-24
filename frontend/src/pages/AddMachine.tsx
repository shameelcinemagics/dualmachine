import { useState } from "react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const AddMachine = () => {
  const [form, setForm] = useState({
    machineId: "",
    machineName: "",
    location: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/addMachine", form);
      toast({
        title: "✅ Machine Added",
        description: `Machine ${form.machineId} has been registered.`,
      });
      setForm({ machineId: "", machineName: "", location: "" });
    } catch (error: any) {
      toast({
        title: "❌ Failed",
        description:
          error.response?.data?.message || "Could not add the machine.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md space-y-4">
      <h1 className="text-2xl font-bold">🏭 Add Vending Machine</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="machineId"
          placeholder="Machine ID (e.g. vm001)"
          className="w-full border px-4 py-2 rounded"
          onChange={handleChange}
          value={form.machineId}
          required
        />
        <input
          name="machineName"
          placeholder="Machine Name"
          className="w-full border px-4 py-2 rounded"
          onChange={handleChange}
          value={form.machineName}
          required
        />
        <input
          name="location"
          placeholder="Location"
          className="w-full border px-4 py-2 rounded"
          onChange={handleChange}
          value={form.location}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Machine"}
        </button>
      </form>

      <button
        onClick={() => navigate("/adminapp/test")}
        className="text-sm text-gray-500 underline"
      >
        ⬅ Back to Admin Menu
      </button>
    </div>
  );
};

export default AddMachine;
