"use client"
import mongoose, { Document } from 'mongoose';
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"


import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

  interface CourseDocument extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
  }

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
        )
      },
  },

 
  {
    id: "actions",
    cell:({row}) => {
        const { _id } = row.original;
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-4 w-4 p-0">
                     <span className="sr-only">Open </span>
                     <Trash />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                   <Link href={`/teacher/courses/${_id}`}>
                   <DropdownMenuItem>
                    <Pencil className="h-4 w-4 mr-2"/>
                    Edit
                   </DropdownMenuItem>
                   </Link>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
  }
]
