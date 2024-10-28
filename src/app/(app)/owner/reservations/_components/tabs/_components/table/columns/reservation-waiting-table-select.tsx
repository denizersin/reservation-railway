import { TStatusTableRow, TReservationWaitingTableRow, TReservationRow } from '@/lib/reservation'
import { TReservation, TTable } from '@/server/db/schema'
import { api } from '@/server/trpc/react'
import { CircleCheck, Clock } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from '@/lib/utils'
import { TSelctionWaitingState } from './reservation-grid-status-modal'
import { table } from 'console'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal'
import { Button } from '@/components/custom/button'

type Props = {
    reservation: TReservationRow,
    selectionWaitingState: TSelctionWaitingState,
    setselectionWaitingState: (state: TSelctionWaitingState) => void
}

export type TWaitingTable = TTable & {
    reservedTableRow?: TReservationWaitingTableRow
}

// TReservationWaitingTableRow
type WaitingTableStatus = {
    hour: string,
    tables: TWaitingTable[]
}[]

export const ReservationWaitingTableSelect = ({
    reservation,
    selectionWaitingState,
    setselectionWaitingState
}: Props) => {


    const { data } = api.restaurant.getRestaurantMealHours.useQuery({ mealId: reservation.mealId })

    const hours = data?.[0]?.mealHours?.map(r => r.hour) || []

    const { data: waitingTables } = api.reservation.getWaitingTables.useQuery()

    const reservationHour = reservation.hour


    const queryDate = useMemo(() => {
        const date = new Date(reservation.reservationDate)
        date.setHours(0, 0, 0, 0)
        return date.toISOString()
    }, [reservation.reservationDate])


    const { data: reservedWaitingTables } = api.reservation.getReservationWaitingTables.useQuery({
        date: queryDate,
    })




    const [thisTableStatues, otherTableStatues] = useMemo(() => {

        const waitinTableStatus: WaitingTableStatus = []

        hours.forEach(h => {

            const tables: TWaitingTable[] = waitingTables?.map(rt => {
                return {
                    ...rt,
                    reservedTableRow: reservedWaitingTables?.find(r =>
                        r.waitingSession?.tables.find(t => t.tableId === rt.id) &&
                        r.hour === h
                    )
                }
            }) || []

            waitinTableStatus.push({
                hour: h,
                tables
            })

        })

        const thisTableStatusData = waitinTableStatus.find(r => r.hour === reservationHour)
        const otherTableStatusData = waitinTableStatus.filter(r => r.hour !== reservationHour)
        return [thisTableStatusData, otherTableStatusData]

    }, [waitingTables, reservedWaitingTables])



    const currentReservationTable = useMemo(() => {
        return reservedWaitingTables?.find(r => r.id === reservation.id)
    }, [reservedWaitingTables])

    const [selectedTables, setSelectedTables] = useState<number[]>()


    console.log(currentReservationTable, 'currentReservationTable')

    useEffect(() => {
        if (!currentReservationTable) return
        const selectedTableIds = currentReservationTable.waitingSession?.tables.map(t => t.tableId)
        setSelectedTables(selectedTableIds || [])
    }, [currentReservationTable,reservedWaitingTables])

    const queryClient = useQueryClient();

    const baseMutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getReservationWaitingTables)
            })
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getReservations)
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

    useShowLoadingModal([updateReservationWaitingSessionPending, createReservationWaitingSessionPending])

    console.log(thisTableStatues, 'thisTableStatues')
    console.log(otherTableStatues, 'otherTableStatues')
    console.log(currentReservationTable, 'currentReservationTable')
    return (
        <div className='max-w-full overflow-auto'>

            <Button
                onClick={onUpdate}
            >
                Update
            </Button>

            <div className='text-lg font-bold'>{reservation.hour}</div>

            <div className='flex gap-x-3 max-w-full overflow-x-auto py-4  border-y-2 border-black'>

                {
                    thisTableStatues?.tables.map((table, i) => {

                        const isOtherSelected = table.reservedTableRow && table.reservedTableRow.id !== reservation.id

                        const isThisSelected = !isOtherSelected && selectedTables?.includes(table.id)

                        const tableReservation = table.reservedTableRow
                        const isThisDeSelected=currentReservationTable?.waitingSession?.tables.find(t=>t.tableId===table.id) && !selectedTables?.includes(table.id)

                        return (
                            <Card
                                onClick={
                                    () => {
                                        if (isOtherSelected) return
                                        if (selectedTables?.includes(table.id)) {
                                            setSelectedTables(selectedTables?.filter(t => t !== table.id))
                                        } else {
                                            setSelectedTables([...selectedTables || [], table.id])
                                        }
                                    }
                                }
                                key={table.id} className={cn(' min-w-[150px] relative', {
                                    'bg-primary text-primary-foreground': isThisSelected,
                                    "bg-secondary text-secondary-foreground": isOtherSelected,
                                    "border-2 border-black":isThisDeSelected
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

                                {/* {
                                    isThisSelected && <CircleCheck className='absolute top-0 right-0 h-6 w-6 text-background fill-foreground' />
                                } */}

                            </Card>
                        )
                    })
                }
            </div>

            {
                otherTableStatues?.map((ots, i) => {
                    return (
                        <div key={i}>
                            <div className='text-lg font-bold'>{ots.hour}</div>
                            <div className='flex gap-x-3 max-w-full overflow-x-auto'>

                                {
                                    ots.tables.map((table, i) => {

                                        const tableReservation = table.reservedTableRow && ots.hour === table.reservedTableRow.hour ? table.reservedTableRow : undefined

                                        return (
                                            <Card

                                                key={table.id} className={cn(' min-w-[150px] relative', {
                                                    "bg-secondary text-secondary-foreground": tableReservation,
                                                })}>
                                                <CardContent className="p-4 flex flex-col gap-y-1">
                                                    <div className="r r1 flex justify-between">
                                                        <div className="text-xl font-bold">{table.no}</div>


                                                    </div>
                                                    <div className="text-sm flex">
                                                        <div>{tableReservation?.guest.name || '-'}</div>
                                                    </div>
                                                    <div className="flex items-center text-xs mt-2">
                                                        <Clock className="w-3 h-3 mr-1" /> {tableReservation?.hour}
                                                    </div>

                                                </CardContent>

                                                {/* {
                                            isThisSelected && <CircleCheck className='absolute top-0 right-0 h-6 w-6 text-background fill-foreground' />
                                        } */}

                                            </Card>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    )
                })
            }

        </div>
    )
}