import { FC, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Hammer, Users, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  const [location] = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <Hammer className="w-6 h-6 text-primary mr-2" />
          <span className="font-display font-bold text-xl tracking-tight">LeadForge</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4 px-2">Pipeline</div>
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location === item.href 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t">
          <button className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center md:hidden">
            <Hammer className="w-6 h-6 text-primary mr-2" />
            <span className="font-display font-bold text-lg tracking-tight">LeadForge</span>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              AD
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
