import { RouterOutputs } from '@/server/trpc/react'
import { useRouter } from 'next/navigation'
import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
    guestDetail: RouterOutputs['guest']['getGuestDetail']
}

const GuestReservations = ({ guestDetail }: Props) => {
    const guestReservations = guestDetail.guestReservations || []
    const router = useRouter()

    const onClickRow = (reservationId: number) => {
        router.push(`/panel/owner/reservation/detail/${reservationId}`)
    }

    return (
        <div className="rounded-md border">
            <CardHeader>
                <CardTitle>Rezervasyonlar</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Rezervasyon Durumu</TableHead>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Misafir Sayısı</TableHead>
                            <TableHead>Varlık Durumu</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {guestReservations.map((reservation) => (
                            <TableRow
                                key={reservation.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => onClickRow(reservation.id)}
                            >
                                <TableCell>
                                    <Badge variant="outline">
                                        {reservation.reservationStatus.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {format(new Date(reservation.reservationDate), 'dd MMMM yyyy HH:mm', { locale: tr })}
                                </TableCell>
                                <TableCell>{reservation.guestCount}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {reservation.reservationExistenceStatus.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </div>

    )
}

export default GuestReservations