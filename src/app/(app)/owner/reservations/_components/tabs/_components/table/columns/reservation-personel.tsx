
import { Button } from '@/components/custom/button'
import { CustomSelect } from '@/components/custom/custom-select'
import { usePersonalSelectData } from '@/hooks/predefined/predfined'
import { useToast } from '@/hooks/use-toast'
import { useMutationCallback } from '@/hooks/useMutationCallback'
import { TReservationRow } from '@/lib/reservation'
import { api } from '@/server/trpc/react'
import React, { useState } from 'react'

type Props = {
    reservation: TReservationRow
}

export const ReservationPersonel = ({ reservation }: Props) => {

    const { selectData, isLoading } = usePersonalSelectData()

    const [selectedPersonalId, setSelectedPersonalId] = useState(reservation.assignedPersonalId)


    const { onSuccessReservationUpdate } = useMutationCallback()

    const { toast } = useToast();

    const {
        mutate: updateReservationAssignedPersonal,
        isPending: isUpdatingReservationAssignedPersonal
    } = api.reservation.updateReservationAssignedPersonal.useMutation({
        onSuccess: () => {
            onSuccessReservationUpdate(reservation.id)
            toast({
                title: 'Reservation updated',
                description: 'Reservation assigned personal updated',
            })
        }
    })

    function handleUpdateReservationAssignedPersonal() {
        updateReservationAssignedPersonal({
            reservationId: reservation.id,
            assignedPersonalId: selectedPersonalId
        })
    }

    return (
        <div className='flex items-center gap-2 my-1'>
            <CustomSelect
                selectTriggerClass='max-w-[200px]'
                value={String(selectedPersonalId)}
                data={selectData}
                onValueChange={(v) => {
                    if (v == 'none') {
                        setSelectedPersonalId(null)
                    } else {
                        setSelectedPersonalId(Number(v))
                    }
                }}
                isFormSelect={false}
            />
            <Button
                variant={'outline'}
                loading={isUpdatingReservationAssignedPersonal}
                disabled={isUpdatingReservationAssignedPersonal}
                onClick={handleUpdateReservationAssignedPersonal}>Update Personal</Button>
        </div>
    )
}