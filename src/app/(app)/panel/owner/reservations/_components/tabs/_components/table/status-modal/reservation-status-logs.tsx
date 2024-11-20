import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TReservationRow } from '@/lib/reservation'
import { cn } from '@/lib/utils'
import { api } from '@/server/trpc/react'
import { EnumReservationStatus, EnumReservationStatusNumeric } from '@/shared/enums/predefined-enums'
import React from 'react'

type Props = {
    reservation: TReservationRow
}

export const ReservationStatusLogs = ({ reservation }: Props) => {

    const { data: reservationDetailData } = api.reservation.getReservationDetail.useQuery({
        reservationId: reservation.id
    })

    const isConfirmed = reservation.reservationStatusId === EnumReservationStatusNumeric.confirmed

    const isStatusConfirmation = reservation.reservationStatus.status === EnumReservationStatus.confirmation
    const isStatusPrepayment = reservation.reservationStatus.status === EnumReservationStatus.prepayment

    const isCanceled = reservation.reservationStatus.status === EnumReservationStatus.cancel


    return (
        <div className='flex flex-col gap-2 mb-2'>
            <div className="order-1 border-b border-border pb-2 mb-2">
                <div className="text-sm font-semibold">Created</div>

                Created By: {reservationDetailData?.createdOwner?.name}

                at {reservationDetailData?.createdAt.toLocaleString()}
            </div>
            {reservationDetailData?.confirmationRequests && reservationDetailData?.confirmationRequests.length > 0 && (
                <div className={cn('order-2 flex flex-col gap-2 border-b border-border  mb-2', {
                    'order-3': isStatusConfirmation,
                    'order-2': isStatusPrepayment,
                })}>
                    <div className="text-sm font-semibold">Confirmation Requests</div>
                    {reservationDetailData?.confirmationRequests.map((confirmationRequest) => (
                        <div key={confirmationRequest.id}>
                            {confirmationRequest.createdAt.toLocaleString()}
                            {confirmationRequest.createdBy}
                        </div>
                    ))}
                </div>
            )}
            
            {reservationDetailData?.prepayments && (
                <div className={cn('order-3', {
                    'order-2': isStatusConfirmation,
                    'order-3': isStatusPrepayment,
                })}>

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
                            {reservationDetailData?.prepayments.map((prepayment) => {
                                const isCurrentPrepayment = reservationDetailData?.currentPrepayment?.id === prepayment.id
                                return (
                                    <TableRow key={prepayment.id}>
                                        <TableCell className="text-sm flex items-center gap-2">
                                            {prepayment.status}
                                            {isCurrentPrepayment && <Badge variant='outline'>Current</Badge>}
                                        </TableCell>
                                        <TableCell className="text-sm">{prepayment.amount}</TableCell>
                                        <TableCell className="text-sm">{prepayment.createdAt.toLocaleString()}</TableCell>
                                        <TableCell className="text-sm">{prepayment.createdBy}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {
                isConfirmed && (
                    <div className="order-4 flex flex-col gap-2 border-b border-border pb-2 mb-2">
                        <div className="text-sm font-semibold">Confirmed</div>
                        <div className="text-sm">Confirmed at {reservationDetailData?.confirmedAt?.toLocaleString()}</div>
                        <div className="text-sm">Confirmed by {reservationDetailData?.confirmedBy}</div>
                    </div>
                )
            }

            {
                isCanceled && (
                    <div className="order-5 flex gap-2 items-center">
                        Canceled By {reservationDetailData?.canceledBy} at {reservationDetailData?.canceledAt?.toLocaleString()}
                    </div>
                )
            }

            <div className='order-5 flex gap-2 items-center'>
                Status:{reservation.reservationStatus.status}
            </div>



        </div>
    )
}
