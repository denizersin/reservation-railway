import { TStatusTableRow } from '@/lib/reservation'
import { TReservation } from '@/server/db/schema'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ReservationGridStatus } from './reservation-grid-status'
import { api } from '@/server/trpc/react'
import { getQueryKey } from '@trpc/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal'

export type TSelectionRowState = {
    deSelectedRows: TStatusTableRow[];
    selectedRows: TStatusTableRow[];
}


type Props = {
    isOpen: boolean
    setOpen: (open: boolean) => void
    reservation: TReservation
}

export const ReservationGridStatusModal = ({
    isOpen,
    setOpen,
    reservation
}: Props) => {


    const [selectionRowState, setSelectionRowState] = useState<TSelectionRowState>({
        deSelectedRows: [],
        selectedRows: []
    })

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

    const isUpdateReservationTable = selectedRows.length === 1 && deSelectedRows.length === 1

    const isLinkingReservation = (selectedRows.length == 1 && selectedRows[0]?.reservation) && deSelectedRows.length == 0

    const isAddingTableToReservation = selectedRows.length > 0 && deSelectedRows.length === 0


    function onUpdate() {
        if (isUpdateReservationTable) {
            updateReservationTable({
                id:deSelectedRows[0]?.reservation_tables?.id!,
                tableId:selectedRows[0]?.table?.id!
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

    useShowLoadingModal([isPendingAddNewTables, isPendingLinkReservation,isPendingUpdateReservation])

    console.log(selectionRowState, 'selectionRowState')



    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className='max-w-[90vw]'>
                <DialogHeader>
                    CHange Room-Table
                </DialogHeader>
                <div className="w-full max-h-[600px] overflow-auto">
                    <ReservationGridStatus
                        reservation={reservation}
                        selectionRowState={selectionRowState}
                        setSelectionRowState={setSelectionRowState}
                        onSucessCrudTable={onSuccsessCrudTable}
                    // key={}
                    />
                </div>

                <Button
                    onClick={onUpdate}
                >
                    Update
                </Button>


            </DialogContent>
        </Dialog>
    )
}