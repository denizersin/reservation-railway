'use client'
import { ReservationDateCalendar } from '@/app/(app)/owner/reservation/_components/reservation-date-calendar';
import { Button } from '@/components/custom/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal';
import { TReservationRow, TStatusTableRow } from '@/lib/reservation';
import { cn } from '@/lib/utils';
import { TReservation } from '@/server/db/schema';
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


    const queryClient = useQueryClient();

    const [statusTableRow, setStatusTableRow] = useState<TStatusTableRow | undefined>(undefined)

    const [date, setDate] = useState<Date>(reservation.reservationDate)
    const [guestCount, setGuestCount] = useState<number>(reservation.guestCount)


    const [selectedHour, setSelectedHour] = useState<string | undefined>(undefined)



    const {
        mutate: updateReservation,
        isPending: updateReservationPending,
    } = api.reservation.updateReservation.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getReservations)
            })
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getAllAvailableReservation2)
            })
            
        }
    })

    const handleCreateReservation = () => {
        const hour = selectedHour || reservation.hour
        const newDate = new Date(date)
        newDate.setHours(
            Number(hour.split(':')[0]),
            Number(hour.split(':')[1]),
            0,
            0
        )
        updateReservation({
            reservationId: reservation.id,
            data: {
                guestCount: guestCount,
                reservationDate: newDate,
                hour: selectedHour,
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



    useShowLoadingModal([updateReservationPending, availableTableLoading])
    const isDateChanged = format(date, 'dd-MM-yyyy') !== format(reservation.reservationDate, 'dd-MM-yyyy')
    const isHourChanged = Boolean(selectedHour) && (selectedHour !== reservation.hour)
    const isGuestCountChanged = guestCount !== reservation.guestCount
    const isChanged = isDateChanged || isHourChanged || isGuestCountChanged

    const hasAnyAvailableTable = roomTableStatues?.statues.some((hour) => hour.tables.some((table) => !table.reservation))

    const isChangedAndisAvailable = isChanged && hasAnyAvailableTable




    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className='max-w-[90vw]'>
                <DialogHeader>
                    <DialogTitle>{statusTableRow?.guest?.name}</DialogTitle>
                    <DialogTitle>{statusTableRow?.reservation?.reservationDate?.toDateString()}</DialogTitle>
                </DialogHeader>

                <ReservationDateCalendar date={date} setDate={setDate} />


                <div className='flex gap-x-2 my-2'>
                    {
                        roomTableStatues?.statues?.map((hourStatus) => {

                            const isCurrentReservationHour = hourStatus.hour === reservation.hour
                            const isSelectedHour = selectedHour === hourStatus.hour

                            const isHourNotAvailable = hourStatus.tables.every((table) => table.reservation)

                            const disabled = isCurrentReservationHour ||
                                (
                                    isDateChanged &&
                                    isHourNotAvailable
                                )
                            return (
                                <div
                                    onClick={() => {
                                        if (disabled) {
                                            return
                                        }
                                        if (isSelectedHour) {
                                            setSelectedHour(undefined)

                                        } else {
                                            setSelectedHour(hourStatus.hour)
                                        }
                                    }}

                                    key={hourStatus.hour} className={cn('flex flex-col shadow-md p-2 rounded-md px-4 bg-secondary hover:bg-secondary/20 cursor-pointer', {
                                        'bg-primary text-primary-foreground hover:bg-primary ': isCurrentReservationHour,
                                        'bg-green-400 text-black hover:bg-green-400 ': isSelectedHour,
                                        'opacity-80 cursor-not-allowed ': disabled,
                                        'bg-red-400 text-black hover:bg-red-400 ': isHourNotAvailable
                                    })}>
                                    <h1>{hourStatus.hour}</h1>
                                    <h2> {hourStatus.limitationStatus?.avaliableGuest}</h2>

                                </div>
                            )
                        }
                        )
                    }
                </div>
                <div>
                    <div className='max-w-xs'>
                        <Input
                            placeholder='Guest Count'
                            type='number'
                            value={guestCount.toString()}
                            onChange={(e) => setGuestCount(Number(e.target.value))}
                        />
                    </div>


                    <Button
                        disabled={!isChangedAndisAvailable}
                        loading={updateReservationPending}
                        onClick={handleCreateReservation}
                    >
                        UPDATE
                    </Button>
                </div>

                {
                    isChanged&& <div className='text-red-500'>
                        <div>
                            Yeni rezervasyon tarihi ve saati: {format(date, 'dd-MM-yyyy')} {selectedHour}
                        </div>
                        kişi sayısı: {guestCount}
                    </div>
                }
                {
                    !hasAnyAvailableTable && <div className='text-red-500'>
                        Bu tarihte uygun masa bulunmamaktadır
                    </div>
                }






            </DialogContent>
        </Dialog>
    )
}