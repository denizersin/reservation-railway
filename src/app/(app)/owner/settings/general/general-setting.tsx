"use client"
import { Button } from '@/components/custom/button'
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getChangedFields } from '@/lib/utils'
import { api } from '@/server/trpc/react'
import TRestaurantGeneralSettingValidator, { restaurantGeneralSettingValidator } from '@/shared/validators/restaurant'
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from 'react'
import { useForm } from "react-hook-form"



type Props = {
}

export const GeneralSettings = ({ }: Props) => {

    const { data: reservationStatues } = api.reservation.getReservationSatues.useQuery()
    const { data: meals } = api.predefiend.getMeals.useQuery()

    const {
        data: generalSettings,
        isLoading,
        error,
    } = api.restaurant.getRestaurantGeneralSettingsToUpdate.useQuery()

    const updateGeneralSettingMutation = api.restaurant.updateRestaurantGeneralSettings.useMutation()


    const onSubmit = (data: TRestaurantGeneralSettingValidator.updateRestaurantGeneralSettingFormSchema) => {


        const changedFields = getChangedFields(data, generalSettings!)


        updateGeneralSettingMutation.mutate({
            generalSettingID: generalSettings?.id!,
            generalSetting: {
                ...changedFields,
            }
        })
    }

    const form = useForm<TRestaurantGeneralSettingValidator.updateRestaurantGeneralSettingFormSchema>({
        resolver: zodResolver(restaurantGeneralSettingValidator.updateRestaurantGeneralSettingFormSchema),
        defaultValues: {
            ...generalSettings,
        },
    })

    useEffect(() => {
        form.reset({
            ...generalSettings,
        })
    }, [generalSettings])


    return (
        <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-[500px]">
                <FormField
                    control={form.control}
                    name="isAutoCheckOut"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel>Auto Check-Out</FormLabel>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="newReservationStatusId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Reservation Status</FormLabel>
                            <Select
                                value={String(field.value)}
                                onValueChange={(val) => field.onChange(Number(val))} >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {reservationStatues?.map((status) => (
                                        <SelectItem

                                            key={status.id} value={status.id + ''}>{status.status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />

                {/* prepayment_price_per_guest input */}
                <FormField
                    control={form.control}
                    name="prePayemntPricePerGuest"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prepayment Price Per Guest</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="w-full"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />


                <Button
                    loading={updateGeneralSettingMutation.isPending}
                    type="submit">Save Changes</Button>
            </form>
        </Form>
    )
}