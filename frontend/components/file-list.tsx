"use client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { FileText, Loader2, Trash } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { DropdownMenuDialog } from "./dot-dropdown";

export function FileList() {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/files")
      .then((res) => res.json())
      .then((data) => {
        setFiles(data.files || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleDelete(file: string) {
    try {
      const response = await fetch(`http://localhost:8000/files/${file}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      if (!response.ok) {
        toast("Failed to delete...");
      } else {
        window.location.reload();
      }
    } catch (error) {
      toast("Failed to delete...");
    }
  }

  if (loading)
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="animate-spin h-4 w-4 text-zinc-500" />
      </div>
    );
  if (files.length === 0) return null;

  return (
    <SidebarGroup className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <SidebarGroupLabel>Uploaded files</SidebarGroupLabel>
        <DropdownMenuDialog></DropdownMenuDialog>
      </div>
      <SidebarGroupContent>
        <SidebarMenu>
          {files.map((file) => (
            <SidebarMenuItem key={file}>
              <SidebarMenuButton
                className="py-0 h-8 hover:bg-transparent active:bg-transparent focus:bg-transparent data-[active=true]:bg-transparent"
                asChild={true}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-zinc-500" />
                    <span className="truncate text-xs text-zinc-400">
                      {file}
                    </span>
                  </div>
                  <Trash
                    className="h-4 w-4 text-zinc-500 cursor-pointer hover:text-red-500"
                    onClick={() => handleDelete(file)}
                  />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
