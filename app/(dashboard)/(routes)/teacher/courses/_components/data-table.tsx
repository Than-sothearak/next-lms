"use client"
import { Button } from "@/components/ui/button"
import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Grip, PlusCircle } from "lucide-react"
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd"
import axios from "axios"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
    const router = useRouter()
    const [orderedData, setOrderedData] = React.useState(data)
    const [previousData, setPreviousData] = React.useState(data)
    if (data !== previousData) {
      setPreviousData(data)
      setOrderedData(data)
    }
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const table = useReactTable({
    data: orderedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Show the full list so a drag can move a course to any position.
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || sorting.length || columnFilters.length) return
    const reordered = Array.from(orderedData)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    setOrderedData(reordered)
    try {
      await axios.put("/api/course/reorder", {
        list: reordered.map((item, position) => ({
          _id: (item as { _id: string })._id,
          position,
        })),
      })
      toast.success("Course order updated")
      router.refresh()
    } catch {
      setOrderedData(data)
      toast.error("Could not update course order")
    }
  }

  return (
    <>
    <p className="mb-4 text-sm text-muted-foreground">
      Total courses: {orderedData.length}
    </p>
    <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Filter course..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      
      <Link href="/teacher/create">
      <Button>
      <PlusCircle className="w-4 h-4 mr-2"/>
        Create new course
      </Button>
      </Link>

      </div>
    <div className="rounded-md border">
      <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="courses" isDropDisabled={sorting.length > 0 || columnFilters.length > 0} direction="vertical">
      {(provided) => <div ref={provided.innerRef} {...provided.droppableProps}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              <TableHead className="w-24">Position</TableHead>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <Draggable key={row.id} draggableId={(row.original as { _id: string })._id} index={index}>
              {(dragProvided) => (
              <TableRow
                key={row.id}
                ref={dragProvided.innerRef}
                {...dragProvided.draggableProps}
                data-state={row.getIsSelected() && "selected"}
              >
                <TableCell className="w-24">
                  <div
                    {...dragProvided.dragHandleProps}
                    className="flex w-fit cursor-grab items-center gap-2 active:cursor-grabbing"
                    aria-label={`Drag course to reorder, position ${index + 1}`}
                    title="Drag to reorder"
                  >
                    <Grip className="h-4 w-4 text-muted-foreground" />
                    <span>{index + 1}</span>
                  </div>
                </TableCell>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              )}
              </Draggable>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
          {provided.placeholder}
        </TableBody>
      </Table>
      </div>}
      </Droppable>
      </DragDropContext>
    </div>
    <p className="text-xs text-muted-foreground">Drag rows to change course order. Clear sorting and filters to reorder.</p>
    </>
  )
}
