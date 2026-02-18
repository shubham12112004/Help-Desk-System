import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./AppSidebar";
import ProfessionalHeader from "./ProfessionalHeader";
import Footer from "./Footer";
import { HospitalAIChatbot } from "./HospitalAIChatbot";

export function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleSearch = (query) => {
    // Search functionality handled by ProfessionalHeader
    console.log("Search query:", query);
  };

  const handleContentClick = () => {
    // Close sidebar when clicking on main content
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Professional Header */}
      <ProfessionalHeader onSearch={handleSearch} />
      
      {/* Floating Menu Button - shows when sidebar is closed */}
      {!isSidebarOpen && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setIsSidebarOpen(true);
          }}
          size="icon"
          variant="default"
          className="fixed left-4 top-20 z-50 h-12 w-12 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}
      
      <div className="flex flex-1">
        <AppSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        <div 
          className="flex min-h-screen flex-1 flex-col"
          onClick={handleContentClick}
        >
          <main className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all ${
            isSidebarOpen ? "lg:mr-0" : "lg:mr-0"
          }`}>
            {children}
          </main>
        </div>
      </div>
      
      {/* AI Chatbot - Global floating button */}
      <HospitalAIChatbot />
      
      <Footer />
    </div>
  );
}
