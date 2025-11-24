import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Temperature = () => {
  const navigate = useNavigate();
  const [temperature, setTemperature] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTemp, setCurrentTemp] = useState<{ temperature1: number; temperature2: number } | null>(null);
  const [machineId, setMachineId] = useState(1); // Add machineId state

  // 🔁 Auto-poll every 5 minutes
  useEffect(() => {
    const fetchTemperature = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/temperature");
        setCurrentTemp(res.data);
        console.log(currentTemp);
        console.log("🌡 Auto-read temperature:", res.data);
      } catch (err) {
        console.error("❌ Auto-read failed:", err);
      }
    };

    fetchTemperature(); // fetch once on load

    const interval = setInterval(fetchTemperature, 5 * 60 * 1000); // every 5 minutes

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  const enableController = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/machine/tempcontroller");
      toast({
        title: "✅ Success",
        description: res.data.message,
      });
    } catch (err) {
      toast({
        title: "❌ Failed to enable",
      });
    }
  };

  const handleSetTemperature = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(temperature);

    if (isNaN(value) || value < -20 || value > 100) {
      toast({
        title: "❌ Invalid Input",
        description: "Temperature must be between -20 and 100°C",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/temperature", {
        temperature: value,
        machine: machineId, // Include the machineId in the request
      });

      toast({
        title: "✅ Success",
        description: response.data.message,
      });

      setTemperature("");
    } catch (err: any) {
      toast({
        title: "❌ Error",
        description: err.response?.data?.message || "Failed to set temperature",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md space-y-6">
      <h1 className="text-2xl font-bold">🌡 Temperature Control</h1>

      <button
        onClick={() => navigate("/adminapp/test")}
        className="mt-4 text-sm text-gray-500 underline"
      >
        ⬅ Back to Test Tool
      </button>

      <div>
        <button
          className="mt-4 text-sm text-gray-500 underline"
          onClick={enableController}
        >
          Enable Temperature
        </button>
      </div>

      {/* Display current reading */}
      {currentTemp && (
        <div className="p-4 bg-muted/20 rounded text-sm">
          <p>Sensor 1: <strong>{currentTemp[0].temperature1}°C</strong></p>
          <p>Sensor 2: <strong>{currentTemp[1].temperature1}°C</strong></p>
        </div>
      )}

      {/* Machine ID selection */}
      <div className="mt-4">
        <h3 className="font-medium">Select Machine</h3>
        <div className="flex space-x-4">
          <label>
            <input
              type="radio"
              name="machine"
              value={1}
              checked={machineId === 1}
              onChange={() => setMachineId(1)}
            />
            Machine 1
          </label>
          <label>
            <input
              type="radio"
              name="machine"
              value={2}
              checked={machineId === 2}
              onChange={() => setMachineId(2)}
            />
            Machine 2
          </label>
        </div>
      </div>

      {/* Temperature input form */}
      <form onSubmit={handleSetTemperature} className="space-y-4">
        <input
          type="number"
          placeholder="Enter target °C (e.g. 5)"
          className="w-full border px-4 py-2 rounded"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          min={-20}
          max={100}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Setting..." : "Set Temperature"}
        </button>
      </form>
    </div>
  );
};

export default Temperature;
