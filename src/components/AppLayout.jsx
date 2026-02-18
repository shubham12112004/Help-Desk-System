import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";
import Footer from "./Footer";
export function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1">
        <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-6 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm transition hover:bg-accent"
                aria-label="Toggle sidebar"
                title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-sm font-semibold text-foreground">MedDesk</p>
                <p className="text-xs text-muted-foreground">Hospital help desk workspace</p>
              </div>
            </div>
            <ThemeToggle />
          </header>
          <main className={`flex-1 p-6 transition-all lg:p-8 ${
            isSidebarOpen ? "lg:ml-64" : "lg:ml-0"
          }`}>
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
