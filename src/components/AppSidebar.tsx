
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  Home, 
  Car, 
  Users, 
  FileText, 
  BarChart3,
  Calendar
} from "lucide-react"
import { User, ViewType } from "@/pages/Index"

interface AppSidebarProps {
  user: User;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function AppSidebar({ user, currentView, onViewChange }: AppSidebarProps) {
  const driverMenuItems = [
    {
      title: "Übersicht",
      icon: Home,
      view: "overview" as ViewType,
    },
    {
      title: "Meine Fahrten",
      icon: Car,
      view: "my-trips" as ViewType,
    },
    {
      title: "Termine",
      icon: Calendar,
      view: "appointments" as ViewType,
    },
  ]

  const adminMenuItems = [
    {
      title: "Dashboard",
      icon: BarChart3,
      view: "dashboard" as ViewType,
    },
    {
      title: "Alle Fahrten",
      icon: Car,
      view: "all-trips" as ViewType,
    },
    {
      title: "Berichte",
      icon: FileText,
      view: "reports" as ViewType,
    },
    {
      title: "Fahrer",
      icon: Users,
      view: "drivers" as ViewType,
    },
    {
      title: "Terminverwaltung",
      icon: Calendar,
      view: "appointments" as ViewType,
    },
  ]

  const menuItems = user.role === "driver" ? driverMenuItems : adminMenuItems;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Fahrtenbuch</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => onViewChange(item.view)}
                    isActive={currentView === item.view}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
