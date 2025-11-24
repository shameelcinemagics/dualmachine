import { useState } from "react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { NumericKeyboard } from "@/components/NumericKeyboard"; // import your keyboard component

const TestSlot = () => {
  const [slotNumber, setSlotNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmingAll, setConfirmingAll] = useState(false);
  const navigate = useNavigate();

  const testSlot = async () => {
    if (!slotNumber) {
      toast({
        title: "Please enter a slot number",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/slots/test", {
        slotNumber: parseInt(slotNumber),
      });
      toast({
        title: `🧪 Slot ${slotNumber} tested`,
        description: `Command sent: TEST_SLOT:${slotNumber}`,
      });
      setSlotNumber("");
    } catch (err) {
      console.error("❌ Test command failed", err);
      toast({
        title: "Test failed",
        description: "Could not send command.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testAllSlots = async () => {
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/slots/testall");
      toast({
        title: `✅ All slots tested`,
        description: `Command sent to all registered slots.`,
      });
    } catch (err) {
      console.error("❌ Test all slots failed", err);
      toast({
        title: "Test failed",
        description: "Could not send command to all slots.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setConfirmingAll(false);
    }
  };

  const handleKeyInput = (val: string) => {
    if (slotNumber.length < 3) {
      setSlotNumber((prev) => prev + val);
    }
  };

  const handleDelete = () => {
    setSlotNumber((prev) => prev.slice(0, -1));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧪 Test Slots</h1>
      <button
        onClick={() => navigate("/adminapp/test")}
        className="mt-4 text-sm text-gray-500 underline"
      >
        ⬅ Back to Test Tool
      </button>

      <div className="mt-6 space-y-6">

        {/* Custom input */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-64 px-4 py-3 border text-center text-xl rounded bg-gray-100 tracking-widest">
            {slotNumber || <span className="text-gray-400">•••</span>}
          </div>
          <NumericKeyboard
            onInput={handleKeyInput}
            onDelete={handleDelete}
            disabled={loading}
          />
          <button
            onClick={testSlot}
            disabled={loading || !slotNumber}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : `Test Slot`}
          </button>
        </div>

        {/* Test All Slots Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setConfirmingAll(true)}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test All Slots
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmingAll && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md space-y-4 w-96 text-center">
            <h2 className="text-lg font-bold">⚠️ Confirm Test All</h2>
            <p className="text-sm text-gray-600">
              This will send a test command to **all slots**. Are you sure?
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={testAllSlots}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                {loading ? "Sending..." : "Yes, Test All"}
              </button>
              <button
                onClick={() => setConfirmingAll(false)}
                disabled={loading}
                className="text-sm text-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSlot;
