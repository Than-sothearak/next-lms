"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Course } from "@/models/Course"

export const columns: ColumnDef<typeof Course>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "isPublished",
    header: "Published",
  },
]
