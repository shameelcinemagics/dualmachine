import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const PinModal = ({ onClose }: { onClose: () => void }) => {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleKeyPress = (key: string) => {
    if (loading) return;

    if (key === "DEL") {
      setPin((prev) => prev.slice(0, -1));
    } else if (pin.length < 6) {
      setPin((prev) => prev + key);
    }
  };

  const handleSubmit = async () => {
    if (pin.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://127.0.0.1:5000/api/verifyPin", { pin });
      if (res.status === 200) {
        onClose();
        navigate("/adminapp");
      }
    } catch (err) {
      setError("❌ Incorrect PIN");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const keys = ["1", "8", "3", "4", "2", "5", "7", "6", "3", "DEL", "0"];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md text-center space-y-4 w-[300px]">
        <h2 className="text-lg font-semibold">Enter Admin PIN</h2>

        {/* Read-only input field */}
        <div className="text-center text-lg border px-4 py-2 rounded tracking-widest bg-gray-100">
          {pin.replace(/./g, "•") || <span className="text-gray-400">••••••</span>}
        </div>

        {/* Custom Keyboard */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="bg-gray-200 py-3 rounded text-lg font-semibold hover:bg-gray-300 transition"
            >
              {key === "DEL" ? "⌫" : key}
            </button>
          ))}
        </div>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 px-4 py-2 text-white rounded disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Unlock"}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-sm text-red-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
