import {
  BarChart3,
  Camera,
  History,
  Home,
  LogOut,
  Radar,
} from "lucide-react"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import useAuth from "@/hooks/useAuth"

import { type Item, Main } from "./Main"
import { User } from "./User"

const navItems: Item[] = [
  {
    icon: Home,
    title: "Dashboard",
    path: "/dashboard",
  },

  {
    icon: Radar,
    title: "Detection",
    path: "/detection",
  },

  {
    icon: BarChart3,
    title: "Analytics",
    path: "/analytics",
  },

  {
    icon: History,
    title: "History",
    path: "/history",
  },

  {
    icon: Camera,
    title: "Camera",
    path: "/camera",
  },
]

export function AppSidebar() {
  const { user: currentUser, logout } = useAuth()

  return (
    <Sidebar collapsible="icon">
      {/* HEADER */}
      <SidebarHeader
        className="
          px-4 py-6
          group-data-[collapsible=icon]:px-0
          group-data-[collapsible=icon]:items-center
        "
      >
        <Logo variant="responsive" />
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>
        <Main items={navItems} />
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <SidebarAppearance />

        <User user={currentUser} />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log Out"
              onClick={logout}
              className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar