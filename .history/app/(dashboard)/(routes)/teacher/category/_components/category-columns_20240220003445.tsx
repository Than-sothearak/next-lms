"use client";
import mongoose, { Document } from "mongoose";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import axios from "axios";
import toast from "react-hot-toast";
import { error } from "console";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface CourseDocument extends Document {
  _id: string;
  name: string;
}

const onDelete = async (categoryId: string) => {
  try {
    await axios.delete(`/api/category/${categoryId}`);
    toast.success("Category deleted");
  } catch {
    toast.error("Someting went wrong");
  }
};

export const categoryColumns: ColumnDef<CourseDocument>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const { _id } = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ConfirmModal onConfirm={() => onDelete(_id)}>
            <Button
              variant="ghost"
              className="h-4 w-4 p-0"
            >
              <Trash />
            </Button>
            </ConfirmModal>
         
          </DropdownMenuTrigger>
        </DropdownMenu>
      );
    },
  },
];
