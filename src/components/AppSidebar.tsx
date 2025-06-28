
import { NavLink, useLocation } from "react-router-dom";
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
import { User } from "@/pages/Index";

interface AppSidebarProps {
  user: User;
}

export const AppSidebar = ({ user }: AppSidebarProps) => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const driverItems = [
    { title: "Übersicht", url: "#overview", icon: Home },
    { title: "Neue Fahrt", url: "#new-trip", icon: Plus },
    { title: "Meine Fahrten", url: "#my-trips", icon: List },
  ];

  const adminItems = [
    { title: "Dashboard", url: "#dashboard", icon: BarChart3 },
    { title: "Alle Fahrten", url: "#all-trips", icon: List },
    { title: "Berichte", url: "#reports", icon: FileText },
    { title: "Fahrer", url: "#drivers", icon: Users },
  ];

  const items = user.role === "admin" ? adminItems : driverItems;

  const getNavCls = (url: string) => {
    const isActive = currentPath === url || (url === "#overview" && currentPath === "/");
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
                    <a 
                      href={item.url} 
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getNavCls(item.url)}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </a>
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
