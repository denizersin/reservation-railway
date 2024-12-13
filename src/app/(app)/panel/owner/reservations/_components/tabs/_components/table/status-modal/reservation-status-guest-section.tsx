import { TReservationRow } from '@/lib/reservation'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/custom/button'
import { useRouter } from 'next/navigation'
import GuestCrudModal from '@/app/(app)/panel/owner/guests/_components/guest-crud-modal'

type Props = {
    reservation: TReservationRow
}

export const ReservationStatusGuestSection = ({
    reservation
}: Props) => {

    const guest = reservation.guest;
    const router = useRouter()
    const handleGuestDetail = () => {
        router.push(`/panel/owner/guests/detail/${guest.id}`)
    }

    const [openGuestUpdateModal, setOpenGuestUpdateModal] = useState(false)

    const handleOpenGuestUpdateModal = () => {
        setOpenGuestUpdateModal(true)
    }

    const handleSearchOnGoogle = () => {
        window.open(`https://www.google.com/search?q=${guest.name} ${guest.surname}`, '_blank')
    }

    const goToReservationStatus = () => {
        // router.(`/reservation/status/${reservation.id}`)
        window.open(`/reservation/status/${reservation.id}`, '_blank')
    }

    const goToReviewStatus = () => {
        // router.(`/reservation/status/${reservation.id}`)
        window.open(`/reservation/review/${reservation.id}`, '_blank')
    }

    return (
        <div className='w-full max-w-full  flex flex-col items-center'>
            <Avatar className='size-32 '>
                {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
                <AvatarFallback>{guest.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className='text-lg font-bold'>{guest.name}</div>
            <div className='text-sm text-gray-500'>{guest.phone}</div>
            <div className='text-sm text-gray-500'>{guest.email}</div>

            <div className="mt-4 font-medium">{reservation.reservationDate.toLocaleDateString()}-{reservation.hour}</div>
            <div className="">{reservation.guestCount}</div>
            <div className="flex gap-x-2 mt-4">
                <Button onClick={handleGuestDetail} size={'sm'} variant='outline'>Detail</Button>
                <Button
                    onClick={handleOpenGuestUpdateModal}
                    size={'sm'} variant='outline'>Edit</Button>
            </div>
            <div className="">
                <Button onClick={handleSearchOnGoogle} className='text-blue-500' variant='link'>Search On Google</Button>
            </div>
            <div>
                reservation Id: {reservation.id}
            </div>
            <div>
                <Button
                    className='text-blue-500'
                    onClick={goToReservationStatus} variant='link'>Go Reservation Status </Button>

                <Button
                    className='text-blue-500'
                    onClick={goToReviewStatus} variant='link'>Go Review Status </Button>
            </div>

            <GuestCrudModal
                open={openGuestUpdateModal}
                setOpen={setOpenGuestUpdateModal}

                // guestData={guest}
                guestId={guest.id}
            />
        </div>
    )
}
