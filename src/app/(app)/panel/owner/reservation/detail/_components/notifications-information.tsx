import React from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { RouterOutputs } from '@/server/trpc/react'

type Props = {
    reservationDetailData: RouterOutputs['reservation']['getReservationDetail']
}

export const NotificationsInformation = ({ reservationDetailData }: Props) => {
    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Notification</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Channel</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            reservationDetailData?.notifications.map((notification) => (
                                <TableRow key={notification.id}>
                                    <TableCell>{notification.notificationMessageType}</TableCell>
                                    <TableCell>{notification.message}</TableCell>
                                    <TableCell>{notification.createdAt.toLocaleString()}</TableCell>
                                    <TableCell>{notification.type}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
} 