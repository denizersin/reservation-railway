'use client'
import { ReservationDateCalendar } from '@/app/(app)/owner/reservation/_components/reservation-date-calendar';
import { TableStatues } from '@/app/(app)/owner/reservation/_components/table-statues';
import { Button } from '@/components/custom/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMutationCallback } from '@/hooks/useMutationCallback';
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal';
import { TReservationRow, TStatusTableRow } from '@/lib/reservation';
import { cn } from '@/lib/utils';
import { TReservation, TRestaurantMeal, TRoomWithTranslations } from '@/server/db/schema';
import { api } from '@/server/trpc/react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';


type Props = {
    isOpen: boolean
    setOpen: (open: boolean) => void
    reservation: TReservationRow
}

export const UpdateReservationTmeModal = ({
    isOpen,
    setOpen,
    reservation
}: Props) => {
    const [selectedTableId, setSelectedTableId] = useState<number | undefined>(undefined)
    const [selectedRoom, setSelectedRoom] = useState<TRoomWithTranslations | undefined>(undefined)
    const [selectedMeal, setSelectedMeal] = useState<TRestaurantMeal | undefined>()
    const [guestCount, setGuestCount] = useState<number>(reservation.guestCount)

    

    const [date, setDate] = useState<Date>(reservation.reservationDate)

    const [statusTableRow, setStatusTableRow] = useState<TStatusTableRow | undefined>(undefined)


    const [selectedHour, setSelectedHour] = useState<string | undefined>(undefined)

    const { onSuccessReservationUpdate } = useMutationCallback()




    const {
        mutate: updateReservationTime,
        isPending: updateReservationTimePending,
    } = api.reservation.updateReservationTime.useMutation({
        onSuccess: () => {
            onSuccessReservationUpdate(reservation.id)
        }
    })

    const handleUpdateReservation = () => {
        const hour = selectedHour || reservation.hour
        const newDate = new Date(date)
        newDate.setHours(
            Number(hour.split(':')[0]),
            Number(hour.split(':')[1]),
            0,
            0
        )
        updateReservationTime({
            reservationId: reservation.id,
            data: {
                guestCount,
                reservationDate: newDate,
                hour
            }
        })

    }

    const queryDate = useMemo(() => {
        const newDate = new Date(date)
        newDate.setHours(0, 0, 0, 0)
        return newDate.toISOString()
    }, [date])

    const { data: availableTableData,
        isLoading: availableTableLoading
    } = api.reservation.getAllAvailableReservation2.useQuery({
        date: queryDate,
        mealId: reservation.mealId
    }, {
        staleTime: 0
    })

    const tableStatues = availableTableData?.tableStatues
    const roomTableStatues = tableStatues?.find(r => r.roomId === reservation.roomId)
    // const hourTables = roomTableStatues?.statues.find((hour) => hour.hour === reservation.hour)?.tables


    useEffect(() => {
        if (availableTableData) {
            const r = availableTableData.tableStatues
                .find(r => r.roomId === reservation.roomId)?.statues
                .find(h => h.hour === reservation.hour)?.tables
                .find(t => t.reservation?.id === reservation.id)

            setStatusTableRow(r)
        }
    }, [availableTableData])



    useShowLoadingModal([updateReservationTimePending, availableTableLoading])
    const isDateChanged = format(date, 'dd-MM-yyyy') !== format(reservation.reservationDate, 'dd-MM-yyyy')
    const isHourChanged = Boolean(selectedHour) && (selectedHour !== reservation.hour)
    const isGuestCountChanged = guestCount !== reservation.guestCount
    const isChanged = isDateChanged || isHourChanged || isGuestCountChanged

    const hasAnyAvailableTable = roomTableStatues?.statues.some((hour) => hour.tables.some((table) => !table.reservation))

    const isSameTableNotAvailable = roomTableStatues?.statues
        .some((hour) => hour.tables
            .some((table) =>
                table.reservation &&
                table.reservation.id !== reservation.id &&
                reservation.tables.some((rt) => rt.tableId == table.table?.id)
            ))






    console.log(isSameTableNotAvailable, 'isSameTableNotAvailable')

    const isChangedAndisAvailable = isChanged && hasAnyAvailableTable




    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className='max-w-[90vw]'>
                <DialogHeader>
                    <DialogTitle>{statusTableRow?.guest?.name}</DialogTitle>
                    <DialogTitle>{statusTableRow?.reservation?.reservationDate?.toDateString()}</DialogTitle>
                </DialogHeader>




                <Button
                    disabled={!isChangedAndisAvailable}
                    loading={updateReservationTimePending}
                    onClick={handleUpdateReservation}
                >
                    UPDATE
                </Button>




            </DialogContent>
        </Dialog>
    )
}