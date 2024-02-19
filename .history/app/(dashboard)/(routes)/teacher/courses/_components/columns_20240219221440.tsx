"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Course } from "@/models/Course"

export const columns: ColumnDef<typeof Course>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
]
