import { Card, CardContent } from "@/components/ui/card"
import { useMemo, useState } from 'react'
import { TTable } from '@/server/db/schema'
import { api } from '@/server/trpc/react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TReservationWaitingTableRow } from "@/lib/reservation"
import { HourTabs } from "@/components/hour-tabs"
import { EnumMealNumeric, EnumTableShape } from "@/shared/enums/predefined-enums"
import ReactGridLayout, { Layout } from 'react-grid-layout'

export type TWaitingTable = TTable & {
    reservedTableRow?: TReservationWaitingTableRow
}

type WaitingTableStatus = {
    hour: string,
    tables: TWaitingTable[]
}[]

export const WaitingTableStatus = () => {
    const [selectedHour, setSelectedHour] = useState<string | undefined>(undefined)
    const { data: waitingTables, isLoading: isLoadingWaitingTables } = api.reservation.getWaitingTables.useQuery()
    const { data: roomsData } = api.room.getRooms.useQuery({ withWaitingRooms: true })


    const waitingRoom = useMemo(() => {
        return roomsData?.find(r => r.isWaitingRoom)
    }, [roomsData])

    const queryDate = useMemo(() => {
        const date = new Date()
        date.setHours(0, 0, 0, 0)
        return date.toISOString()
    }, [])

    const { data: reservedWaitingTables } = api.reservation.getReservationWaitingTables.useQuery({
        date: queryDate,
    })

    const { data } = api.restaurant.getRestaurantMealHours.useQuery({ mealId: 1 })

    const hours = data?.[0]?.mealHours?.map(r => r.hour) || []

    const waitinTableStatus: WaitingTableStatus = useMemo(() => {
        return hours.map(h => {
            const tables: TWaitingTable[] = waitingTables?.map(rt => {
                return {
                    ...rt,
                    reservedTableRow: reservedWaitingTables?.find(r =>
                        r.waitingSession?.tables.find(t => t.tableId === rt.id) &&
                        r.hour === h
                    )
                }
            }) || []

            return {
                hour: h,
                tables
            }
        })
    }, [waitingTables, reservedWaitingTables, hours])

    const selectedHourTables = useMemo(() => {
        return waitinTableStatus.find(status => status.hour === selectedHour)?.tables || []
    }, [waitinTableStatus, selectedHour])

    const gridLayout = useMemo(() => {
        return selectedHourTables.map(table => ({
            h: table.h!,
            i: table.id.toString(),
            w: table.w!,
            x: table.x!,
            y: table.y!,
            shape: table.shape,
            tableId: table.id
        }))
    }, [selectedHourTables])

    const { layoutRowHeight = 100, layoutWidth = 800 } = waitingRoom || {}
    const cols = Math.round(layoutWidth / (layoutRowHeight + (layoutRowHeight * 0.2)))

    return (
        <div className='max-w-full overflow-auto'>
            <HourTabs
                selectedMealId={EnumMealNumeric.dinner}
                selectedHour={selectedHour}
                setHour={setSelectedHour}
            />
            {selectedHour && (
                <div className="mt-4">
                    <ReactGridLayout
                        className="layout border-black border-2 py-4"
                        layout={gridLayout}
                        cols={cols}
                        rowHeight={layoutRowHeight}
                        width={layoutWidth}
                        style={{
                            minHeight: 600
                        }}
                        verticalCompact={false}
                        compactType={null}
                        preventCollision={true}
                        isDraggable={false}
                        isResizable={false}
                    >
                        {selectedHourTables.map((table) => {
                            const tableReservation = table.reservedTableRow
                            return (
                                <div
                                    key={table.id.toString()}
                                    className={cn('border flex items-center justify-center', {
                                        'rounded-full': table.shape === EnumTableShape.round,
                                    })}
                                >
                                    <Card
                                        className={cn('w-full h-full', {
                                            "bg-primary text-primary-foreground": tableReservation,
                                        })}>
                                        <CardContent className="p-4 flex flex-col gap-y-1">
                                            <div className="r r1 flex justify-between">
                                                <div className="text-xl font-bold">{table.no}</div>
                                            </div>
                                            <div className="text-sm flex">
                                                <div>{tableReservation?.guest?.name || '-'}</div>
                                            </div>
                                            <div className="flex items-center text-xs mt-2">
                                                <Clock className="w-3 h-3 mr-1" /> {tableReservation?.hour}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })}
                    </ReactGridLayout>
                </div>
            )}
        </div>
    )
}