
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ListProvider } from "./context/ListContext";
import { UserProvider } from "./context/UserContext";
import { ListsProvider } from "./context/ListsContext";
import Index from "./pages/Index";
import CreateList from "./pages/CreateList";
import CustomizeList from "./pages/CustomizeList";
import ViewList from "./pages/ViewList";
import SharedList from "./pages/SharedList";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import PrintMode from "./components/PrintMode";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <ListsProvider>
        <ListProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/create" element={<CreateList />} />
                  <Route path="/customize" element={<CustomizeList />} />
                  <Route path="/view" element={<ViewList />} />
                  <Route path="/shared/:listId" element={<SharedList />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <PrintMode />
                <Navbar />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </ListProvider>
      </ListsProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
