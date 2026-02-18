import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import ProfessionalHeader from "./ProfessionalHeader";
import Footer from "./Footer";
export function AppLayout({ children, notifications = [] }) {
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Professional Header */}
      <ProfessionalHeader onSearch={handleSearch} notifications={notifications} />
      
      <div className="flex flex-1">
        <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex min-h-screen flex-1 flex-col">
          <main className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all ${
            isSidebarOpen ? "lg:mr-0" : "lg:mr-0"
          }`}>
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
