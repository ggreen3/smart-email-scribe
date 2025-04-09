
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EmailSummaries from "./pages/EmailSummaries";
import ChaserEmails from "./pages/ChaserEmails";
import Financials from "./pages/Financials";
import ClientsList from "./pages/ClientsList";
import ClientEmails from "./pages/ClientEmails";
import EmailAIChat from "./pages/EmailAIChat";
import Sent from "./pages/Sent";
import Drafts from "./pages/Drafts";
import Archive from "./pages/Archive";
import Spam from "./pages/Spam";
import Trash from "./pages/Trash";
import Important from "./pages/Important";
import People from "./pages/People";
import Settings from "./pages/Settings";
import Compose from "./pages/Compose";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sent" element={<Sent />} />
          <Route path="/drafts" element={<Drafts />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/spam" element={<Spam />} />
          <Route path="/trash" element={<Trash />} />
          <Route path="/important" element={<Important />} />
          <Route path="/people" element={<People />} />
          <Route path="/clients" element={<ClientsList />} />
          <Route path="/clients/:clientId" element={<ClientEmails />} />
          <Route path="/chasers" element={<ChaserEmails />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/compose" element={<Compose />} />
          <Route path="/summaries" element={<EmailSummaries />} />
          <Route path="/ai-chat" element={<EmailAIChat />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
