"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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

  if (loading)
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="animate-spin h-4 w-4 text-zinc-500" />
      </div>
    );
  if (files.length === 0) return null;

  return (
    <SidebarGroup className="animate-in fade-in duration-500">
      <SidebarGroupLabel>Uploaded files</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {files.map((file) => (
            <SidebarMenuItem key={file}>
              <SidebarMenuButton className="py-0 h-8">
                <FileText className="h-4 w-4 text-zinc-500" />
                <span className="truncate text-xs text-zinc-400">{file}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
