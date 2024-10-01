"use client"
import { Button } from '@/components/custom/button'
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getChangedFields } from '@/lib/utils'
import { TCountry, TMeal, TReservationStatus } from '@/server/db/schema/predefined'
import { TRestaurantLanguages } from '@/server/db/schema/restaurant'
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

    console.log(reservationStatues, 'reservationStatues')


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
        console.log(generalSettings, 'generalSettings')
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

                {/* <FormField
                    control={form.control}
                    name="meals"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Meals</FormLabel>
                            </div>
                            {meals?.map((meal) => (
                                <FormField
                                    key={meal.id}
                                    control={form.control}
                                    name="meals"

                                    render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={meal.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(meal.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...field.value!, meal.id])
                                                                : field.onChange(
                                                                    field.value?.filter(
                                                                        (value) => value !== meal.id
                                                                    )
                                                                )
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {meal.name}
                                                </FormLabel>
                                            </FormItem>
                                        )
                                    }}
                                />
                            ))}
                        </FormItem>)}
                /> */}



                {/* Add similar FormField components for defaultLanguageId, defaultCountryId, tableView, and meals */}

                <Button
                    loading={updateGeneralSettingMutation.isPending}
                    type="submit">Save Changes</Button>
            </form>
        </Form>
    )
}