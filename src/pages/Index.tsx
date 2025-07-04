import { useState, useEffect } from "react";
import { LoginForm } from "@/components/LoginForm";
import { DriverDashboard } from "@/components/DriverDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { MyTrips } from "@/components/MyTrips";
import { AllTrips } from "@/components/AllTrips";
import { Reports } from "@/components/Reports";
import { Drivers } from "@/components/Drivers";
import { DriverAppointments } from "@/components/DriverAppointments";
import { AdminAppointments } from "@/components/AdminAppointments";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export type UserRole = "driver" | "admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export type ViewType = "overview" | "my-trips" | "dashboard" | "all-trips" | "reports" | "drivers" | "appointments";

const Index = () => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const stored = localStorage.getItem("currentView");
    return stored ? (stored as ViewType) : "overview";
  });

  console.log('User nach Reload:', user);
  console.log('View nach Reload:', currentView);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("currentView", currentView);
  }, [currentView]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentView(userData.role === "admin" ? "dashboard" : "overview");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("overview");
    localStorage.removeItem("user");
    localStorage.removeItem("currentView");
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    if (!user) return null;

    switch (currentView) {
      case "overview":
        return user.role === "driver" ? <DriverDashboard user={user} /> : <AdminDashboard user={user} />;
      case "dashboard":
        return <AdminDashboard user={user} />;
      case "my-trips":
        return <MyTrips user={user} />;
      case "all-trips":
        return <AllTrips user={user} />;
      case "reports":
        return <Reports user={user} />;
      case "drivers":
        return <Drivers user={user} />;
      case "appointments":
        return user.role === "driver" ? <DriverAppointments user={user} /> : <AdminAppointments user={user} />;
      default:
        return user.role === "driver" ? <DriverDashboard user={user} /> : <AdminDashboard user={user} />;
    }
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar user={user} currentView={currentView} onViewChange={handleViewChange} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-white flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold text-gray-900">
                Fahrtenbuch - {user.role === "admin" ? "Admin Bereich" : "Fahrer Bereich"}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Willkommen, {user.name}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 bg-gray-50">
            {renderCurrentView()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
