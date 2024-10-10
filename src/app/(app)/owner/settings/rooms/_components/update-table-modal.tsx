import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TTable } from '@/server/db/schema/room'

type Props = {
    isOpen: boolean,
    setOpen: (value: boolean) => void,
    table: TTable
}

const UpdateTableModal = ({ isOpen, setOpen }: Props) => {




    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Register New User</DialogTitle>
                </DialogHeader>

            </DialogContent>
        </Dialog>
    )
}

export default UpdateTableModal