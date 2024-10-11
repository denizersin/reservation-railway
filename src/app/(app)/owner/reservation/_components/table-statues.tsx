import { TooltipText } from '@/components/custom/tooltip-text'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { TRestaurantMeal } from '@/server/db/schema/restaurant-assets'
import { TRoomWithTranslations } from '@/server/db/schema/room'
import { api, RouterOutputs } from '@/server/trpc/react'
import { CircleCheck, Clock, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

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

    const { data: avaliableTablesData } = api.reservation.getAllAvailableReservation.useQuery({
        date,
        mealId: selectedMeal.mealId,
    }, {
        enabled: [date, selectedMeal, selectedRoom].every(Boolean)
    })

    const [hourState, setHourState] = useState<{
        hour: string,
        avaliableTotalGuest: number,
        avaliableTables: HourTable[],
        avaliableDataHour: AvaliableTableData
    }[]>()

    useEffect(() => {
        if (!(selectedHour && mealHours && avaliableTablesData && selectedRoom)) return

        const newHourSatate: typeof hourState = []

        const currRoomTables = avaliableTablesData.result.filter(d => d.table?.roomId === selectedRoom.id)

        const currLimitations = avaliableTablesData.limitations.filter(d => d.roomId == selectedRoom.id && d.mealId == selectedMeal.mealId)

        const currAvaliableLimitedHours = avaliableTablesData.limitedAvailableHoursInfo.filter(d => d.room == selectedRoom.id && d.meal == selectedMeal.mealId)
        mealHours.forEach((hour) => {
            const hourTables = currRoomTables.filter(d => d.meal_hours?.hour === hour.hour)
            const avaliableTables = hourTables.filter(d => (!d.table?.isReachedLimit && !d.table?.isReserved)).map(r => r.table) ?? []
            const limitData = currAvaliableLimitedHours.find(d => (d.hour === hour.hour))

            let avaliableTotalGuest = avaliableTables.reduce((acc, curr) => acc + curr?.avaliableGuestWithLimit!, 0)

            if (limitData) {
                avaliableTotalGuest = avaliableTotalGuest > limitData.avaliableGuest ? limitData.avaliableGuest : avaliableTotalGuest
            } else {
                avaliableTotalGuest = currLimitations.find(d => (d.hour === hour.hour))?.maxGuestCount || avaliableTotalGuest
            }
            newHourSatate.push({
                hour: hour.hour,
                avaliableTotalGuest,
                avaliableTables,
                avaliableDataHour: hourTables
            })
        })
        setHourState(newHourSatate)


    }, [avaliableTablesData, mealHours, selectedHour, selectedRoom])


    useEffect(() => {
        if (mealHours) {
            setSelectedHour(mealHours[0]?.hour!)
        }

    }, [mealHours])


    const currTableData = useMemo(() => hourState?.find(r => r.hour == selectedHour)?.avaliableDataHour || [], [selectedHour, hourState])


    const onClcikTable = (tableId: number) => {
        setSelectedTableId(tableId)
    }


    const selectedTable = useMemo(() => currTableData.find(d => d.table?.id === selectedTableId)?.table, [selectedTableId, currTableData])


    console.log(avaliableTablesData,'data')


    return (
        <div>
            <div className='flex gap-x-2 my-2'>
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
            <div className='flex flex-wrap gap-x-2 gap-y-2'>
                {
                    currTableData.map((data) => {
                        if (!data.table) return;
                        const table = data.table
                        const { isReserved, isReachedLimit, isAppliedLimit } = table
                        const isAvailable = !isReserved && !isReachedLimit
                        const isSelected = selectedTableId === data.table?.id

                        return <Card
                            onClick={(() => !isReserved && onClcikTable(data.table?.id!))}
                            key={data.table?.id} className={cn(' size-[150px] relative', {
                                'bg-foreground text-background': isReserved,
                                'cursor-pointer hover:bg-muted': isAvailable,
                                'bg-gray-300 cursor-pointer hover:bg-muted': (!isAvailable && !isReserved),
                            })}>
                            <CardContent className="p-4 flex flex-col gap-y-1">
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
                                        {isAppliedLimit && <TooltipText infoIcon  tooltip='limit applied'>
                                            <span className='line-through ml-1'>{table.maxCapacity}</span>
                                        </TooltipText>}
                                    </div>

                                </div>
                                {(!isReserved && isReachedLimit) && <div className="flex justify-end">
                                    <Badge className='text-[9px] p-[.5px] px-1 bg-primary-foreground text-primary'>exceeding limit</Badge>
                                </div>}
                            </CardContent>

                            {
                                isSelected && <CircleCheck className='absolute top-0 right-0 h-6 w-6 text-background fill-foreground' />
                            }

                        </Card>
                    })
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