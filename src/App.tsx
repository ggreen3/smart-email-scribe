
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EmailSummary from "./components/EmailSummary";
import ChaserEmails from "./components/ChaserEmails";
import FinancialEmails from "./components/FinancialEmails";
import ClientsList from "./components/ClientsList";
import ClientEmails from "./components/ClientEmails";

const queryClient = new QueryClient();

// Layout component that includes the outlet for nested routes
const Layout = () => (
  <div className="flex h-screen overflow-hidden bg-email-background">
    <Outlet />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/sent" element={<Index />} />
            <Route path="/drafts" element={<Index />} />
            <Route path="/archive" element={<Index />} />
            <Route path="/spam" element={<Index />} />
            <Route path="/trash" element={<Index />} />
            <Route path="/important" element={<Index />} />
            <Route path="/people" element={<Index />} />
            <Route path="/search" element={<EmailSummary />} />
            <Route path="/chasers" element={<ChaserEmails />} />
            <Route path="/financials" element={<FinancialEmails />} />
            <Route path="/clients" element={<ClientsList />} />
            <Route path="/clients/:clientId" element={<ClientEmails />} />
            <Route path="/settings" element={<Index />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
