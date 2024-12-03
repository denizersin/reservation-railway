"use client"
import { useMonthsSelectData } from "@/hooks/predefined/predfined";
import { api } from "@/server/trpc/react";
import TRestaurantCalendarSettingValidator, { restaurantCalendarSettingValidator } from "@/shared/validators/restaurant-setting/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/custom/button";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { MultiSelect } from "@/components/custom/multi-select";
import React from "react";
import { Input } from "@/components/ui/input";

export const CalendarSetting = () => {
    const {
        selectData: monthsData
    } = useMonthsSelectData()

    const queryClient = useQueryClient()
    const { data: calendarSettings } = api.restaurantSetting.getRestaurantCalendarSettings.useQuery();

    const updateCalendarSettingMutation = api.restaurantSetting.updateRestaurantCalendarSetting.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.restaurantSetting.getRestaurantCalendarSettings)
            })
        }
    });

    const form = useForm<TRestaurantCalendarSettingValidator.TUpdateCalendarSettingForm>({
        resolver: zodResolver(restaurantCalendarSettingValidator.updateCalendarSettingFormSchema),
    });

    React.useEffect(() => {
        form.reset({
            ...calendarSettings,
        })
    }, [calendarSettings])

    const onSubmit = (data: TRestaurantCalendarSettingValidator.TUpdateCalendarSettingForm) => {
        updateCalendarSettingMutation.mutate({
            calendarSettingId: calendarSettings?.id!,
            calendarSetting: data
        })
    }

    return (
        <Card className='mb-4'>
            <CardHeader>
                <CardTitle>Calendar Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-[500px]">
                        <FormField
                            control={form.control}
                            name="closedMonths"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Closed Months</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            value={field.value?.map(String) || []}
                                            onValueChange={(values) => {
                                                field.onChange(values.map(Number))
                                            }}
                                            options={monthsData}
                                            placeholder="Select closed months"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* //number input */}
                        <FormField
                            control={form.control}
                            name="maxAdvanceBookingDays"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Maximum Advance Booking Days</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            placeholder="Enter maximum days"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Maximum number of days in advance that customers can make reservations
                                    </FormDescription>
                                </FormItem>
                            )}
                            />

                        <Button
                            loading={updateCalendarSettingMutation.isPending}
                            type="submit">
                            Save Changes
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
