import { useNavigate } from "react-router-dom";
import { BarChart, Camera } from "lucide-react";

export const AdminAppSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 text-center">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <div className="flex justify-center gap-10 mt-6">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-4 rounded-lg flex flex-col items-center"
        >
          <BarChart className="w-8 h-8 mb-2" />
          Sales Screen
        </button>

        <button
          onClick={() => navigate("/adminapp/test")}
          className="bg-green-600 text-white px-6 py-4 rounded-lg flex flex-col items-center"
        >
          <Camera className="w-8 h-8 mb-2" />
          Configuration
        </button>
      </div>
    </div>
  );
};

export default AdminAppSelector;