import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import SplashScreen from "@/components/SplashScreen";
import Index from "./pages/Index";
import Report from "./pages/Report";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import ScanHistory from "./pages/ScanHistory";
import SecurityScan from "./pages/SecurityScan";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogCreate from "./pages/BlogCreate";
import Functionalities from "./pages/Functionalities";
import DomainSquatting from "./pages/func/DomainSquatting";
import BreachCheck from "./pages/func/BreachCheck";
import DnsTwist from "./pages/func/DnsTwist";
import UrlScanner from "./pages/func/UrlScanner";
import WhoisLookup from "./pages/func/WhoisLookup";
import NetworkScanner from "./pages/func/NetworkScanner";
import FunctionalityScanHistory from "./pages/func/FunctionalityScanHistory";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const hideSplash = useCallback(() => setShowSplash(false), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showSplash && <SplashScreen onComplete={hideSplash} />}
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/report" element={<Report />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/history" element={<ScanHistory />} />
              <Route path="/security" element={<SecurityScan />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/new" element={<BlogCreate />} />
              <Route path="/blog/edit/:id" element={<BlogCreate />} />
              <Route path="/functionalities" element={<Functionalities />} />
              <Route path="/functionalities/domain-squatting" element={<DomainSquatting />} />
              <Route path="/functionalities/breach-check" element={<BreachCheck />} />
              <Route path="/functionalities/dns-twist" element={<DnsTwist />} />
              <Route path="/functionalities/url-scanner" element={<UrlScanner />} />
              <Route path="/functionalities/whois-lookup" element={<WhoisLookup />} />
              <Route path="/functionalities/network-scanner" element={<NetworkScanner />} />
              <Route path="/functionalities/scan-history" element={<FunctionalityScanHistory />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
