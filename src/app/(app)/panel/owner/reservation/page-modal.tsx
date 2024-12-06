import { Dialog, DialogContent } from '@/components/ui/dialog'
import React from 'react'
import { CreateReservation } from './_components/create-reservation'

type Props = {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}

export const CreateReservationPageModal = ({
    isOpen,
    setIsOpen,
}: Props) => {
    return (
        <Dialog
        
        open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className='w-screen h-screen max-w-screen max-h-screen'>
                <CreateReservation />
            </DialogContent>
        </Dialog>
    )
}