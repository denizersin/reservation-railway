import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "./use-toast"
import { getQueryKey } from "@trpc/react-query"
import { api } from "@/server/trpc/react"
import { useReservationsContext } from "@/app/(app)/panel/owner/reservations/page"

export const useMutationCallback = () => {
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const { queryDate } = useReservationsContext()

    return {
        onSuccessGuestCrud: (guestId: number) => {
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.guest.getGuestDetail, {
                    guestId: guestId
                })
            })
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.guest.getGuestsPagination)
            })

        },
        onSuccessReservationUpdate: (reservationId: number) => {



            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getReservationDetail, {
                    reservationId: reservationId,

                })
            })
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getReservations, {
                    date: queryDate,


                })
            })

            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getTableStatues, {
                    date: queryDate
                })
            })


        },
        onSuccessCreateReservation: (date: Date) => {



            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getTableStatues, {
                    date,
                })
            })
        },

        onUpdateReservationLimitations: () => { }
    }
}