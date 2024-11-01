'use client'
import { Button } from '@/components/custom/button';
import { CustomComboSelect } from '@/components/custom/custom-combo-select';
import { MultiSelect } from '@/components/custom/multi-select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TRestaurantMeal } from '@/server/db/schema/restaurant-assets';
import { TRoomWithTranslations } from '@/server/db/schema/room';
import { api } from '@/server/trpc/react';
import { EnumReservationPrepaymentNumeric, EnumReservationPrepaymentType } from '@/shared/enums/predefined-enums';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { useEffect, useMemo, useState } from 'react';
import GuestCrudModal from '../../guests/_components/guest-crud-modal';
import { ReservationDateCalendar } from './reservation-date-calendar';
import { TableStatues } from './table-statues';
import { Textarea } from '@/components/ui/textarea';
import { getEnumValues } from '@/server/utils/server-utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

type Props = {}

export const CreateReservation = (props: Props) => {


    const queryClient = useQueryClient();

    const [isCreateGuestModalOpen, setIsCreateGuestModalOpen] = useState(false)


    const { data: meals } = api.restaurant.getRestaurantMeals.useQuery()

    const { data: roomsData } = api.room.getRooms.useQuery({})



    const { data } = api.guest.getAllGuests.useQuery({
        page: 1,
        limit: 100,
    })

    const { data: tags } = api.restaurant.getTags.useQuery()

    const tagsToSelect = useMemo(() => {
        return tags?.data.map((tag) => ({
            value: String(tag.id),
            label: tag.translations[0]?.name!
        })) ?? []
    }, [tags])



    const guestToSelect = useMemo(() => {
        return data?.data.map((guest) => ({
            value: String(guest.id),
            label: guest.name
        })) ?? []
    }, [data])

    const [selectedGuestId, setSelectedGuestId] = useState<number | null>(null)




    const [date, setDate] = useState<Date>(new Date())
    const [selectedMeal, setSelectedMeal] = useState<TRestaurantMeal | undefined>(meals?.[0])
    const [selectedRoom, setSelectedRoom] = useState<TRoomWithTranslations | undefined>(roomsData?.[0])
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


    const {
        mutate: createReservation,
        isPending: createReservationPending,
    } = api.reservation.createMockReservation.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getReservations)
            })
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getAllAvailableReservation2)
            })
            setSelectedTableId(undefined)
            setIsSendEmail(true)
            setIsSendSms(true)
            setSelectedTagIds([])
        }
    })

    const handleCreateReservation = () => {
        if (!selectedGuestId || !selectedRoom || !selectedMeal || !selectedTableId || !selectedHour || !guestCount) {
            return
        }
        const newDate = new Date(date)
        newDate.setHours(
            Number(selectedHour.split(':')[0]),
            Number(selectedHour.split(':')[1]),
            0,
            0
        )

        createReservation({
            reservationData: {
                guestId: selectedGuestId,
                roomId: selectedRoom.id,
                guestCount: guestCount,
                reservationDate: newDate,
                hour: selectedHour,
                mealId: selectedMeal.mealId,
                prepaymentId: selectedPrePaymentTypeId,
                isSendSms: isSendSms,
                isSendEmail: isSendEmail,
                guestNote: guestNote,

            },
            data: {
                reservationTagIds: selectedTagIds,
                tableIds: [selectedTableId],
                reservationNote: reservationNote,
            }
        })
    }





    //turn them to reducer
    useEffect(() => {
        setSelectedRoom(roomsData?.[0]);
    }, [roomsData])

    useEffect(() => {
        setSelectedMeal(meals?.[0]);
    }, [meals])

    useEffect(() => {
        setSelectedTableId(undefined)
    }, [selectedRoom, selectedMeal, date])






    const prePaymentTypes = useMemo(() => {
        return getEnumValues(EnumReservationPrepaymentType).map((v) => ({
            value: String(EnumReservationPrepaymentNumeric[v]),
            label: v
        }))
    }, [])




    return (
        <div>
            <div className='flex'>
                <CustomComboSelect
                    isFormSelect={false}
                    data={guestToSelect}
                    value={selectedGuestId?.toString()}
                    onValueChange={(value) => setSelectedGuestId(Number(value))}
                />
                <Button variant={'link'} onClick={() => setIsCreateGuestModalOpen(true)}>Create Guest</Button>
            </div>


            <ReservationDateCalendar date={date} setDate={setDate} />

            <Tabs
                onValueChange={(value) => setSelectedMeal(meals?.find((meal) => meal.id.toString() === value))}
                defaultValue={selectedMeal?.id.toString()} className="w-[400px]">
                <TabsList>
                    {meals?.map((meal) => (
                        <TabsTrigger key={meal.id} value={meal.id.toString()}>{meal.meal.name}</TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <Tabs
                onValueChange={(value) => setSelectedRoom(roomsData?.find((room) => room.id.toString() === value))}
                defaultValue={selectedRoom?.id.toString()}
                value={selectedRoom?.id.toString()}
                className="mt-5">
                <TabsList>
                    {roomsData?.map((room) => (
                        <TabsTrigger key={room.id} value={room.id.toString()}>{room.translations[0]?.name}</TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {

                <TableStatues
                    selectedTableId={selectedTableId}
                    setSelectedTableId={setSelectedTableId}
                    date={date}
                    selectedRoom={selectedRoom!}
                    selectedMeal={selectedMeal!}
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
                                <RadioGroup value={String(selectedPrePaymentTypeId)} onValueChange={(value) => setSelectedPrePaymentTypeId(Number(value))}>
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
                        <div>
                            <Checkbox
                                checked={defineCustomPrepaymentAmount}
                                onCheckedChange={(checked) => setDefineCustomPrepaymentAmount(checked ? true : false)}
                            />
                            <label className="ml-2">Define Custom Prepayment Amount</label>
                            {
                                defineCustomPrepaymentAmount && <Input
                                    className='max-w-sm my-2'
                                    value={customPrepaymentAmount}
                                    onChange={(e) => setCustomPrepaymentAmount(Number(e.target.value) || 0)}
                                />
                            }
                        </div>

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
