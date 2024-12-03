"use client"
import { Button } from '@/components/custom/button'
import { CustomComboSelect } from '@/components/custom/custom-combo-select'
import { MultiSelect } from '@/components/custom/multi-select'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCountriesSelectData, useRestaurantLanguagesSelectData, useRestaurantTagsSelectData } from '@/hooks/predefined/predfined'
import { getChangedFields } from '@/lib/utils'
import { api } from '@/server/trpc/react'
import TRestaurantGeneralSettingValidator, { restaurantGeneralSettingValidator } from '@/shared/validators/restaurant-setting/general'
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from 'react'
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
    } = api.restaurantSetting.getRestaurantGeneralSettingsToUpdate.useQuery()

    const updateGeneralSettingMutation = api.restaurantSetting.updateRestaurantGeneralSettings.useMutation()

    const { selectData: countries, isLoading: isLoadingCountries } = useCountriesSelectData();
    const { selectData: languages, isLoading: isLoadingLanguages } = useRestaurantLanguagesSelectData();

    const [availableLaTags, setAvailableLaTags] = useState<number[]>([])

    const onSubmit = (data: TRestaurantGeneralSettingValidator.updateRestaurantGeneralSettingFormSchema) => {


        const changedFields = getChangedFields(data, generalSettings!)


        updateGeneralSettingMutation.mutate({
            generalSettingID: generalSettings?.id!,
            generalSetting: {
                ...changedFields,

            },
            availableLaTags: availableLaTags
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

    const { data: tagsData, isLoading: isLoadingTagsData } = api.restaurant.getTags.useQuery()

    const { selectData: availableTagsToSelect, isLoading: isLoadingTags } = useRestaurantTagsSelectData()





    useEffect(() => {
        if (tagsData) {
            setAvailableLaTags(tagsData?.data?.filter((tag) => tag.isAvailable).map((tag) => tag.id) || [])
        }
    }, [tagsData])


    return (
        <Card className='mb-4'>
            <CardHeader>
                <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
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
                                        onValueChange={(val) => field.onChange(Number(val) ?? 0)} >
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

                        <FormField
                            control={form.control}
                            name="defaultLanguageId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Default Language</FormLabel>
                                    <CustomComboSelect
                                        buttonClass='w-full'
                                        data={languages}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={String(field.value)}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="defaultCountryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Default Country</FormLabel>
                                    <CustomComboSelect
                                        buttonClass='w-full'
                                        data={countries}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={String(field.value)}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='my-2'>
                            <MultiSelect
                                value={availableLaTags.map(String)}
                                options={availableTagsToSelect}
                                onValueChange={(value) => setAvailableLaTags(value.map(Number))}
                                maxCount={15}
                            />
                        </div>

                        <Button
                            loading={updateGeneralSettingMutation.isPending}
                            type="submit">Save Changes</Button>
                    </form>
                </Form>


            </CardContent>
        </Card>
    )
}