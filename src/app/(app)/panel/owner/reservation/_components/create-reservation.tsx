'use client'
import { Button } from '@/components/custom/button';
import { MultiSelect } from '@/components/custom/multi-select';
import { SearchableGuestSelect } from '@/components/custom/searchable-guest-select';
import MealTabs from '@/components/meal-tabs';
import RoomTabs from '@/components/room-tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useMutationCallback } from '@/hooks/useMutationCallback';
import { api } from '@/server/trpc/react';
import { getEnumValues } from '@/server/utils/server-utils';
import { EnumReservationPrepaymentNumeric, EnumReservationPrepaymentType } from '@/shared/enums/predefined-enums';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GuestCrudModal from '../../guests/_components/guest-crud-modal';
import { ReservationDateCalendar } from './reservation-date-calendar';
import { TableStatues2 } from './v2/table-statues2';

type Props = {}

export const CreateReservation = (props: Props) => {

    const [isCreateGuestModalOpen, setIsCreateGuestModalOpen] = useState(false)





    const { data: tags } = api.restaurant.getTags.useQuery()

    const tagsToSelect = useMemo(() => {
        return tags?.data.map((tag) => ({
            value: String(tag.id),
            label: tag.translations[0]?.name!
        })) ?? []
    }, [tags])





    const [selectedGuestId, setSelectedGuestId] = useState<number | null>(2)




    const [date, setDate] = useState<Date>(new Date())
    const [selectedMealId, setSelectedMealId] = useState<number | undefined>(undefined)
    const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>(undefined)
    const [selectedTableId, setSelectedTableId] = useState<number | undefined>(undefined)
    const [guestCount, setGuestCount] = useState<number>(0)

    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])

    const [selectedHour, setSelectedHour] = useState<string | undefined>(undefined)

    const [isSendSms, setIsSendSms] = useState<boolean>(true);
    const [isSendEmail, setIsSendEmail] = useState<boolean>(true);
    const [reservationNote, setReservationNote] = useState('')
    const [selectedPrePaymentTypeId, setSelectedPrePaymentTypeId] = useState<number>(EnumReservationPrepaymentNumeric.prepayment)


    const [customPrepaymentAmount, setCustomPrepaymentAmount] = useState<number | undefined>(undefined)

    const [defineCustomPrepaymentAmount, setDefineCustomPrepaymentAmount] = useState(false)

    const [guestNote, setGuestNote] = useState('')

    //!TODO mutation callback
    const { onSuccessCreateReservation } = useMutationCallback()

    const {
        mutate: createReservation,
        mutateAsync: createReservationAsync,
        isPending: createReservationPending,
    } = api.reservation.createMockReservation.useMutation({
        onSuccess: () => {
            onSuccessCreateReservation(date)
            setSelectedTableId(undefined)
            setIsSendEmail(true)
            setIsSendSms(true)
            setSelectedTagIds([])
        }
    })

    const handleCreateReservation = () => {
        console.log(selectedHour, selectedMealId, selectedRoomId, selectedTableId, guestCount)
        if (!selectedGuestId || !selectedRoomId || !selectedMealId || !selectedTableId || !selectedHour || !guestCount) {
            return
        }
        const newDate = new Date(date)
        newDate.setHours(
            Number(selectedHour.split(':')[0]),
            Number(selectedHour.split(':')[1]),
            0,
            0
        )

        console.log(newDate, 'sendDate')

        createReservation({
            reservationData: {
                guestId: selectedGuestId,
                roomId: selectedRoomId,
                guestCount: guestCount,
                reservationDate: newDate,
                hour: selectedHour,
                mealId: selectedMealId,
                prepaymentTypeId: selectedPrePaymentTypeId,
                isSendSms: isSendSms,
                isSendEmail: isSendEmail,
                guestNote: guestNote,


            },
            data: {
                reservationTagIds: selectedTagIds,
                tableIds: [selectedTableId],
                reservationNote: reservationNote,
                customPrepaymentAmount: defineCustomPrepaymentAmount ? customPrepaymentAmount : undefined,
            }
        })
    }







    useEffect(() => {
        setSelectedTableId(undefined)
    }, [selectedRoomId, selectedMealId, date])






    const prePaymentTypes = useMemo(() => {
        return getEnumValues(EnumReservationPrepaymentType).map((v) => ({
            value: String(EnumReservationPrepaymentNumeric[v]),
            label: v
        }))
    }, [])




    return (
        <div>
            <div className='flex'>
                <SearchableGuestSelect
                    value={selectedGuestId?.toString()}
                    onValueChange={(value) => setSelectedGuestId(Number(value))}
                    isFormSelect={false}
                />
                <Button variant={'link'} onClick={() => setIsCreateGuestModalOpen(true)}>Create Guest</Button>
            </div>


            <ReservationDateCalendar date={date} setDate={setDate} />

            <MealTabs
                selectedMealId={selectedMealId}
                setSelectedMealId={setSelectedMealId}
            />

            <RoomTabs
                selectedRoomId={selectedRoomId}
                setSelectedRoomId={setSelectedRoomId}
            />

            {

                <TableStatues2
                    selectedTableId={selectedTableId}
                    setSelectedTableId={setSelectedTableId}
                    date={date}
                    selectedRoomId={selectedRoomId}
                    selectedMealId={selectedMealId}
                    selectedHour={selectedHour}
                    setSelectedHour={setSelectedHour}
                    guestCount={guestCount}
                    setGuestCount={setGuestCount}
                />
            }



            <div className='flex flex-col md:flex-row gap-x-5 '>


                <div className='flex-1'>
                    <MultiSelect
                        className='max-w-sm my-2'
                        options={tagsToSelect}
                        onValueChange={(value) => {
                            setSelectedTagIds(value.map((v) => Number(v)))
                            console.log(value, 'value23')
                        }}
                        value={selectedTagIds.map((tagId) => String(tagId))}
                    />


                    <div className="my-2">
                        <Textarea
                            value={reservationNote}
                            onChange={(e) => setReservationNote(e.target.value)}
                            placeholder="Reservation Note"
                        />
                    </div>
                    <div className="my-2">
                        <Textarea
                            value={guestNote}
                            onChange={(e) => setGuestNote(e.target.value)}
                            placeholder="Guest Note"
                        />
                    </div>
                </div>
                <div className='flex-1'>
                    <div className="text-lg font-bold text-center">Payment</div>

                    <div className="my-4">
                        {/* <div className="text-lg font-bold">Prepayment Type</div> */}
                        <div className="flex flex-col">
                            <div className="my-4">
                                <RadioGroup value={String(selectedPrePaymentTypeId)} onValueChange={(value) => {
                                    setSelectedPrePaymentTypeId(Number(value))
                                    setDefineCustomPrepaymentAmount(false)
                                }}>
                                    <div className="flex gap-x-4 flex-wrap">
                                        {prePaymentTypes.map((type) => (
                                            <div key={type.value} className="flex items-center">
                                                <RadioGroupItem key={type.value} value={type.value} id={`prepayment-${type.value}`}>
                                                </RadioGroupItem>
                                                <span className="ml-2">{type.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                        {
                            selectedPrePaymentTypeId !== EnumReservationPrepaymentNumeric['none'] &&
                            <div>
                                {<Checkbox
                                    checked={defineCustomPrepaymentAmount}
                                    onCheckedChange={(checked) => setDefineCustomPrepaymentAmount(checked ? true : false)}
                                />}
                                <label className="ml-2">Define Custom Prepayment Amount</label>
                                {defineCustomPrepaymentAmount && <Input
                                    className='max-w-sm my-2'
                                    value={customPrepaymentAmount}
                                    onChange={(e) => setCustomPrepaymentAmount(Number(e.target.value) || 0)}
                                />}
                            </div>
                        }


                        <div className="flex items-center gap-x-3 my-2 mt-6">
                            <Checkbox

                                checked={isSendSms}
                                onCheckedChange={(checked) => setIsSendSms(checked ? true : false)}
                            />
                            <label className="ml-2">Send SMS</label>

                            <Checkbox
                                checked={isSendEmail}
                                onCheckedChange={(checked) => setIsSendEmail(checked ? true : false)}
                            />
                            <label className="ml-2">Send Email</label>
                        </div>
                    </div>
                </div>
            </div>

            <Button
                loading={createReservationPending}
                onClick={handleCreateReservation}
            >
                Create Reservation
            </Button>


            {isCreateGuestModalOpen && <GuestCrudModal
                open={isCreateGuestModalOpen}
                setOpen={setIsCreateGuestModalOpen}
            />}



        </div>
    )
}
