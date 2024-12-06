import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TGuest } from '@/server/db/schema/guest'
import GuestCrudContent from './guest-crud-content'


type Props = {
    open: boolean,
    setOpen: (open: boolean) => void
    guestData?: TGuest,
    guestId?: number
    onSucsesCreateGuest?: (newGuestId: number) => void
    onSucsesUpdateGuest?: () => void

}

const GuestCrudModal = ({
    open,
    setOpen,
    guestData,
    guestId,
    onSucsesCreateGuest,
    onSucsesUpdateGuest
}: Props) => {



    const isUpdate = !!guestId || !!guestData

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='max-h-[90vh] overflow-y-auto max-w-[800px]'>
                <DialogHeader>
                    <DialogTitle>{isUpdate ? 'Update Guest' : 'Create Guest'}</DialogTitle>
                </DialogHeader>
                <GuestCrudContent
                    guestData={guestData}
                    guestId={guestId}
                    onSucsesCreateGuest={onSucsesCreateGuest}
                    onSucsesUpdateGuest={onSucsesUpdateGuest}
                />
            </DialogContent>
        </Dialog>
    )
}

export default GuestCrudModal