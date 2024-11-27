import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import { api } from '@/server/trpc/react'
import { reservationColumns } from './columns/columns'
import { TReservationRow } from '@/lib/reservation'
import { useReservationsContext } from '../../../../page'
import { cn } from '@/lib/utils'
import { EnumMealNumeric, EnumPrepaymentStatus, EnumReservationExistanceStatus, EnumReservationStatus } from '@/shared/enums/predefined-enums'


type TTableContext = {
  data: TReservationRow[]
}



const TableContext = React.createContext<TTableContext>({} as TTableContext)


export function useTableContext() {
  return React.useContext(TableContext)
}


export function ReservationDataTable({
}: {

  }) {



  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])



  const { queryDate, reservationsData } = useReservationsContext()

 




  const table = useReactTable<TReservationRow>({
      data: reservationsData,
      columns: reservationColumns,
      state: {
        sorting,
        columnVisibility,
        rowSelection,
        columnFilters,
      },
      enableRowSelection: true,
      rowCount: reservationsData.length,
      manualPagination: true,


      onRowSelectionChange: setRowSelection,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,


      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
    })

  console.log(table.getState().columnFilters, 'filters')
  // console.log(data, 'asd')

  return(
    <TableContext.Provider value={{ data: reservationsData }}>
  <div className='space-y-4 mt-4'>
    <DataTableToolbar table={table} />
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} colSpan={header.colSpan}>
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
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={cn({
                    'bg-orange-300': cell.row.original.holdedAt
                  })}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={reservationColumns.length}
                className='h-24 text-center'
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    {/* <DataTablePagination table={table} /> */}
  </div>
    </TableContext.Provider >

  )
}
