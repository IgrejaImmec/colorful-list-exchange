
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ListProvider } from "./context/ListContext";
import Index from "./pages/Index";
import CreateList from "./pages/CreateList";
import CustomizeList from "./pages/CustomizeList";
import ViewList from "./pages/ViewList";
import SharedList from "./pages/SharedList";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ListProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create" element={<CreateList />} />
              <Route path="/customize" element={<CustomizeList />} />
              <Route path="/view" element={<ViewList />} />
              <Route path="/shared/:listId" element={<SharedList />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Navbar />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ListProvider>
  </QueryClientProvider>
);

export default App;
