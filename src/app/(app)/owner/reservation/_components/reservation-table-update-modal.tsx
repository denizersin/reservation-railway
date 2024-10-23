import { groupTableStatues, TStatusTableRow } from '@/lib/reservation'
import { TReservation, TRoomWithTranslations } from '@/server/db/schema'
import { api } from '@/server/trpc/react'
import React, { useEffect, useMemo, useState } from 'react'
import { StatusTableRowCard } from './status-table-row-card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmModalGlobal } from '@/components/modal/confirm-modal'
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { SelectTableRowModal } from './select-table-row-modal'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'

type Props = {
    reservation: TReservation
    isOpen: boolean
    setOpen: (open: boolean) => void
}

export const ReservationTableUpdateModal = ({
    reservation,
    isOpen,
    setOpen

}: Props) => {

    const queryClient = useQueryClient();

    const [isOpenSelectModal, setIsOpenSelectModal] = useState(false)
    const [selectedStatusRowToLink, setselectedStatusRowToLink] = useState<TStatusTableRow | undefined>(undefined)
    const [selectedStatusRowToAdd, setselectedStatusRowToAdd] = useState<TStatusTableRow | undefined>(undefined)

    const [statusTableRow, setStatusTableRow] = useState<TStatusTableRow | undefined>(undefined)

    const { data: roomsData } = api.room.getRooms.useQuery({})
    const [selectedRoom, setSelectedRoom] = useState<TRoomWithTranslations | undefined>(roomsData?.[0])

    const queryDate = useMemo(() => {
        const date = new Date(reservation.reservationDate)
        date.setHours(0, 0, 0, 0)
        return date.toISOString()
    }, [reservation.reservationDate])
    const { data: availableTableData } = api.reservation.getAllAvailableReservation2.useQuery({
        date: queryDate,
        mealId: reservation.mealId
    })


    const groupedTables = useMemo(() => {
        const tableStatues = availableTableData?.tableStatues.find(r => r.roomId === selectedRoom?.id)
            ?.statues.find((hour) => hour.hour === statusTableRow?.reservation?.hour)?.tables
        return groupTableStatues(tableStatues ?? [])
    }, [availableTableData, selectedRoom])


    useEffect(() => {
        if (roomsData) {
            setSelectedRoom(roomsData.find((room) => room.id === statusTableRow?.reservation?.roomId))
        }
    }, [roomsData, statusTableRow])


    const onSuccsessUpdate = () => {
        queryClient.invalidateQueries({
            queryKey: getQueryKey(api.reservation.getAllAvailableReservation2),
        })

        queryClient.invalidateQueries({
            queryKey: getQueryKey(api.reservation.getReservations),
        })
    }


    const { mutate: removeTableFromReservation, isPending } = api.reservation.removeTableFromReservation.useMutation({
        onSuccess: onSuccsessUpdate
    })
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
        mutate: unlinkReservation,
        isPending: isPendingUnlinkReservation
    } = api.reservation.unlinkReservation.useMutation({
        onSuccess: onSuccsessUpdate
    })


    function unLinkReservationHandler(row: TStatusTableRow) {
        if (row.reservation?.linkedReservationId) {
            ConfirmModalGlobal.show({
                title: 'Unlink Reservation',
                type: 'delete',
                onConfirm: () => {
                    unlinkReservation({
                        reservationId: row.reservation?.id!
                    })
                }
            })
        }
    }

    function removeTableFromReservationHandler(row: TStatusTableRow) {
        ConfirmModalGlobal.show({
            title: 'Remove Table',
            type: 'delete',
            onConfirm: () => {
                removeTableFromReservation({
                    reservationId: row.reservation?.id!,
                    reservationTableId: row.reservation_tables?.id!
                })
            },

        })

    }

    function handleSelectTableToAdd(r: TStatusTableRow) {
        setselectedStatusRowToAdd(r)
        setIsOpenSelectModal(true)
    }

    function handleSelectTableToLink(r: TStatusTableRow) {
        setselectedStatusRowToLink(r)
        setIsOpenSelectModal(true)
    }

    useEffect(() => {
        if (availableTableData) {
            const r = availableTableData.tableStatues
                .find(r => r.roomId === reservation.roomId)?.statues
                .find(h => h.hour === reservation.hour)?.tables
                .find(t => t.reservation?.id === reservation.id)

            setStatusTableRow(r)
        }
    }, [availableTableData])


    function onSelectAddTables(selectedRows: TStatusTableRow[]) {
        addNewTablesToReservation({
            reservationTables: selectedRows.map((r) => ({
                reservationId: selectedStatusRowToAdd?.reservation?.id!,
                tableId: r.table?.id!
            }))
        })

    }

    function onSelectLinkReservation(selectedRows: TStatusTableRow[]) {
        linkReservation({
            reservationId: selectedRows?.[0]?.reservation?.id!,
            linkedReservationId: selectedStatusRowToLink?.reservation?.id!
        })
    }

    useShowLoadingModal([isPending, isPendingAddNewTables, isPendingLinkReservation, isPendingUnlinkReservation])



    if (!statusTableRow) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setOpen}>
                <DialogContent className='max-w-[90vw]'>
                    <DialogHeader>
                        <DialogTitle>{statusTableRow?.guest?.name}</DialogTitle>
                        <DialogTitle>{statusTableRow?.reservation?.reservationDate?.toDateString()}</DialogTitle>
                    </DialogHeader>
                    <div>
                        <Tabs
                            onValueChange={(value) => setSelectedRoom(roomsData?.find((room) => room.id.toString() === value))}
                            defaultValue={selectedRoom?.id.toString()} className="mt-5">
                            <TabsList>
                                {roomsData?.map((room) => (
                                    <TabsTrigger key={room.id} value={room.id.toString()}>{room.translations[0]?.name}</TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                        <div className='my-4 flex gap-x-3'>
                            <Button
                                onClick={() => handleSelectTableToAdd(statusTableRow)}
                            >
                                Add Table
                            </Button>

                            <Button
                                onClick={() => handleSelectTableToAdd(statusTableRow)}
                            >
                                Update Table
                            </Button>

                            <Button
                                onClick={() => handleSelectTableToLink(statusTableRow)}
                            >
                                Link Reservation
                            </Button>
                        </div>


                        <div className='flex flex-wrap gap-x-2 gap-y-2'>
                            {
                                groupedTables.map((g, index) => {
                                    if (g.length === 0) return null

                                    const isReservedGroup = Boolean(g[0]?.reservation)

                                    return <React.Fragment key={index}>
                                        {
                                            g.length == 1 ? <StatusTableRowCard
                                                isSelected={false}
                                                onClcikTable={() => { }}
                                                statusTableRow={g[0]!}

                                            /> :
                                                isReservedGroup ?

                                                    <div className='flex gap-x-2 gap-y-2 border p-2'>
                                                        {
                                                            g.map((table) => {
                                                                return <StatusTableRowCard
                                                                    isSelected={false}
                                                                    onClcikTable={() => { }}
                                                                    statusTableRow={table!}
                                                                    removeTable={removeTableFromReservationHandler}
                                                                    unLinkReservation={
                                                                        table.reservation?.linkedReservationId ?
                                                                            unLinkReservationHandler : undefined
                                                                    }
                                                                />
                                                            })
                                                        }
                                                    </div>
                                                    :
                                                    g.map((table) => {
                                                        return <StatusTableRowCard
                                                            isSelected={false}
                                                            onClcikTable={() => { }}
                                                            statusTableRow={table!}
                                                        />
                                                    })
                                        }
                                    </React.Fragment>
                                })
                            }
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {selectedStatusRowToAdd && <SelectTableRowModal
                availableTableData={availableTableData!}
                isOpen={isOpenSelectModal}
                setOpen={(open) => {
                    setIsOpenSelectModal(open)
                    setselectedStatusRowToAdd(undefined)
                }}
                reservation={reservation}
                onSelect={onSelectAddTables}
                description='Add Tables'
                disabled={(r) => Boolean(r.reservation?.id)}
            />}
            {
                selectedStatusRowToLink && <SelectTableRowModal
                    disabled={(r) => {
                        return !Boolean(r.reservation?.id) || (r.reservation?.hour !== reservation.hour)
                    }}
                    availableTableData={availableTableData!}
                    isOpen={isOpenSelectModal}
                    setOpen={
                        (open) => {
                            setIsOpenSelectModal(open)
                            setselectedStatusRowToLink(undefined)
                        }
                    }
                    reservation={reservation}
                    onSelect={onSelectLinkReservation}
                    description='Link Reservation'
                />
            }



        </>

    )
}