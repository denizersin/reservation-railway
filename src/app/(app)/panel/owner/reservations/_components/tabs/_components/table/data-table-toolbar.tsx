import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'

import { Button } from '@/components/custom/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'

import { priorities, statuses } from './data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableStatusFilter } from './data-table-status-filter'
import { DataTableExistenceStatusFilter } from './data-table-existence-status'
import { LocalNameFilter } from './local-name-filter'
import { useSearchParams } from 'next/navigation'
import { useUpdateQueryParams } from '@/hooks/useUpdateQueryParams'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const globalFilter = useSearchParams().get('globalFilter') || ''

  const updateQueryParam = useUpdateQueryParams({ replace: true })

  const reset = () => {
    table.resetColumnFilters()
    updateQueryParam({ globalFilter: '' })
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2 flex-wrap'>
        <div className='flex gap-x-2'>
          {/* {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title='Status'
              options={statuses}
              table={table}
            />
          )} */}
        </div>

        <DataTableStatusFilter

          table={table} />

        <DataTableExistenceStatusFilter
          table={table} />

        <div className='w-[200px]'>
          <LocalNameFilter />
        </div>



        {(isFiltered || globalFilter) && (
          <Button
            variant='ghost'
            onClick={reset}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
