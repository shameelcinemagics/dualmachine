import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import MobileApp from "./pages/MobileApp";
import NotFound from "./pages/NotFound";
import AdminAppSelector  from "./pages/AdminAppSelector";
import TestTool from "./pages/TestTool";
import TestSlot from "./pages/TestSlot";
import Temperature from "./pages/Temperature";
import AddMachine from "./pages/AddMachine";
import ManageMachines from "./pages/ManageMachine";
import AddPlanogram from "./pages/AddPlanogram";
import ViewPlanogram from "./pages/ViewPlanogram";
import Signage from "./pages/Signage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signage" element={<Signage/>}/>
            <Route path="/auth" element={<Auth />} />
            {/* <Route path="/admin/*" element={<Admin />} /> */}
            {/* <Route path="/mobile" element={<MobileApp />} /> */}
            <Route path="/adminapp" element ={<AdminAppSelector/>}/> 
            <Route path="/adminapp/test" element={<TestTool />} />
            <Route path="/adminapp/test/test-slot" element={<TestSlot />} />
            <Route path="/adminapp/test/temperature" element={<Temperature />} />
            <Route path="/adminapp/test/add-machine" element={<AddMachine />} />
            <Route path="/adminapp/test/view-machine" element={<ManageMachines />} />
            <Route path="/adminapp/test/viewplanogram" element={<ViewPlanogram />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
