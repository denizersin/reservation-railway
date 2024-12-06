import { SearchableGuestSelect } from '@/components/custom/searchable-guest-select'
import React, { useState } from 'react'
import GuestCrudModal from '../../../guests/_components/guest-crud-modal'
import { Button } from '@/components/custom/button'
import { api } from '@/server/trpc/react'
import GuestCrudContent from '../../../guests/_components/guest-crud-content'
import { GuestGeneralInformation } from '../../../guests/detail/[id]/_components/guest-general-information'
import { CurrentGuestDetail } from './current-guest-detail'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'

type Props = {

    selectedGuestId: number | undefined
    setSelectedGuestId: (id: number | undefined) => void
    guestNote: string
    setGuestNote: (note: string) => void
    reservationNote: string
    setReservationNote: (note: string) => void

}

export const GuestSelection = ({
    selectedGuestId,
    setSelectedGuestId,
    guestNote,
    setGuestNote,
    reservationNote,
    setReservationNote
}: Props) => {
    const [isCreateNewGuestModalOpen, setIsCreateNewGuestModalOpen] = useState(false)

    const { data: guestDetail } = api.guest.getGuestDetail.useQuery({
        guestId: selectedGuestId!
    }, {
        enabled: Boolean(selectedGuestId)
    })

    const queryClient = useQueryClient()
    const invalidateGuestDetail = () => {
        queryClient.invalidateQueries({ queryKey: getQueryKey(api.guest.getGuestDetail, { guestId: selectedGuestId },'query') })
    }
    const onSucsesCreateGuest = (newGuestId: number) => {
        setIsCreateNewGuestModalOpen(false)
        setSelectedGuestId(newGuestId)
        invalidateGuestDetail()
    }





    return (
        <div className='w-full'>

            <div className=' mb-2'>
                <SearchableGuestSelect
                    value={selectedGuestId?.toString()}
                    onValueChange={(value) => setSelectedGuestId(Number(value))}
                    isFormSelect={false}
                />
                <Button variant={'link'} onClick={() => setIsCreateNewGuestModalOpen(true)}>Create Guest</Button>
            </div>


            {selectedGuestId && <CurrentGuestDetail selectedGuestId={selectedGuestId} setGuestNote={setGuestNote} setReservationNote={setReservationNote} />}
            {
                isCreateNewGuestModalOpen && <GuestCrudModal
                    open={isCreateNewGuestModalOpen}
                    setOpen={setIsCreateNewGuestModalOpen}
                    onSucsesCreateGuest={onSucsesCreateGuest}
                />
            }

        </div>
    )
}