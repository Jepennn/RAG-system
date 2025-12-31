"use client";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { deleteAllFiles } from "@/lib/slices/filesSlice";
import { toast } from "sonner";
import { MoreHorizontalIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DropdownMenuDialog() {
  const dispatch = useDispatch<AppDispatch>();

  async function handleDeleteAll() {
    try {
      await dispatch(deleteAllFiles()).unwrap();
      toast.success("All files deleted");
    } catch (error) {
      toast.error("Failed deleting all files");
    }
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <MoreHorizontalIcon className="cursor-pointer text-zinc-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={handleDeleteAll}
              className="cursor-pointer"
            >
              Delete all files
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
