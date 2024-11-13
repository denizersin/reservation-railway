import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TReservationRow } from '@/lib/reservation'
import { api } from '@/server/trpc/react'
import { EnumReservationStatusNumeric } from '@/shared/enums/predefined-enums'
import React from 'react'

type Props = {
    reservation: TReservationRow
}

export const ReservationStatusLogs = ({ reservation }: Props) => {

    const { data: reservationDetailData } = api.reservation.getReservationDetail.useQuery({
        reservationId: reservation.id
    })

    const isConfirmed = reservation.reservationStatusId === EnumReservationStatusNumeric.confirmed

    return (
        <div className='flex flex-col gap-2 mb-2'>
            <div className="border-b border-border pb-2 mb-2">
                <div className="text-sm font-semibold">Created</div>

                Created By: {reservationDetailData?.createdOwner?.name}

                at {reservationDetailData?.createdAt.toLocaleString()}
            </div>
            {reservationDetailData?.confirmationRequests && reservationDetailData?.confirmationRequests.length > 0 && (
                <div className="flex flex-col gap-2 border-b border-border  mb-2">
                    <div className="text-sm font-semibold">Confirmation Requests</div>
                    {reservationDetailData?.confirmationRequests.map((confirmationRequest) => (
                    <div key={confirmationRequest.id}>
                        {confirmationRequest.createdAt.toLocaleString()}
                        {confirmationRequest.createdBy}
                    </div>
                    ))}
                </div>
            )}
            {reservationDetailData?.prepayment && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Created By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="text-sm">{reservationDetailData?.prepayment?.status}</TableCell>
                            <TableCell className="text-sm">{reservationDetailData?.prepayment?.amount}</TableCell>
                            <TableCell className="text-sm">{reservationDetailData?.prepayment?.createdAt.toLocaleString()}</TableCell>
                            <TableCell className="text-sm">{reservationDetailData?.prepayment?.createdBy}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            )}

            {
                isConfirmed && (
                    <div className="flex flex-col gap-2 border-b border-border pb-2 mb-2">
                        <div className="text-sm font-semibold">Confirmed</div>
                        <div className="text-sm">Confirmed at {reservationDetailData?.confirmedAt?.toLocaleString()}</div>
                        <div className="text-sm">Confirmed by {reservationDetailData?.confirmedBy}</div>
                    </div>
                )
            }
        </div>
    )
}
