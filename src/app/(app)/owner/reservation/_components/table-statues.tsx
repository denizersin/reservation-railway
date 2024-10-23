import { TooltipText } from '@/components/custom/tooltip-text'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { groupTableStatues, TStatusTableRow } from '@/lib/reservation'
import { cn } from '@/lib/utils'
import { TRestaurantMeal } from '@/server/db/schema/restaurant-assets'
import { TRoomWithTranslations } from '@/server/db/schema/room'
import { api, RouterOutputs } from '@/server/trpc/react'
import { CircleCheck, Clock, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { StatusTableRowCard } from './status-table-row-card'


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

export const TableStatues = ({
    selectedTableId,
    setSelectedTableId,
    date,
    selectedRoom,
    selectedMeal,
    selectedHour,
    setSelectedHour,
    guestCount,
    setGuestCount
}: Props) => {


    const { data: mealHours } = api.restaurant.getRestaurantMealHours.useQuery({
        // mealId: selectedMeal.id,

    }, {
        select: (data) => data.find((d) => d.meal.id === selectedMeal.mealId)?.mealHours
    })
    const queryDate = useMemo(() => {
        const newDate = new Date(date)
        newDate.setHours(0, 0, 0, 0)
        return newDate.toISOString()
    }, [date])
    
    const { data: avaliableTablesData } = api.reservation.getAllAvailableReservation2.useQuery({
        date: queryDate,
        mealId: selectedMeal.mealId,
    }, {
        enabled: [date, selectedMeal, selectedRoom].every(Boolean)
    })



    const tableStatues = avaliableTablesData?.tableStatues
    const roomTableStatues = tableStatues?.find(r => r.roomId === selectedRoom?.id)
    const hourTables = roomTableStatues?.statues.find((hour) => hour.hour === selectedHour)?.tables

    useEffect(() => {
        if (mealHours) {
            setSelectedHour(mealHours[0]?.hour!)
        }

    }, [mealHours])




    const onClcikTable = (row: TStatusTableRow) => {
        setSelectedTableId(row.table?.id)
    }


    const selectedTable = useMemo(() => {
        return hourTables?.find((table) => table.table?.id === selectedTableId)?.table
    }, [selectedTableId, hourTables])


    useEffect(() => {
        if (avaliableTablesData?.tableStatues)
            groupTableStatues(tableStatues?.[0]?.statues[0]?.tables! ?? [])
    }, [avaliableTablesData?.tableStatues])


    return (
        <div>
            <div className='flex gap-x-2 my-2'>
                {
                    roomTableStatues?.statues?.map((hourStatus) => (
                        <div
                            onClick={() => setSelectedHour(hourStatus.hour)}

                            key={hourStatus.hour} className={cn('flex flex-col shadow-md p-2 rounded-md px-4 bg-secondary hover:bg-secondary/20 cursor-pointer', {
                                'bg-primary text-primary-foreground hover:bg-primary ': selectedHour === hourStatus.hour
                            })}>
                            <h1>{hourStatus.hour}</h1>
                            <h2> {hourStatus.limitationStatus?.avaliableGuest}</h2>

                        </div>
                    ))
                }
            </div>
            <div className='flex flex-wrap gap-x-2 gap-y-2'>
                {
                    hourTables?.map((data) =>
                        <StatusTableRowCard
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
                        {selectedTable.minCapacity} - {selectedTable.avaliableGuestWithLimit}
                        {selectedTable.isAppliedLimit && <TooltipText tooltip='limit reached'>
                            <span className='line-through'>{selectedTable.maxCapacity}</span>
                        </TooltipText>}
                    </div>}

                </div>
            </div>


        </div >
    )
}