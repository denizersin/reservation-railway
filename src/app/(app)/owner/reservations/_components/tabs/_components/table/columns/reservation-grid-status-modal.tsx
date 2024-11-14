import { ConfirmModalGlobal } from '@/components/modal/confirm-modal'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMutationCallback } from '@/hooks/useMutationCallback'
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal'
import { TReservationRow, TTableStatuesRow } from '@/lib/reservation'
import { TRoomWithTranslations } from '@/server/db/schema'
import { api } from '@/server/trpc/react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ReservationGridStatus } from './reservation-grid-status'
import { ReservationWaitingTableSelect, TWaitingTable } from './reservation-waiting-table-select'
import { ReservationPersonel } from './reservation-personel'
import { ReservationNote } from './reservation-note'
import { EnumReservationStatusNumeric } from '@/shared/enums/predefined-enums'

export type TSelectionRowState = {
    deSelectedRows: TTableStatuesRow[];
    selectedRows: TTableStatuesRow[];
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


    const isCompleted = reservation.reservationStatusId === EnumReservationStatusNumeric.completed

    const { deSelectedRows, selectedRows } = selectionRowState

    console.log(selectedRows, deSelectedRows, 'selectedRows, deSelectedRows')

    const { onSuccessReservationUpdate } = useMutationCallback()

    function onSuccsessCrudTable() {
        setSelectionRowState({
            selectedRows: [],
            deSelectedRows: []
        })
    }

    const queryClient = useQueryClient()

    const onSuccsessUpdate = () => {
        onSuccsessCrudTable()
        onSuccessReservationUpdate(reservation.id)

    }

    const {
        mutate: addNewTablesToReservation,
        isPending: isPendingAddNewTables
    } = api.reservation.addNewTablesToReservation.useMutation({
        onSuccess: onSuccsessUpdate
    })

    const {
        mutateAsync: linkReservation,
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

    const {
        mutate: checkOutAndCompleteReservation,
        isPending: isPendingCheckOutAndCompleteReservation
    } = api.reservation.checkOutAndCompleteReservation.useMutation({ onSuccess: onSuccsessUpdate })


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
        if (isUpdateReservationTable) {
            const newTable = selectedRows[0]?.table!
            updateReservationTable({
                id: deSelectedRows[0]?.reservationTable?.id!,
                tableId: newTable.id,
                reservationId: reservation.id,
            })

        }

        if (isLinkingReservation) {
            ConfirmModalGlobal.show({
                type: "confirm",
                onConfirm: async () => {
                    await linkReservation({
                        reservationId: selectedRows[0]?.reservation?.id!,
                        linkedReservationId: reservation.id
                    })
                },
                title: "Link Reservation"
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

    useShowLoadingModal([isPendingAddNewTables, isPendingLinkReservation, isPendingUpdateReservation, isPendingCreateReservation, isPendingUpdateReservationWaitingSession, isPendingCheckInReservation, isPendingCheckOutAndCompleteReservation])

    const isWaitinfRoom = selectedRoom?.isWaitingRoom


    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className='w-[90vw] max-w-[90vw] min-h-[90vh] flex flex-col'>
                <div className='w-full  flex flex-col flex-1'>
                    <div className=''>Change Room-Table</div>
                    <div className=" my-1">
                        <Tabs
                            onValueChange={(value) => setSelectedRoom(roomsData?.find((room) => room.id.toString() === value))}
                            defaultValue={selectedRoom?.id.toString()} className="mt-1">
                            <TabsList>
                                {roomsData?.map((room) => (
                                    <TabsTrigger key={room.id} value={room.id.toString()}>{room.translations[0]?.name}</TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="w-full max-h-[400px] overflow-auto">

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

                    <ReservationPersonel reservation={reservation} />
                    <ReservationNote reservation={reservation} />

                    <div className="flex my-1 flex-1 items-end ">
                        {!isWaitinfRoom && <Button
                            onClick={() => isWaitinfRoom ? onUpdateWaiting() : onUpdate()}
                        >
                            Update
                        </Button>}
                        {!reservation.isCheckedin && < Button
                            className='bg-green-600 ml-auto'
                            onClick={() => {
                                checkInReservation({
                                    reservationId: reservation.id
                                })
                            }}
                        >
                            Check In
                        </Button>}
                        {
                            reservation.isCheckedin && !isCompleted && <Button
                                className=' ml-auto'
                                onClick={() => {
                                    checkOutAndCompleteReservation({ reservationId: reservation.id })
                                }}
                            >
                                Check Out
                            </Button>
                        }
                    </div>
                </div>


            </DialogContent>
        </Dialog >
    )
}