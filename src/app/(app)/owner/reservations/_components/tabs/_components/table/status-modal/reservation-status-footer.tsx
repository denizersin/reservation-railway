import { Button } from "@/components/ui/button"
import { TReservationRow } from "@/lib/reservation"
import { useRouter } from "next/navigation"
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Search, Trash } from "lucide-react"
import { useMutationCallback } from "@/hooks/useMutationCallback"
import { api } from "@/server/trpc/react"
import { ConfirmModalGlobal } from "@/components/modal/confirm-modal"
type Props = {
    reservation: TReservationRow
}

export const ReservationStatusFooter = ({ reservation }: Props) => {
    const { onSuccessReservationUpdate } = useMutationCallback()

    const router = useRouter()

    const { mutateAsync: deleteReservation, isPending: isDeleteReservationPending } = api.reservation.deleteReservation.useMutation({
        onSuccess: () => onSuccessReservationUpdate(reservation.id)
    })

    const onClickDetaul = () => {
        router.push(`/owner/reservation/detail/${reservation.id}`)
    }

    const handleDeleteReservation = async () => {
        ConfirmModalGlobal.show({
            type: "delete",
            title: "Delete Reservation",
            onConfirm: async () => {
                await deleteReservation({
                    reservationId: reservation.id
                })
            }
        })
    }

    return (
        <div className="mt-auto flex-1 justify-end flex flex-col">
            <div className="flex gap-x-4">
                <div className="flex items-center space-x-2">
                    <Checkbox disabled checked={reservation.isSendEmail} id="checkbox1" />
                    <Label htmlFor="checkbox1">Send Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox disabled checked={reservation.isSendSms} id="checkbox2" />
                    <Label htmlFor="checkbox2">Send SMS</Label>
                </div>
            </div>
            <div className="flex gap-3 flex-wrap mt-3 justify-end">
                <Button
                    onClick={onClickDetaul}
                    size={'icon'}
                    variant={'outline'}
                    className="size-8"
                >
                    <Search className="size-4" />
                </Button>

                <Button
                size={'icon'}
                    onClick={handleDeleteReservation}
                    disabled={isDeleteReservationPending}
                    className="size-8"
                    variant={'destructive'}>
                    <Trash className="size-4" />
                    </Button>
            </div>
        </div>
    )
}