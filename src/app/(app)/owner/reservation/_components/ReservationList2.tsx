'use client'

import { api } from '@/server/trpc/react'
import React from 'react'
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

type Props = {
    date: Date
}

export const ReservationList2 = ({ date }: Props) => {
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
                            <button onClick={() => deleteReservation({ reservationId: reservation.id })}>Delete</button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}