"use client";

import FilesPage from "@/components/upload";

import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { FileList } from "./file-list";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Chat",
    url: "/",
    icon: MessageSquare,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  const state = useSidebar();
  console.log(state.open);

  return (
    <Sidebar variant="floating" className="bg-zinc-900" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent className="shadow-2xl shadow-black">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {state.open && (
          <SidebarGroup className="overflow-hidden">
            <SidebarGroupLabel>Upload</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="w-[220px]">
                <FilesPage></FilesPage>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {state.open && <FileList />}
      </SidebarContent>
    </Sidebar>
  );
}
