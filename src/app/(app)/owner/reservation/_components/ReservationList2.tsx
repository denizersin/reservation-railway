'use client'

import { api } from '@/server/trpc/react'
import React, { useState } from 'react'
import { format } from 'date-fns'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { TReservation } from '@/server/db/schema'
import { ReservationTableUpdateModal } from './reservation-table-update-modal'
import { ConfirmModalGlobal } from '@/components/modal/confirm-modal'
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal'
import { UpdateReservationTmeModal } from './update-reservation-time-modal'
import { Button } from '@/components/ui/button'

type Props = {
    date: Date
}

export const ReservationList2 = ({ date }: Props) => {

    const [isOpen, setIsOpen] = useState(false)

    const [reservation, setReservation] = useState<TReservation>()
    const [hourUpdateReservation, setHourUpdateReservation] = useState<TReservation>()

    const { data: reservations } = api.reservation.getReservations.useQuery({
        date: date,
    })

    const queryClient = useQueryClient();
    const { mutate: deleteReservation } = api.reservation.deleteReservation.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getReservations)
            })
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getAllAvailableReservation2)
            })
        }
    })



    useShowLoadingModal([])

    console.log(reservation, 'reservation')
    console.log(isOpen, 'isOpen')

    return (
        <Table>
            <TableCaption>Reservations for {format(date, 'yyyy-MM-dd')}</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Guest Count</TableHead>
                    <TableHead>Reservation Date</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {reservations?.map((reservation) => (
                    <TableRow key={reservation.id}>
                        <TableCell>{reservation.id}</TableCell>
                        <TableCell>{reservation.guestCount}</TableCell>
                        <TableCell>
                            {((reservation.reservationDate.toString()))}
                        </TableCell>
                        <TableCell>{reservation.roomId}</TableCell>
                        <TableCell>{
                            reservation.tables.map((rsvTable) => rsvTable.table.no).join(', ')
                        }</TableCell>
                        <TableCell>
                            <div className='flex flex-col gap-y-4'>

                                <button onClick={() => deleteReservation({ reservationId: reservation.id })}>Delete</button>
                                <Button className='w-max'
                                    onClick={() => {
                                        setReservation(reservation as unknown as TReservation)
                                        setIsOpen(true)

                                    }}
                                >Update Room-Table </Button>

                                <Button className='w-max'
                                    onClick={() => {
                                        setHourUpdateReservation(reservation as unknown as TReservation)
                                        setIsOpen(true)

                                    }}
                                >Update Date-Time </Button>
                            </div>

                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>

            {reservation && <ReservationTableUpdateModal
                isOpen={isOpen}
                setOpen={(open)=>{
                    if(!open){
                        setReservation(undefined)
                    }
                    setIsOpen(open)
                }}
                reservation={reservation!}
                key={reservation?.id}

            />}

            {
                hourUpdateReservation && <UpdateReservationTmeModal
                    isOpen={isOpen}
                    setOpen={(open)=>{
                        if(!open){
                            setHourUpdateReservation(undefined)
                        }
                        setIsOpen(open)
                    }}
                    reservation={hourUpdateReservation}
                    key={hourUpdateReservation.id}
                />
            }
        </Table>
    )
}