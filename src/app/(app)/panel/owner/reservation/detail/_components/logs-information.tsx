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

export const LogsInformation = ({ reservationDetailData }: Props) => {
    return (
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
    )
} 