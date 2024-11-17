"use client"
import { api } from '@/server/trpc/react';
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { usePathname } from 'next/navigation';
type Props = {}

export const ReservationDetailPage = (props: Props) => {


    const pathname = usePathname()
    const reservationId = Number(pathname.split('/').pop())


    const { data: reservationDetailData } = api.reservation.getReservationDetail.useQuery({
        reservationId
    })

    return (
        <div>


            <div>
                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Log</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Owner</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    reservationDetailData?.logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{log.message}</TableCell>
                                            <TableCell>{log.createdAt.toLocaleString()}</TableCell>
                                            <TableCell>{log.owner}</TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </CardContent>

                </Card>

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
            </div>
        </div>
    )
}