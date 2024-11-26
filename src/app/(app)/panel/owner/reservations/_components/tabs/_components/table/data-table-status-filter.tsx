import { Column, Table } from '@tanstack/react-table'

import { Button } from '@/components/custom/button'
import { cn } from '@/lib/utils'
import { statuses } from './data'
import { useTableContext } from './data-table'

interface DataTableStatusFilterProps<TData, TValue> {
    column?: Column<TData, TValue>
    table: Table<TData>


}

export function DataTableStatusFilter<TData, TValue>({
    column,
    table
}: DataTableStatusFilterProps<TData, TValue>) {

    const { data } = useTableContext()

    const statusColumn = table.getColumn('status')
    const existenceStatusColumn = table.getColumn('existence')
    const prepaymentStatusColumn = table.getColumn('prepaymentStatus')

    const statusesWithCount = statuses.map(s => ({
        ...s,
        count: data.filter(r => r.reservationStatus.status === s.value).length
    }))

    const _statusFilterValue = statusColumn?.getFilterValue() as string[] | undefined
    const statusFilterValue = _statusFilterValue?.[0]
    const isStatusFiltered = _statusFilterValue && _statusFilterValue.length > 0
    // column?.column

    console.log(statusFilterValue, 'statusFilterValue')
    console.log(_statusFilterValue, '_statusFilterValue')

    return (
        <div className='flex'>
            <Button
                className='rounded-none shadow-none px-3'
                tooltip='All'
                variant={!isStatusFiltered ? 'default' : 'outline'}
                onClick={() => {
                    statusColumn?.setFilterValue(undefined)
                }}>

                {data.length}
            </Button>

            {
                statusesWithCount.map(s => {
                    const isSelected = statusFilterValue === s.value
                    return (
                        <Button
                            className={cn('rounded-none shadow-none flex items-center gap-x-1 px-3', {
                                'text-white': isSelected
                            })}
                            tooltip={s.label}
                            variant={isSelected ? 'default' : 'outline'}
                            onClick={() => {
                                statusColumn?.setFilterValue([s.value])
                            }}>
                            {/* {s.renderIcon()} */}
                            <s.icon className={cn('w-4 h-4', {
                                'text-white': isSelected
                            })} />
                            {s.count}

                        </Button>
                    )
                })
            }


            <div>
            </div>
        </div>
    )
}
