import { ConfirmModalGlobal } from "@/components/modal/confirm-modal"
import { Button } from "@/components/ui/button"
import { useMutationCallback } from "@/hooks/useMutationCallback"
import { TReservationRow } from "@/lib/reservation"
import { api } from "@/server/trpc/react"
import { Search, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
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
        router.push(`/panel/owner/reservation/detail/${reservation.id}`)
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