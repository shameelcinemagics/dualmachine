import { useNavigate } from "react-router-dom";
import { Plus, Thermometer, Wrench, Factory, WashingMachine, ShoppingCart, Notebook, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";

const TestTool = () => {
  const navigate = useNavigate();

  const Update=async ()=>{
    try{
      const response = await axios.post("http://localhost:5000/api/update");
      toast({
        title: `✅ Update completed`,
        description: `${response.data.message}`,
      });
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🧪 Configuration Tool</h1>
        <button
          onClick={() => navigate("/adminapp")}
          className="text-sm text-red-500 underline"
        >
          ⬅ Back to Home
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 text-center">

        {/* Add machine */}
        <div
          onClick={() => navigate("/adminapp/test/add-machine")}
          className="bg-muted/30 p-6 rounded-lg cursor-pointer hover:bg-muted transition-all"
        >
          <Factory className="w-8 h-8 mx-auto text-blue-600" />
          <p className="mt-2 font-medium">Add Machine</p>
        </div>

        {/* Viiew machine */}
        <div
          onClick={() => navigate("/adminapp/test/view-machine")}
          className="bg-muted/30 p-6 rounded-lg cursor-pointer hover:bg-muted transition-all"
        >
          <WashingMachine className="w-8 h-8 mx-auto text-blue-600" />
          <p className="mt-2 font-medium">View Machine</p>
        </div>


        {/* Test Slot */}
        <div
          onClick={() => navigate("/adminapp/test/test-slot")}
          className="bg-muted/30 p-6 rounded-lg cursor-pointer hover:bg-muted transition-all"
        >
          <Wrench className="w-8 h-8 mx-auto text-yellow-600" />
          <p className="mt-2 font-medium">Test Slot</p>
        </div>

        {/* Temperature Control */}
        <div
          onClick={() => navigate("/adminapp/test/temperature")}
          className="bg-muted/30 p-6 rounded-lg cursor-pointer hover:bg-muted transition-all"
        >
          <Thermometer className="w-8 h-8 mx-auto text-red-600" />
          <p className="mt-2 font-medium">Temperature</p>
        </div>


        {/* Add Planogram */}
        <div
          onClick={() => navigate("/adminapp/test/viewplanogram")}
          className="bg-muted/30 p-6 rounded-lg cursor-pointer hover:bg-muted transition-all"
        >
          <Notebook className="w-8 h-8 mx-auto text-red-600" />
          <p className="mt-2 font-medium">View Planogram</p>
        </div>

        {/* Update system */}
        <div
          onClick={Update}
          className="bg-muted/30 p-6 rounded-lg cursor-pointer hover:bg-muted transition-all"
        >
          <Download className="w-8 h-8 mx-auto text-red-600" />
          <p className="mt-2 font-medium">Update System</p>
        </div>
      </div>
    </div>
  );
};

export default TestTool;
