import { Column, Table } from '@tanstack/react-table'
import { Button } from '@/components/custom/button'
import { cn } from '@/lib/utils'
import { existenceStatuses } from './data'
import { useTableContext } from './data-table'

interface DataTableExistenceStatusFilterProps<TData, TValue> {
    column?: Column<TData, TValue>
    table: Table<TData>
}

export function DataTableExistenceStatusFilter<TData, TValue>({
    column,
    table
}: DataTableExistenceStatusFilterProps<TData, TValue>) {
    const { data } = useTableContext()

    const existenceStatusColumn = table.getColumn('existence')

    const existenceStatusesWithCount = existenceStatuses.map(s => ({
        ...s,
        count: data.filter(r => r.reservationExistenceStatus.status === s.value).length
    }))

    const _existenceFilterValue = existenceStatusColumn?.getFilterValue() as string[] | undefined
    const existenceFilterValue = _existenceFilterValue?.[0]
    const isExistenceFiltered = _existenceFilterValue && _existenceFilterValue.length > 0

    console.log(existenceFilterValue, 'existenceFilterValue')
    console.log(_existenceFilterValue, '_existenceFilterValue')

    return (
        <div className='flex'>
            <Button
                className='rounded-none shadow-none'
                tooltip='All'
                variant={!isExistenceFiltered ? 'default' : 'outline'}
                onClick={() => {
                    existenceStatusColumn?.setFilterValue(undefined)
                }}>
                {data.length}
            </Button>

            {existenceStatusesWithCount.map(s => {
                const isSelected = existenceFilterValue === s.value
                return (
                    <Button
                        key={s.value}
                        className={cn('rounded-none shadow-none flex items-center gap-x-1', {
                            'text-white': isSelected
                        })}
                        tooltip={s.label}
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => {
                            existenceStatusColumn?.setFilterValue([s.value])
                        }}>
                        {s.count}
                        <s.icon className={cn('w-4 h-4', {
                            'text-white': isSelected
                        })} />
                    </Button>
                )
            })}
        </div>
    )
}
