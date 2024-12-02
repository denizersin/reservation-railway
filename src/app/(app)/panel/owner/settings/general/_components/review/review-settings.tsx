"use client"

import { Button } from "@/components/custom/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CustomComboSelect } from '@/components/custom/custom-combo-select'
import { useHoursSelectData } from '@/hooks/predefined/predfined'
import { api } from '@/server/trpc/react'
import { getEnumValues } from '@/server/utils/server-utils'
import { EnumReviewSendDay, EnumReviewSendType } from '@/shared/enums/predefined-enums'
import TReviewSettingsValidator from '@/shared/validators/restaurant-setting/review'
import React, { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"

type Props = {}

export const ReviewSettings = (props: Props) => {

    const { toast } = useToast()

    const { data: reviewSettings } = api.restaurantSetting.getRestaurantReviewSettings.useQuery()

    const { selectData: mealHoursToSelect } = useHoursSelectData()

    //radio
    const reviewSendTimeValues = useMemo(() => getEnumValues(EnumReviewSendType)
        .map(value => ({
            value,
            label: value
        })), [])

    const reviewSendDayValues = useMemo(() => getEnumValues(EnumReviewSendDay)
        .map(value => ({
            value,
            label: value
        })), [])

    const form = useForm<TReviewSettingsValidator.TUpdateReviewSettingsFormSchema>({})

    useEffect(() => {
        if (reviewSettings) {
            const { id, ...rest } = reviewSettings
            form.reset(rest)
        }
    }, [reviewSettings])

    const { mutate: updateReviewSettings, isPending: isUpdatingReviewSettings } =
        api.restaurantSetting.updateReviewSettings.useMutation({
            onSuccess: () => {
                toast({
                    title: "Review settings updated successfully",
                    description: "Review settings updated successfully",
                })
            }
        })

    const onSubmit = (values: TReviewSettingsValidator.TUpdateReviewSettingsFormSchema) => {
        if (!reviewSettings?.id) return
        updateReviewSettings({
            reviewSettingId: reviewSettings.id,
            reviewSetting: values
        })
    }



    return (

        <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-6">
                <FormField
                    control={form.control}
                    name="reviewSendTime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Review Send Time</FormLabel>
                            <FormControl>
                                <CustomComboSelect
                                    data={mealHoursToSelect}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    isFormSelect={true}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <div className="flex items-center space-x-5">


                    <FormField
                        control={form.control}
                        name="reviewSendType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Review Send Type</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        {reviewSendTimeValues.map((item) => (
                                            <div key={item.value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={item.value} id={item.value} />
                                                <FormLabel htmlFor={item.value}>{item.label}</FormLabel>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="reviewSendDay"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Review Send Day</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        {reviewSendDayValues.map((item) => (
                                            <div key={item.value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={item.value} id={item.value} />
                                                <FormLabel htmlFor={item.value}>{item.label}</FormLabel>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>


                <Button
                    loading={isUpdatingReviewSettings}
                    type="submit" disabled={isUpdatingReviewSettings}>
                    {isUpdatingReviewSettings ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        </Form>

    )
}
