'use client'

import { Button } from '@/components/custom/button'
import { SearchableGuestSelect } from '@/components/custom/searchable-guest-select'
import { MelHoursTabs } from '@/components/meal-hour-tabs'
import MealTabs from '@/components/meal-tabs'
import RoomTabs from '@/components/room-tabs'
import { TableSelect } from '@/components/table-select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/server/trpc/react'
import { useMemo, useState } from 'react'
import { ReservationDateCalendar } from '../../reservation/_components/reservation-date-calendar'
import { WaitlistRecord } from './waitlist-list'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { useToast } from '@/hooks/use-toast'
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal'

type Props = {
    open: boolean
    setOpen: (open: boolean) => void
    initialHour: string | undefined
    initialRoomId: number | undefined
    initialTableId: number | undefined
    waitlistData: WaitlistRecord
}

export const CreateWaitlistReservModal = ({
    open,
    setOpen,
    waitlistData,
    initialHour,
    initialRoomId,
    initialTableId
}: Props) => {

    const [date, setDate] = useState<Date>(waitlistData.waitlistDate)
    const [selectedMealId, setSelectedMealId] = useState<number | undefined>(waitlistData.mealId)
    const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>(initialRoomId)
    const [selectedTableId, setSelectedTableId] = useState<number | undefined>(initialTableId)
    const [guestCount, setGuestCount] = useState<number>(waitlistData.guestCount)
    const [selectedHour, setSelectedHour] = useState<string | undefined>(initialHour)
    const [withSms, setWithSms] = useState(true)
    const [withEmail, setWithEmail] = useState(true)

    const queryDate = useMemo(() => {
        const newDate = new Date(waitlistData.waitlistDate)
        newDate.setHours(0, 0, 0, 0)
        return newDate
    }, [date])

    const { data: avaliableTablesData } = api.reservation.getTableStatues.useQuery({
        date: queryDate,
        mealId: selectedMealId!,
    }, {
        enabled: [date, selectedMealId, selectedRoomId].every(Boolean),
        staleTime: 0
    })

    const currentTables = useMemo(() => {
        return avaliableTablesData?.find((t) => t.roomId === selectedRoomId)?.tables ?? []
    }, [avaliableTablesData, selectedRoomId])

    const queryClient = useQueryClient()
    const { toast } = useToast()

    const { mutate: createReservationFromWaitlist, isPending: isCreatingReservation } = api.waitlist.createReservationFromWaitlist.useMutation({
        onSuccess: () => {
            setOpen(false)
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.waitlist.getWaitlists) })
            toast({
                title: 'Reservation created successfully',
                description: 'Reservation created successfully',
            })
        }
    })

    const handleCreateReservation = () => {

        const isValid = [date, selectedMealId, selectedRoomId, selectedTableId, guestCount].every(Boolean)

        if (!isValid) return

        createReservationFromWaitlist({
            waitlistId: waitlistData.id,
            reservationData: {
                mealId: selectedMealId!,
                hour: selectedHour!,
                roomId: selectedRoomId!,
                guestCount,
                guestId: waitlistData.guestId,
                reservationDate: date,
                guestNote: waitlistData.guestNote ?? '',
                isSendSms: withSms,
                isSendEmail: withEmail,

                allergenWarning: waitlistData.allergenWarning,
            },
            data: {
                tableIds: [selectedTableId!],
                reservationTagIds: waitlistData.reservationTagIds.map(Number),
                waitlistId: waitlistData.id,

            }
        })
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-[95vw] md:max-w-[80vw]">
                <DialogHeader>
                    <DialogTitle>Create Reservation</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col w-full items-start">
                    <SearchableGuestSelect
                        value={waitlistData.guestId?.toString()}
                        isFormSelect={false}
                        disabled={true}
                    />
                    <ReservationDateCalendar date={date} setDate={setDate} disabled={true} />
                    <MealTabs
                        selectedMealId={selectedMealId}
                        setSelectedMealId={setSelectedMealId}
                        disabled={true}
                    />

                    <RoomTabs
                        selectedRoomId={selectedRoomId}
                        setSelectedRoomId={setSelectedRoomId}
                    />

                    <MelHoursTabs
                        selectedMealId={selectedMealId}
                        selectedHour={selectedHour}
                        setSelectedHour={setSelectedHour}
                    />
                    <div className='max-h-[400px] overflow-y-auto'>

                        <TableSelect
                            selectedTableId={selectedTableId}
                            setSelectedTableId={setSelectedTableId}
                            currentTables={currentTables}
                        />
                    </div>

                    <div className='flex items-center gap-2 w-full'>
                        <span>Guest Count</span>
                        <Input
                            type='number'
                            className='max-w-sm'
                            value={guestCount.toString()}
                            onChange={(e) => setGuestCount(Number(e.target.value))}
                        />
                    </div>


                    <div className="my-2 flex flex-wrap gap-2">
                        <div className='flex gap-2'>
                            <Checkbox
                                checked={withSms}
                                onCheckedChange={(s) => setWithSms(s as boolean)}
                            />
                            <Label>Send SMS</Label>
                        </div>
                        <div className='flex gap-2'>
                            <Checkbox
                                checked={withEmail}
                                onCheckedChange={(s) => setWithEmail(s as boolean)}
                            />
                            <Label>Send Email</Label>
                        </div>
                    </div>

                    <Button 
                    loading={isCreatingReservation}
                    className='flex' onClick={handleCreateReservation}>
                        Rezervasyon Oluştur
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}