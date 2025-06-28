
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Plus, 
  List, 
  BarChart3, 
  FileText, 
  Users, 
  Truck,
  Home
} from "lucide-react";
import { User, ViewType } from "@/pages/Index";

interface AppSidebarProps {
  user: User;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const AppSidebar = ({ user, currentView, onViewChange }: AppSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const driverItems = [
    { title: "Übersicht", view: "overview" as ViewType, icon: Home },
    { title: "Neue Fahrt", view: "new-trip" as ViewType, icon: Plus },
    { title: "Meine Fahrten", view: "my-trips" as ViewType, icon: List },
  ];

  const adminItems = [
    { title: "Dashboard", view: "dashboard" as ViewType, icon: BarChart3 },
    { title: "Alle Fahrten", view: "all-trips" as ViewType, icon: List },
    { title: "Berichte", view: "reports" as ViewType, icon: FileText },
    { title: "Fahrer", view: "drivers" as ViewType, icon: Users },
  ];

  const items = user.role === "admin" ? adminItems : driverItems;

  const getNavCls = (view: ViewType) => {
    const isActive = currentView === view;
    return isActive ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100";
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-white border-r">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-gray-900">Fahrtenbuch</h2>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium">
            {user.role === "admin" ? "Administration" : "Fahrer Bereich"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button 
                      onClick={() => onViewChange(item.view)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getNavCls(item.view)}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
