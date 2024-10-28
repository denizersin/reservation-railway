import { TReservationRow, TStatusTableRow } from '@/lib/reservation'
import { TReservation, TRoomWithTranslations, TTable } from '@/server/db/schema'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ReservationGridStatus } from './reservation-grid-status'
import { api } from '@/server/trpc/react'
import { getQueryKey } from '@trpc/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReservationWaitingTableSelect, TWaitingTable } from './reservation-waiting-table-select'

export type TSelectionRowState = {
    deSelectedRows: TStatusTableRow[];
    selectedRows: TStatusTableRow[];
}

export type TSelctionWaitingState = {
    deSelectedTables: TWaitingTable[];
    selectedTables: TWaitingTable[];
}


type Props = {
    isOpen: boolean
    setOpen: (open: boolean) => void
    reservation: TReservationRow
}

export const ReservationGridStatusModal = ({
    isOpen,
    setOpen,
    reservation
}: Props) => {
    const [selectedRoom, setSelectedRoom] = useState<TRoomWithTranslations | undefined>(undefined)

    const { data: roomsData } = api.room.getRooms.useQuery({ withWaitingRooms: true })

    const [selectionRowState, setSelectionRowState] = useState<TSelectionRowState>({
        deSelectedRows: [],
        selectedRows: []
    })

    const [selectionWaitingState, setselectionWaitingState] = useState<TSelctionWaitingState>({
        deSelectedTables: [],
        selectedTables: []
    })

    console.log(setselectionWaitingState, 'setselectionWaitingState')

    const [selectedTables, setSelectedTables] = useState<TTable[]>([])

    const { deSelectedRows, selectedRows } = selectionRowState

    const queryClient = useQueryClient();

    function onSuccsessCrudTable() {
        setSelectionRowState({
            selectedRows: [],
            deSelectedRows: []
        })
    }

    const onSuccsessUpdate = () => {
        queryClient.invalidateQueries({
            queryKey: getQueryKey(api.reservation.getAllAvailableReservation2),
        })

        queryClient.invalidateQueries({
            queryKey: getQueryKey(api.reservation.getReservations),
        })
        onSuccsessCrudTable()

    }

    const {
        mutate: addNewTablesToReservation,
        isPending: isPendingAddNewTables
    } = api.reservation.addNewTablesToReservation.useMutation({
        onSuccess: onSuccsessUpdate
    })

    const {
        mutate: linkReservation,
        isPending: isPendingLinkReservation
    } = api.reservation.linkReservation.useMutation({
        onSuccess: onSuccsessUpdate
    })

    const {
        mutate: updateReservationTable,
        isPending: isPendingUpdateReservation
    } = api.reservation.updateReservationTable.useMutation({
        onSuccess: onSuccsessUpdate
    })


    const {
        mutate: createReservationWaitingSession,
        isPending: isPendingCreateReservation
    } = api.reservation.createReservationWaitingSession.useMutation({
        onSuccess: onSuccsessUpdate
    })

    const {
        mutate: updateReservationWaitingSession,
        isPending: isPendingUpdateReservationWaitingSession
    } = api.reservation.updateReservationWaitingSession.useMutation({
        onSuccess: onSuccsessUpdate
    })


    const {
        mutate: checkInReservation,
        isPending: isPendingCheckInReservation
    } = api.reservation.checkInReservation.useMutation({ onSuccess: onSuccsessUpdate })


    const isUpdateReservationTable = selectedRows.length === 1 && deSelectedRows.length === 1

    const isLinkingReservation = (selectedRows.length == 1 && selectedRows[0]?.reservation) && deSelectedRows.length == 0

    const isAddingTableToReservation = selectedRows.length > 0 && deSelectedRows.length === 0


    function onUpdateWaiting() {
        const { selectedTables, deSelectedTables } = selectionWaitingState
        const isCreating = deSelectedTables.length === 0 && selectedTables.length > 0
        const isUpdating = deSelectedTables.length === 1 && selectedTables.length === 1

        if (isCreating) {
            createReservationWaitingSession({
                reservationId: reservation.id,
                tableIds: [selectedTables?.[0]?.id!]
            })
        }
        if (isUpdating) {
            updateReservationWaitingSession({
                reservationId: reservation.id,
                tableIds: [selectedTables?.[0]?.id!],
            })
        }

    }


    function onUpdate() {
        console.log('s23')
        if (isUpdateReservationTable) {
            updateReservationTable({
                id: deSelectedRows[0]?.reservation_tables?.id!,
                tableId: selectedRows[0]?.table?.id!
            })
        }

        if (isLinkingReservation) {
            linkReservation({
                reservationId: selectedRows[0]?.reservation?.id!,
                linkedReservationId: reservation.id
            })
            return;
        }
        if (isAddingTableToReservation) {
            addNewTablesToReservation({
                reservationTables: selectedRows.map(r => ({
                    reservationId: reservation.id,
                    tableId: r.table?.id!
                }))
            })
            return;
        }
    }

    useShowLoadingModal([isPendingAddNewTables, isPendingLinkReservation, isPendingUpdateReservation, isPendingCreateReservation, isPendingUpdateReservationWaitingSession, isPendingCheckInReservation])

    const isWaitinfRoom = selectedRoom?.isWaitingRoom




    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className='max-w-[90vw]'>
                <DialogHeader>
                    CHange Room-Table
                </DialogHeader>

                <div className="">
                    <Tabs
                        onValueChange={(value) => setSelectedRoom(roomsData?.find((room) => room.id.toString() === value))}
                        defaultValue={selectedRoom?.id.toString()} className="mt-5">
                        <TabsList>
                            {roomsData?.map((room) => (
                                <TabsTrigger key={room.id} value={room.id.toString()}>{room.translations[0]?.name}</TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                <div className="w-full max-h-[600px] overflow-auto">

                    {
                        !isWaitinfRoom ?

                            <ReservationGridStatus
                                reservation={reservation}
                                selectedRoom={selectedRoom}
                                setSelectedRoom={setSelectedRoom}
                                selectionRowState={selectionRowState}
                                setSelectionRowState={setSelectionRowState}
                                onSucessCrudTable={onSuccsessCrudTable}
                            // key={}
                            /> : <ReservationWaitingTableSelect
                                reservation={reservation}
                                selectionWaitingState={selectionWaitingState}
                                setselectionWaitingState={setselectionWaitingState}
                            />
                    }

                </div>
                <div className="flex ">
                    {!isWaitinfRoom && <Button
                        onClick={() => isWaitinfRoom ? onUpdateWaiting() : onUpdate()}
                    >
                        Update
                    </Button>}
                    {!reservation.isCheckedin&& < Button
                        className='bg-green-600 ml-auto'
                    onClick={() => {
                        checkInReservation({
                            reservationId: reservation.id
                        })
                    }}
                    >
                    Check In
                </Button>}
            </div>



        </DialogContent>
        </Dialog >
    )
}