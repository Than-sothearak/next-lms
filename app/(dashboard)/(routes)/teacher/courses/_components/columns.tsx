"use client"
import mongoose from 'mongoose';
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

  interface CourseDocument {
    _id: mongoose.Types.ObjectId;
    title: string;
    createdAt?: string;
    isPublished: boolean;
    lessonCount: number;
  }

export const columns: ColumnDef<CourseDocument>[] = [

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
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const value = row.getValue<string | null>("createdAt");
      const date = value ? new Date(value) : null;

      if (!date || Number.isNaN(date.getTime())) return "—";

      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
    },
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },
  {
    accessorKey: "lessonCount",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Lessons
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({row}) => {
        const lessonCount = Number(row.getValue("lessonCount")) || 0;
        return <div>{lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}</div>
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
