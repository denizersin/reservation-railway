import { Input } from '@/components/ui/input'
import { TTableStatuesRow } from '@/lib/reservation'
import { cn, groupByWithKeyFn } from '@/lib/utils'
import { api } from '@/server/trpc/react'
import { useMemo } from 'react'
import { TableStatuesRowCard } from './table-statues-row-card'
import { useStartOfDay } from '@/hooks/useStartOfDay'

type Props = {
    selectedTableId: number | undefined
    setSelectedTableId: (id: number | undefined) => void,
    date: Date
    selectedRoomId: number | undefined
    selectedMealId: number | undefined,
    selectedHour: string | undefined,
    setSelectedHour: (hour: string | undefined) => void
    guestCount: number
    setGuestCount: (count: number) => void
    isDateDisabled?: boolean
}

export const TableStatues2 = ({
    date,
    selectedRoomId,
    selectedMealId,
    selectedHour,
    guestCount,
    setGuestCount,
    selectedTableId,
    setSelectedTableId,
    setSelectedHour,

}: Props) => {


    const queryDate = useStartOfDay(date)

    const { data: avaliableTablesData } = api.reservation.getTableStatues.useQuery({
        date: queryDate,
        mealId: selectedMealId!,
    }, {
        enabled: [date, selectedMealId, selectedRoomId].every(Boolean),
        staleTime: 0
    })

    const { data: mealHours } = api.restaurant.getRestaurantMealHours.useQuery({
        mealId: selectedMealId!,

    }, {
        select: (data) => data.find((d) => d.meal.id === selectedMealId)?.mealHours,
        enabled: Boolean(selectedMealId)
    })

    const roomHourStatusMap = useMemo(() => {
        type RoomsHourStatusMapKey = string
        type RoomsHourStatusMapValue = {
            roomId: number
            hourStautes: {
                hour: string,
                guestCounts: number[]
            }[]
        }
        const roomHourStatusMap: Record<RoomsHourStatusMapKey, RoomsHourStatusMapValue> = {}

        avaliableTablesData?.forEach((roomRecord) => {
            const hoorMap: Record<string, number[]> = {}
            Object.values(groupByWithKeyFn(roomRecord.tables, (trecord) => trecord.reservation?.id))
                .forEach((tableRecord) => {
                    const reservation = tableRecord[0]?.reservation
                    if (!reservation) return

                    const hour = reservation?.hour!
                    const guestCount = reservation?.guestCount!
                    if (!hoorMap[hour]) {
                        hoorMap[hour] = []
                    }
                    hoorMap[hour].push(guestCount)
                })

            roomHourStatusMap[roomRecord.roomId] = {
                roomId: roomRecord.roomId,
                hourStautes: Object.entries(hoorMap).map(([hour, guestCounts]) => ({
                    hour,
                    guestCounts
                }))
            }
        })
        return roomHourStatusMap

    }, [avaliableTablesData])

    const currentHourGuestCounts = useMemo(() => {
        return (roomHourStatusMap[selectedRoomId!]?.hourStautes.find((h) => h.hour === selectedHour)?.guestCounts || []).join(', ') || '0'

    }, [roomHourStatusMap, selectedRoomId, selectedHour])

    console.log(currentHourGuestCounts, 'currentHourGuestCounts')

    const currentTables = avaliableTablesData?.find((t) => t.roomId === selectedRoomId)?.tables


    const onClcikTable = (row: TTableStatuesRow) => {
        setSelectedTableId(row.table?.id)
    }

    const selectedTable = useMemo(() => {
        return currentTables?.find((table) => table.table?.id === selectedTableId)?.table
    }, [selectedTableId, currentTables])
    console.log(mealHours, 'mealHours')
    return (
        <div>
            <div className='flex gap-x-2 my-2'>
                {
                    mealHours?.map((hour) => (
                        <div className=' flex flex-col items-center  min-h-[50px] '>
                            <div
                                onClick={() => setSelectedHour(hour.hour)}
                                key={hour.hour} className={cn('flex flex-col shadow-md p-2 rounded-md px-4 bg-secondary hover:bg-secondary/20 cursor-pointer', {
                                    'bg-primary text-primary-foreground hover:bg-primary ': selectedHour === hour.hour
                                })}>
                                <h1>{hour.hour}</h1>

                            </div>

                            <div className={cn('text-sm', {
                                'opacity-0': selectedHour !== hour.hour
                            })}>{selectedHour === hour.hour ? currentHourGuestCounts:0}</div>

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
                <div className='flex gap-x-4 items-center'>
                    <div className="flex gap-2">
                        {Array.from({length: 8}, (_, i) => i + 1).map((num) => (
                            <div
                                key={num}
                                onClick={() => setGuestCount(num)}
                                className={cn(
                                    'w-10 h-10 flex items-center justify-center rounded-md cursor-pointer hover:opacity-80',
                                    {
                                        'bg-primary text-primary-foreground': guestCount === num,
                                        'bg-secondary': guestCount !== num
                                    }
                                )}
                            >
                                {num}
                            </div>
                        ))}
                    </div>
                    {selectedTable && <div className='flex '>
                        {selectedTable.minCapacity} - {selectedTable.maxCapacity}
                    </div>}

                </div>
            </div>


        </div >
    )
}