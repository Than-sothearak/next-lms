"use client"
import mongoose, { Document } from 'mongoose';
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react"
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

export const columns: ColumnDef<CourseDocument>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            CreatedAt
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },
  {
    accessorKey: "title",
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
    accessorKey: "price",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({row}) => {
        const price = parseFloat(row.getValue("price")) || 0;
        const format = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(price);
        return <div>{format}</div>
      }
   
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Published
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({row}) => {
        const isPublished = row.getValue("isPublished") || false;
        return (
            <Badge className={cn(
                "bg-slate-500",
                isPublished && "bg-blue-700"
            )}>
                {isPublished ? "Published" : "Draft"}
            </Badge>
        )
      }
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
                     <MoreHorizontal />
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
