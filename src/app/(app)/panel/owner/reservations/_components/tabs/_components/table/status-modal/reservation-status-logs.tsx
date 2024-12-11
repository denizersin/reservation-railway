import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TReservationRow } from '@/lib/reservation'
import { cn } from '@/lib/utils'
import { api } from '@/server/trpc/react'
import { EnumReservationStatus, EnumReservationStatusNumeric } from '@/shared/enums/predefined-enums'
import React, { useMemo } from 'react'
import { statuses } from '../data'
import { IconCalendarPlus, IconCircleCheckFilled } from '@tabler/icons-react'

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


    const creator = reservationDetailData?.isCreatedByOwner ? reservationDetailData?.createdOwner?.name : 'Guest '

    const statusData = useMemo(() => {
        return statuses.find(status => status.value === reservation.reservationStatus.status)
    }, [reservation.reservationStatusId])

    const prepaymentStatusData = useMemo(() => {
        return statuses.find(status => status.value === EnumReservationStatus.prepayment)
    }, [])


    return (
        <div className='flex flex-col  gap-2 mb-2'>
            <div className='order-0 flex gap-2  items-center justify-center mb-4'>
                <span className='text-base font-semibold'>Status:</span>:<div  className='flex items-center gap-2 text-base'>
                    {statusData && <statusData.icon className='size-6' />}
                    {reservation.reservationStatus.status}</div>
            </div>

            <div className="order-1 border-b border-border pb-2 mb-2  bg-orange-50 text-orange-500 p-3 rounded-md flex flex-col items-center justify-center">
                {<IconCalendarPlus className='text-orange-500 w-6 h-6' />}
                <div>
                    Created By: <span className='font-semibold mx-1'>{creator}</span>
                    at <span className='font-semibold mx-1'>{reservationDetailData?.createdAt.toLocaleString()}</span>
                </div>
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
                <div className={cn('order-3 border p-2', {
                    'order-2': isStatusConfirmation,
                    'order-3': isStatusPrepayment,
                })}>
                    <div className='text-sm font-semibold text-center flex flex-col items-center gap-2 justify-center'>
                         {
                            prepaymentStatusData && <prepaymentStatusData.icon className='' />
                        }Prepayment</div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Paid At</TableHead>
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
                                        <TableCell className="text-sm">{prepayment.paidAt?.toLocaleString()}</TableCell>
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
                reservationDetailData?.confirmedAt && (
                    <div className="order-4 border-b border-border pb-2 mb-2  bg-green-500 text-white p-3 rounded-md flex flex-col items-center justify-center">
                        {<IconCircleCheckFilled className='text-white w-6 h-6' />}
                        <div>
                            Confirmed by <span className='font-semibold mx-1'>{reservationDetailData?.confirmedBy}</span>
                            at <span className='font-semibold mx-1'>{reservationDetailData?.confirmedAt?.toLocaleString()}</span>
                        </div>
                    </div>
                )
            }

            {
                isCanceled && (
                    <div className="order-5 flex gap-2 border-border pb-2 mb-2  bg-red-500 text-white p-3 rounded-md flex flex-col items-center justify-center">
                        Canceled By {reservationDetailData?.canceledBy} at {reservationDetailData?.canceledAt?.toLocaleString()}
                    </div>
                )
            }





        </div>
    )
}
