import { ConfirmModalGlobal } from '@/components/modal/confirm-modal'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useMutationCallback } from '@/hooks/useMutationCallback'
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal'
import { TReservationRow } from '@/lib/reservation'
import { api } from '@/server/trpc/react'
import { EnumPrepaymentStatus, EnumReservationPrepaymentNumeric, EnumReservationStatusNumeric } from '@/shared/enums/predefined-enums'
import React, { useMemo, useState } from 'react'
import { CreatePrepaymentModal } from './create-prepayment-modal'
import { IconBellPlus, IconBellRinging2, IconCashRegister, IconCircleCheckFilled, IconCircleXFilled, IconHelpHexagonFilled } from '@tabler/icons-react'
import { statuses } from '../data'
import { Badge } from '@/components/ui/badge'

type Props = {
    reservation: TReservationRow
}

export const ReservationStatusActions = ({ reservation }: Props) => {

    const { data: reservationDetailData } = api.reservation.getReservationDetail.useQuery({
        reservationId: reservation.id
    })

    const { onSuccessReservationUpdate } = useMutationCallback()

    const [withSms, setWithSms] = useState(true)
    const [withEmail, setWithEmail] = useState(true)

    const { mutateAsync: requestForPrepayment, isPending: isRequestForPrepaymentPending } = api.reservation.requestForPrepayment.useMutation({
        onSuccess: (...props) => {
            onSuccessReservationUpdate(reservation.id)
            console.log(props, 'props')
        }
    })
    const { mutateAsync: confirmReservation, isPending: isConfirmReservationPending } = api.reservation.confirmReservation.useMutation({
        onSuccess: () => {
            onSuccessReservationUpdate(reservation.id)
        }
    })
    const { mutateAsync: cancelReservation, isPending: isCancelReservationPending } = api.reservation.cancelReservation.useMutation({
        onSuccess: () => onSuccessReservationUpdate(reservation.id)
    })
    const { mutateAsync: notifyPrepayment, isPending: isNotifyPrepaymentPending } = api.reservation.notifyPrepayment.useMutation({
        onSuccess: () => onSuccessReservationUpdate(reservation.id)
    })

    const { mutateAsync: cancelPrepayment, isPending: isCancelPrepaymentPending } = api.reservation.cancelPrepayment.useMutation({
        onSuccess: () => onSuccessReservationUpdate(reservation.id)
    })

    const { mutateAsync: askForBill, isPending: isAskForBillPending } = api.reservation.askForBill.useMutation({
        onSuccess: () => onSuccessReservationUpdate(reservation.id)
    })

    const { mutateAsync: repeatReservation, isPending: isRepeatReservationPending } = api.reservation.repeatReservation.useMutation({
        onSuccess: () => onSuccessReservationUpdate(reservation.id)
    })

    const { mutateAsync: cancelConfirmationRequest, isPending: isCancelConfirmationRequestPending } = api.reservation.cancelConfirmationRequest.useMutation({
        onSuccess: () => onSuccessReservationUpdate(reservation.id)
    })



    const {
        mutateAsync: requestForConfirmation,
        isPending: isRequestForConfirmationPending
    } = api.reservation.requestForConfirmation.useMutation({
        onSuccess: () => {
            onSuccessReservationUpdate(reservation.id)
            toast({
                title: 'Reservation Requested for Confirmation',
                description: 'The reservation has been requested for confirmation',
                variant: 'default'
            })
        }
    })

    //is prepayment
    const hasCurrentPrepayment = reservation.currentPrepaymentId !== null
    const isConfirmed = reservation.reservationStatusId === EnumReservationStatusNumeric.confirmed
    const isCanceled = reservation.reservationStatusId === EnumReservationStatusNumeric.cancel
    const isCompleted = reservation.reservationStatusId === EnumReservationStatusNumeric.completed
    const isWaitingForConfirmation = reservation.reservationStatusId === EnumReservationStatusNumeric.confirmation

    const isConfirmedOrCompleted = isConfirmed || isCompleted

    //is completed


    const isCreatedByOwner = Boolean(reservation.createdOwnerId)
    const canRequestForConfirmation = !isConfirmedOrCompleted && isCreatedByOwner && !hasCurrentPrepayment

    const canConfirmReservation = !isConfirmedOrCompleted && !isCanceled

    const canRequestForPrepayment = !isConfirmedOrCompleted && !hasCurrentPrepayment && !isWaitingForConfirmation

    const canCancelPayemntRequest = hasCurrentPrepayment && !isConfirmedOrCompleted && !isCanceled

    const isPrepaymetPaid = hasCurrentPrepayment && reservationDetailData?.currentPrepayment?.status === EnumPrepaymentStatus.success

    const canNotifyPrepayment = hasCurrentPrepayment && !isPrepaymetPaid

    const canCancelReservation = !isCompleted && !isCanceled


    const canAskForBill = isCompleted

    const hasBill = reservation.billPaymentId !== null

    console.log(reservation.currentPrepaymentId, 'currentPrepaymentId')

    const { toast } = useToast()


    console.log(reservation, 'reservation')
    console.log(hasCurrentPrepayment, 'hasCurrentPrepayment')


    const handleRequestForPrepayment = async () => {
        setIsOpenCreatePrepaymentModal(true)
    }



    const handleNotifyPrepayment = async () => {
        ConfirmModalGlobal.show({
            type: "confirm",
            title: "Notify Prepayment",
            onConfirm: async () => {
                await notifyPrepayment({
                    reservationId: reservation.id,
                    notificationOptions: {
                        withEmail,
                        withSms
                    }
                })
            }
        })
    }

    const handleAskForBill = async () => {
        ConfirmModalGlobal.show({
            type: "confirm",
            title: "Ask for Bill",
            onConfirm: async () => {
                await askForBill({
                    reservationId: reservation.id,
                    notificationOptions: {
                        withEmail,
                        withSms
                    }
                })
            }
        })
    }

    const handleConfirmReservation = async () => {
        ConfirmModalGlobal.show({
            type: "confirm",
            title: "Confirm Reservation",
            onConfirm: async () => {
                await confirmReservation({
                    reservationId: reservation.id,
                    notificationOptions: {
                        withEmail,
                        withSms
                    }
                })
            }
        })
    }


    const handleCancelPrepayment = async () => {
        ConfirmModalGlobal.show({
            type: "warning",
            title: "Cancel Prepayment",
            onConfirm: async () => {
                await cancelPrepayment({
                    reservationId: reservation.id,
                    notificationOptions: {
                        withEmail,
                        withSms
                    }
                })
            }
        })
    }

    const handleRequestForConfirmation = async () => {
        await requestForConfirmation({
            reservationId: reservation.id,
            notificationOptions: {
                withEmail,
                withSms
            }
        })
    }

    const handleCancelReservation = async () => {
        ConfirmModalGlobal.show({
            type: "delete",
            title: "Cancel Reservation",
            onConfirm: async () => {
                await cancelReservation({
                    reservationId: reservation.id,
                    notificationOptions: {
                        withEmail,
                        withSms
                    }
                })
            }
        })
    }

    const handleCancelConfirmationRequest = async () => {
        ConfirmModalGlobal.show({
            type: "delete",
            title: "Cancel Confirmation Request",
            onConfirm: async () => {
                await cancelConfirmationRequest({
                    reservationId: reservation.id,
                    notificationOptions: { withEmail, withSms }
                })
            }
        })
    }

    const [isOpenCreatePrepaymentModal, setIsOpenCreatePrepaymentModal] = useState(false)

    const statusData = useMemo(() => {
        return statuses.find(status => status.value === reservation.reservationStatus.status)
    }, [reservation.reservationStatusId])
    useShowLoadingModal([isRequestForConfirmationPending])

    return (
        <div className='mt-4'>

            <div className='flex flex-wrap gap-3 py-2  mb-2'>





                {canCancelPayemntRequest && (<Button onClick={handleCancelPrepayment} variant={'destructive'}>
                    <IconCashRegister className='w-4 h-4 mr-2 text-white' />
                    Cancel Prepayment
                </Button>)}
                {canRequestForPrepayment && (<Button variant={'outline'} onClick={handleRequestForPrepayment}>
                    <IconCashRegister className='w-4 h-4 mr-2 text-primary' />
                    Request for Prepayment</Button>)}

                {
                    canNotifyPrepayment && (
                        <Button
                            onClick={handleNotifyPrepayment}
                            variant={'outline'}
                        >
                            <IconBellPlus stroke={2} className='w-4 h-4 mr-2 text-primary' />
                            Notify Prepayment</Button>
                    )
                }

                {canConfirmReservation && (
                    <Button
                        className='bg-green-600 hover:bg-green-700'
                        onClick={handleConfirmReservation}>
                        <IconCircleCheckFilled stroke={2} className='w-4 h-4 mr-2 text-white' />
                        Confirm Reservation</Button>
                )}


                {
                    isOpenCreatePrepaymentModal && (
                        <CreatePrepaymentModal
                            reservation={reservation}
                            open={isOpenCreatePrepaymentModal}
                            setOpen={setIsOpenCreatePrepaymentModal}

                        />
                    )
                }

                {
                    canRequestForConfirmation && (
                        <Button
                            variant={'outline'}
                            onClick={handleRequestForConfirmation}>
                            <IconHelpHexagonFilled stroke={2} className='w-4 h-4 mr-2 text-primary' />
                            Request for Confirmation</Button>
                    )
                }
                {
                    isWaitingForConfirmation && (
                        <Button
                            variant={'destructive'}
                            onClick={handleCancelConfirmationRequest}>
                            <IconHelpHexagonFilled stroke={2} className='w-4 h-4 mr-2 text-white' />
                            Cancel Confirmation Request</Button>
                    )
                }

                {
                    canCancelReservation && (
                        <Button variant={'destructive'} onClick={handleCancelReservation}>
                            <IconCircleXFilled stroke={2} className='w-4 h-4 mr-2 text-white' />
                            Cancel Reservation</Button>
                    )
                }

                {
                    canAskForBill && (
                        <Button onClick={handleAskForBill}>Ask for Bill</Button>
                    )
                }


            </div>
            <div className="my-2 flex flex-wrap gap-2">
                <div className='flex gap-2'>
                    <Checkbox
                        checked={withSms}
                        onCheckedChange={(s) => setWithSms(s as boolean)}
                    />
                    <Label>Send SMS</Label>
                </div>
                <div className='flex gap-2'>
                    <Checkbox
                        checked={withEmail}
                        onCheckedChange={(s) => setWithEmail(s as boolean)}
                    />
                    <Label>Send Email</Label>
                </div>
            </div>
        </div>

    )
}