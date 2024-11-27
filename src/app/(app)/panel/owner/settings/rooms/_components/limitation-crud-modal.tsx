import { CustomSelect } from '@/components/custom/custom-select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { TReservationLimitation } from '@/server/db/schema/resrvation_limitation'
import { api } from '@/server/trpc/react'
import { DaysToSelect } from '@/shared/enums/predefined-enums'
import TLimitationValidator, { limitationValidator } from '@/shared/validators/reservation-limitation/inex'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

type Props = {
    isOpen: boolean
    setOpen: (value: boolean) => void,
    limitationData?: TReservationLimitation
}

const LimitationCrudModal = ({
    isOpen,
    setOpen,
    limitationData
}: Props) => {
    const isUpdate = Boolean(limitationData)
    const queryClient = useQueryClient();
    const onSuccsessCrud = () => {
        setOpen(false)
        form.reset()
        queryClient.invalidateQueries({
            queryKey: getQueryKey(api.reservation.getReservationLimitations)
        })
    }
    const {
        mutate: createLimitation,
        isPending: isCreating
    } = api.reservation.createReservationLimitation.useMutation({
        onSuccess: onSuccsessCrud
    })

    const {
        mutate: updateLimitation,
        isPending: isUpdating
    } = api.reservation.updateReservationLimitation.useMutation({
        onSuccess: onSuccsessCrud
    })

    const { data: restaurantMeals } = api.restaurant.getRestaurantMeals.useQuery()
    const { data: restaurantRooms } = api.room.getRooms.useQuery({})

    const restaurantMealsSelect = useMemo(() => restaurantMeals?.map(rsMeal => ({
        label: rsMeal.meal.name,
        value: String(rsMeal.mealId)
    })), [restaurantMeals]) || []

    const restaurantRoomsSelect = useMemo(() => restaurantRooms?.map(rsRoom => ({
        label: rsRoom.translations[0]?.name ?? '',
        value: String(rsRoom.id)
    })), [restaurantRooms]) || []



    


    const form = useForm<TLimitationValidator.createLimitationSchema>({
        resolver: zodResolver(limitationValidator.createLimitationSchema),
    })

    const onSubmit = (data: TLimitationValidator.createLimitationSchema) => {

        if (limitationData) {
            updateLimitation({
                data,
                limitationId: limitationData.id
            })
        } else {
            createLimitation(data)
        }
    }


    const { data: mealHoursData } = api.restaurant.getRestaurantMealHours.useQuery({})
    const hours = mealHoursData?.find((hourData) => hourData.meal.id === form.getValues().mealId)?.mealHours || [];

    const parsedHours=hours.map(hour=>({
        label:hour.hour,
        value:hour.hour
    }))

    console.log(hours,'hours')

    useEffect(() => {
        if (limitationData) {
            form.reset({
                ...limitationData,
            })
        }
    }, [limitationData])


    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isUpdate ? 'Update' : 'Create'} Reservation Limitation</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* <FormField
                            control={form.control}
                            name="day"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Day</FormLabel>
                                    <CustomSelect
                                        data={DaysToSelect}
                                        onValueChange={field.onChange}
                                        defaultValue={String(field.value)}
                                        placeholder='Select day'
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        /> */}
                        <FormField
                            control={form.control}
                            name="mealId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meal</FormLabel>
                                    <CustomSelect
                                        data={restaurantMealsSelect}
                                        onValueChange={(val => {
                                            field.onChange(Number(val))
                                        })}
                                        defaultValue={String(field.value)}
                                        placeholder='Select meal'
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="roomId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room</FormLabel>
                                    <CustomSelect
                                        data={restaurantRoomsSelect}
                                        onValueChange={(val => {
                                            field.onChange(Number(val))
                                        })}
                                        defaultValue={String(field.value)}
                                        placeholder='Select a room'
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hour"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hour</FormLabel>
                                    <CustomSelect
                                        data={parsedHours}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder='Select a hour'
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="maxGuestCount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Guest Count</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="maxTableCount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Table Count</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isCreating || isUpdating}>
                            {isUpdate ? 'Update' : 'Create'} Limitation
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}

export default LimitationCrudModal