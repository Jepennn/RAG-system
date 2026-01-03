"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchFiles, deleteFile } from "@/lib/slices/filesSlice";
import { DropdownMenuDialog } from "./dot-dropdown";

import { toast } from "sonner";
import { FileText, Loader2, Trash, FileX, Plus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { addFileName } from "@/lib/slices/chatSlice";

export function FileList() {
  const dispatch = useDispatch<AppDispatch>();

  const { items: files, loading } = useSelector((state: RootState) => state.files);
  const { file_names } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  function handleAddFile(file: string) {
    if (file_names.includes(file)) {
      toast.error(`${file} already added`);
      return;
    } else {
      dispatch(addFileName(file));
    }
  }

  async function handleDelete(file: string) {
    try {
      await dispatch(deleteFile(file)).unwrap();
      toast.success(`${file} removed`);
    } catch (error) {
      toast.error("Failed to delete file");
    }
  }

  if (loading && files.length === 0)
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="animate-spin h-4 w-4 text-zinc-500" />
      </div>
    );

  if (files.length === 0) {
    return (
      <div className="flex justify-center items-center">
        <SidebarGroupLabel className="gap-2">
          <FileX />
          No uploaded files
        </SidebarGroupLabel>
      </div>
    );
  }

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
              <SidebarMenuButton className="py-0 h-8 hover:bg-transparent" asChild>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Plus
                      onClick={() => handleAddFile(file)}
                      size={16}
                      className="text-white cursor-pointer hover:text-blue-500"
                    />
                    <FileText size={16} className=" text-zinc-500" />
                    <span className="truncate text-xs text-zinc-400">{file}</span>
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
