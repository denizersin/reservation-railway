import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "./use-toast"
import { getQueryKey } from "@trpc/react-query"
import { api } from "@/server/trpc/react"
import { useReservationsContext } from "@/app/(app)/owner/reservations/page"

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
                queryKey: getQueryKey(api.guest.getAllGuests)
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
                queryKey: getQueryKey(api.reservation.getAllAvailableReservation2, {
                    date: queryDate
                })
            })


        },
        onSuccessCreateReservation: (date: Date) => {

            const createdQueryDate = new Date(date)
            createdQueryDate.setHours(0, 0, 0, 0)


            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getAllAvailableReservation2, {
                    date: createdQueryDate.toISOString()
                })
            })
        },

        onUpdateReservationLimitations: () => { }
    }
}