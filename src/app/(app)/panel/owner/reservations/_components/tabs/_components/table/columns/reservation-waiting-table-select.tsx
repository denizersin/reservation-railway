import { Button } from '@/components/custom/button'
import { Card, CardContent } from "@/components/ui/card"
import { useMutationCallback } from '@/hooks/useMutationCallback'
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal'
import { TReservationRow, TReservationWaitingTableRow } from '@/lib/reservation'
import { cn } from '@/lib/utils'
import { TTable } from '@/server/db/schema'
import { api } from '@/server/trpc/react'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { Clock } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ReactGridLayout from 'react-grid-layout'
import { EnumTableShape } from '@/shared/enums/predefined-enums'
import { HourTabs } from '@/components/hour-tabs'
import { useStartOfDay } from '@/hooks/useStartOfDay'

type Props = {
    reservation: TReservationRow,
}

export type TWaitingTable = TTable & {
    reservedTableRow?: TReservationWaitingTableRow
}

export const ReservationWaitingTableSelect = ({
    reservation,
}: Props) => {

    const [selectedHour, setSelectedHour] = useState(reservation.hour)



    const { data: waitingTables,isLoading:isLoadingWaitingTables } = api.reservation.getWaitingTables.useQuery()




    const queryDate = useStartOfDay(reservation.reservationDate)


    const { data: reservedWaitingTables } = api.reservation.getReservationWaitingTables.useQuery({
        date: queryDate,
    })




    const { data: roomsData } = api.room.getRooms.useQuery({ withWaitingRooms: true })

    const waitingRoom = useMemo(() => {
        return roomsData?.find(r => r.isWaitingRoom)
    }, [roomsData])

    const thisTableStatues = useMemo(() => {
        if (!waitingTables || !reservedWaitingTables) return []
        
        const hourReservations = reservedWaitingTables.filter(r => r.hour === selectedHour)
        
        return waitingTables.map(rt => ({
            ...rt,
            reservedTableRow: hourReservations.find(r =>
                r.waitingSession?.tables.find(t => t.tableId === rt.id)
            )
        }))
    }, [waitingTables, reservedWaitingTables, selectedHour])



    const currentReservationTable = useMemo(() => {
        return reservedWaitingTables?.find(r => r.id === reservation.id)
    }, [reservedWaitingTables])

    const [selectedTables, setSelectedTables] = useState<number[]>()



    useEffect(() => {
        if (!currentReservationTable) return
        const selectedTableIds = currentReservationTable.waitingSession?.tables.map(t => t.tableId)
        setSelectedTables(selectedTableIds || [])
    }, [currentReservationTable,reservedWaitingTables])

    const queryClient=useQueryClient();

    const { onSuccessReservationUpdate } = useMutationCallback()

    const baseMutationOptions = {
        onSuccess: () => {
            onSuccessReservationUpdate(reservation.id)
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getReservationWaitingTables, {
                    date: queryDate
                })
            })
        }
    }

    const {
        mutate: createReservationWaitingSession,
        isPending: createReservationWaitingSessionPending
    } = api.reservation.createReservationWaitingSession.useMutation(baseMutationOptions)

    const {
        mutate: updateReservationWaitingSession,
        isPending: updateReservationWaitingSessionPending
    } = api.reservation.updateReservationWaitingSession.useMutation(baseMutationOptions)

    function onUpdate() {

        if (currentReservationTable?.waitingSession?.tables) {
            updateReservationWaitingSession({
                reservationId: reservation.id,
                tableIds: selectedTables || []
            })
        } else {
            createReservationWaitingSession({
                reservationId: reservation.id,
                tableIds: selectedTables || []
            })
        }

    }

    useShowLoadingModal([updateReservationWaitingSessionPending, createReservationWaitingSessionPending,isLoadingWaitingTables])

    const gridLayout = useMemo(() => {
        return thisTableStatues.map(table => ({
            h: table.h!,
            i: table.id.toString(),
            w: table.w!,
            x: table.x!,
            y: table.y!,
            shape: table.shape,
            tableId: table.id
        }))
    }, [thisTableStatues])

    const { layoutRowHeight = 100, layoutWidth = 800 } = waitingRoom || {}
    const cols = Math.round(layoutWidth / (layoutRowHeight + (layoutRowHeight * 0.2)))


    return (
        <div className='max-w-full overflow-auto'>
            <Button
                className='my-1'
                onClick={onUpdate}
                disabled={selectedHour !== reservation.hour}
            >
                Update Waiting Tables
            </Button>

            <HourTabs
                selectedHour={selectedHour}
                setHour={setSelectedHour}
                selectedMealId={reservation.mealId}
            />

            <ReactGridLayout
                className="layout border-black border-2 py-4 mt-4"
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
                {thisTableStatues.map((table) => {
                    const isOtherSelected = table.reservedTableRow && (
                        table.reservedTableRow.id !== reservation.id
                    )
                    const isWrongHour = selectedHour !== reservation.hour
                    const isThisSelected = !isOtherSelected && selectedTables?.includes(table.id) && selectedHour === reservation.hour
                    const isThisDeSelected = currentReservationTable?.waitingSession?.tables.find(t => t.tableId === table.id) && !selectedTables?.includes(table.id)

                    return (
                        <div
                            key={table.id.toString()}
                            className={cn('border', {
                                'rounded-full': table.shape === EnumTableShape.round,
                                'cursor-not-allowed': isOtherSelected || isWrongHour
                            })}
                            onClick={() => {
                                if (isOtherSelected || isWrongHour) return
                                
                                if (selectedTables?.includes(table.id)) {
                                    setSelectedTables(selectedTables?.filter(t => t !== table.id))
                                } else {
                                    setSelectedTables([...selectedTables || [], table.id])
                                }
                            }}
                        >
                            <Card className={cn('w-full h-full', {
                                'bg-primary text-primary-foreground': isThisSelected,
                                "bg-secondary text-secondary-foreground": isOtherSelected,
                                "border-2 border-black": isThisDeSelected,
                                "opacity-50": isWrongHour
                            })}>
                                <CardContent className="p-4 flex flex-col gap-y-1">
                                    <div className="r r1 flex justify-between">
                                        <div className="text-xl font-bold">{table.no}</div>
                                    </div>
                                    <div className="text-sm flex">
                                        <div>{table.reservedTableRow?.guest?.name || '-'}</div>
                                    </div>
                                    <div className="flex items-center text-xs mt-2">
                                        <Clock className="w-3 h-3 mr-1" /> {table.reservedTableRow?.hour}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </ReactGridLayout>
        </div>
    )
}