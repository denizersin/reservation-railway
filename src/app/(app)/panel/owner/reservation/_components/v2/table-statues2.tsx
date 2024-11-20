import { TRestaurantMeal, TRoomWithTranslations } from '@/server/db/schema'
import { api } from '@/server/trpc/react'
import React, { useMemo } from 'react'
import { TableStatuesRowCard } from './table-statues-row-card'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { TTableStatuesRow } from '@/lib/reservation'

type Props = {
    selectedTableId: number | undefined
    setSelectedTableId: (id: number | undefined) => void,
    date: Date
    selectedRoom: TRoomWithTranslations
    selectedMeal: TRestaurantMeal,
    selectedHour: string | undefined,
    setSelectedHour: (hour: string | undefined) => void
    guestCount: number
    setGuestCount: (count: number) => void
}

export const TableStatues2 = ({
    date,
    selectedRoom,
    selectedMeal,
    selectedHour,
    guestCount,
    setGuestCount,
    selectedTableId,
    setSelectedTableId,
    setSelectedHour,

}: Props) => {


    const queryDate = useMemo(() => {
        const newDate = new Date(date)
        newDate.setHours(0, 0, 0, 0)
        return newDate.toISOString()
    }, [date])

    const { data: avaliableTablesData } = api.reservation.getTableStatues.useQuery({
        date: queryDate,
        mealId: selectedMeal.mealId,
    }, {
        enabled: [date, selectedMeal, selectedRoom].every(Boolean),
        staleTime: 0
    })

    const { data: mealHours } = api.restaurant.getRestaurantMealHours.useQuery({
        // mealId: selectedMeal.id,

    }, {
        select: (data) => data.find((d) => d.meal.id === selectedMeal.mealId)?.mealHours
    })


    const currentTables = avaliableTablesData?.find((t) => t.roomId === selectedRoom.id)?.tables


    const onClcikTable = (row: TTableStatuesRow) => {
        setSelectedTableId(row.table?.id)
    }

    const selectedTable = useMemo(() => {
        return currentTables?.find((table) => table.table?.id === selectedTableId)?.table
    }, [selectedTableId, currentTables])
    
    return (
        <div>
            <div className='flex gap-x-2 my-2'>
                {
                    mealHours?.map((hour) => (
                        <div
                            onClick={() => setSelectedHour(hour.hour)}
                            key={hour.hour} className={cn('flex flex-col shadow-md p-2 rounded-md px-4 bg-secondary hover:bg-secondary/20 cursor-pointer', {
                                'bg-primary text-primary-foreground hover:bg-primary ': selectedHour === hour.hour
                            })}>
                            <h1>{hour.hour}</h1>
                        </div>
                    ))
                }
            </div>
            <div className='flex flex-wrap gap-x-2 gap-y-2'>
                {
                    currentTables?.map((data) =>
                        <TableStatuesRowCard
                            statusTableRow={data}
                            isSelected={selectedTableId === data.table?.id}
                            onClcikTable={onClcikTable}
                            disabled={Boolean(data?.reservation)}
                        />
                    )
                }
            </div>
            <div className='my-3'>
                <h1>Guest Count</h1>
                <div className='flex gap-x-4 items-center'>
                    <Input
                        type='number'
                        className='max-w-[300px]'
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                    />
                    {selectedTable && <div className='flex '>
                        {selectedTable.minCapacity} - {selectedTable.maxCapacity}
                    </div>}

                </div>
            </div>


        </div >
    )
}