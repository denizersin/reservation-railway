import { Button } from '@/components/custom/button'
import { cn } from '@/lib/utils'
import { TRestaurantMeal } from '@/server/db/schema/restaurant-assets'
import { TRoomWithTranslations } from '@/server/db/schema/room'
import { api, RouterOutputs } from '@/server/trpc/react'
import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card";
import { CircleCheck, Clock, Users } from 'lucide-react'
import { TooltipText } from '@/components/custom/tooltip-text'
import { Input } from '@/components/ui/input'

type HourTable = RouterOutputs['reservation']['getAllAvailableReservation']['result'][0]['table']
type AvaliableTableData = RouterOutputs['reservation']['getAllAvailableReservation']['result']

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

    const {
        data: avaliableTablesData,
        isLoading: isAvaliableTablesLoading

    } = api.reservation.getAllAvailableReservation.useQuery({
        date,
        mealId: selectedMeal.id,
        roomId: selectedRoom.id
    }, {
        enabled: [date, selectedMeal, selectedRoom].every(Boolean),
    })

    const [hourState, setHourState] = useState<{
        hour: string,
        avaliableTotalGuest: number,
        avaliableTables: HourTable[],
        avaliableDataHour: AvaliableTableData
    }[]>()


    useEffect(() => {
        if(isAvaliableTablesLoading) return
        
        if (selectedHour && mealHours && avaliableTablesData) {
            const newHourSatate: typeof hourState = []
            mealHours.forEach((hour) => {
                const roomTables = avaliableTablesData.result.filter(d => d.table?.roomId === selectedRoom.id)
                const hourTables = roomTables.filter(d => d.meal_hours?.hour === hour.hour)
                const avaliableTables = hourTables.filter(d => (!d.table?.isReachedLimit && !d.table?.isReserved)).map(r => r.table) ?? []
                const limitData = avaliableTablesData.limitedAvailableHoursInfo.find(d => (d.hour === hour.hour && d.room == selectedRoom.id))

                let avaliableTotalGuest = avaliableTables.reduce((acc, curr) => acc + curr?.avaliableGuestWithLimit!, 0)
                if (limitData) {
                    avaliableTotalGuest = avaliableTotalGuest > limitData.avaliableGuest ? limitData.avaliableGuest : avaliableTotalGuest
                } else {
                    avaliableTotalGuest = avaliableTablesData.limitations.find(d => (d.hour === hour.hour && d.roomId == selectedRoom.id))?.maxGuestCount || avaliableTotalGuest
                }
                newHourSatate.push({
                    hour: hour.hour,
                    avaliableTotalGuest,
                    avaliableTables,
                    avaliableDataHour: hourTables
                })
            })
            setHourState(newHourSatate)
        }
    }, [avaliableTablesData, mealHours, selectedHour])


    useEffect(() => {
        if (mealHours) {
            setSelectedHour(mealHours[0]?.hour!)
        }

    }, [mealHours])

    console.log(hourState, 'hh')

    const currTableData = useMemo(() => hourState?.find(r => r.hour == selectedHour)?.avaliableDataHour || [], [selectedHour, hourState])

    const currentHourSatate = useMemo(() => hourState?.find(r => r.hour == selectedHour), [selectedHour, hourState])


    const onClcikTable = (tableId: number) => {
        setSelectedTableId(tableId)
    }

    console.log(selectedTableId, 'selectedTableId')

    const selectedTable = useMemo(() => currTableData.find(d => d.table?.id === selectedTableId)?.table, [selectedTableId, currTableData])

    return (
        <div>
            <div className='flex gap-x-2'>
                {
                    hourState?.map((hour) => (
                        <div
                            onClick={() => setSelectedHour(hour.hour)}

                            key={hour.hour} className={cn('flex flex-col shadow-md p-2 rounded-md px-4 bg-secondary hover:bg-secondary/20 cursor-pointer', {
                                'bg-primary text-primary-foreground hover:bg-primary ': selectedHour === hour.hour
                            })}>
                            <h1>{hour.hour}</h1>
                            <h2> {hour.avaliableTotalGuest}</h2>

                        </div>
                    ))
                }
            </div>
            <div className='flex gap-x-2 my-2'>
                {currentHourSatate?.avaliableTables?.map((table) => {
                    if (!table) return null
                    return (
                        <div key={table.id} className='flex gap-x-1 items-center border p-1'>
                            <h1>{table.minCapacity} - {table.avaliableGuestWithLimit}</h1>
                            {
                                table.isAppliedLimit &&
                                <TooltipText
                                    infoIcon={true}
                                    infoIconColor='black' tooltip='limit applied'>
                                    <span className='line-through'>
                                        {table.maxCapacity}
                                    </span>
                                </TooltipText>
                            }
                        </div>
                    )
                })}
            </div>

            <div className='flex flex-wrap gap-x-2 gap-y-2'>
                {
                    currTableData.map((data) => {
                        if (!data.table) return;
                        const table = data.table
                        const { isReserved, isReachedLimit, isAppliedLimit } = table
                        const isAvailable = !isReserved && !isReachedLimit
                        const isSelected = selectedTableId === data.table?.id

                        return <Card
                            onClick={(() => isAvailable && onClcikTable(data.table?.id!))}
                            key={data.table?.id} className={cn(' size-[150px] relative', {
                                'bg-foreground text-background': isReserved,
                                'cursor-pointer hover:bg-muted': isAvailable,
                                'bg-gray-300': (!isAvailable && !isReserved),
                            })}>
                            <CardContent className="p-4 ">
                                <div className="text-xl font-bold">{data.table?.no}</div>
                                <div className="text-sm ">{data.table.isReserved ? 'ersin' : '-'}</div>
                                <div className="flex items-center text-xs mt-2">
                                    <Clock className="w-3 h-3 mr-1" /> {data.reservation?.hour}
                                </div>
                                <div className="flex items-center text-xs ">
                                    {isReserved && <div className='flex'>
                                        <Users className="w-3 h-3 mr-1" />
                                        {data.reservation?.guestCount}/{data.table?.avaliableGuestWithLimit}

                                    </div>}
                                    <div className='flex ml-auto'>
                                        {table.minCapacity} - {table.avaliableGuestWithLimit}
                                        {isReachedLimit && <TooltipText tooltip='limit reached'>
                                            <span className='line-through'>{table.maxCapacity}</span>
                                        </TooltipText>}
                                    </div>

                                </div>
                            </CardContent>

                            {
                                isSelected && <CircleCheck className='absolute top-0 right-0 h-6 w-6 text-background fill-foreground' />
                            }

                        </Card>
                    })
                }
            </div>
            <h1>Guest Count</h1>
            <div>{selectedTable?.minCapacity}-{selectedTable?.avaliableGuestWithLimit}</div>
            <Input
                type='number'
                className='max-w-[300px]'
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
            />

        </div >
    )
}