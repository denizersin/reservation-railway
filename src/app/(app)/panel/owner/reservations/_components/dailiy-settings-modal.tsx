"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { MultiSelect } from "@/components/custom/multi-select"
import { Button } from "@/components/custom/button"
import { useAreSelectData, useMealHoursSelectData } from "@/hooks/predefined/predfined"
import { useStartOfDay } from "@/hooks/useStartOfDay"
import { EnumMealNumeric } from "@/shared/enums/predefined-enums"
import { api } from "@/server/trpc/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import TRestaurantDailySettingValidator, { restaurantDailySettingValidator } from "@/shared/validators/restaurant-setting/daily"
import { useQueryClient } from "@tanstack/react-query"
import { getQueryKey } from "@trpc/react-query"
import { Switch } from "@/components/ui/switch"
import React from "react"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const DailySettingsModal = ({ open, onOpenChange }: Props) => {
    const date = useStartOfDay()
    const queryClient = useQueryClient()

    const {
        selectData: mealHoursData,
        isLoading: mealHoursLoading
    } = useMealHoursSelectData({ mealId: EnumMealNumeric.dinner })

    const {
        selectData: areasData,
        isLoading: areasLoading
    } = useAreSelectData()

    const { data: dailySettings } = api.restaurantSetting.getDailySettings.useQuery({ date })

    const updateDailySettingMutation = api.restaurantSetting.updateDailySettings.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.restaurantSetting.getDailySettings)
            })
        }
    })

    const form = useForm<TRestaurantDailySettingValidator.TUpdateDailySettingForm>({
        resolver: zodResolver(restaurantDailySettingValidator.updateDailySettingFormSchema),
    })

    React.useEffect(() => {
        if (dailySettings) {
            form.reset({
                closedAreas: dailySettings.closedAreas,
                closedDinnerHours: dailySettings.closedDinnerHours,
                dinner: dailySettings.dinner,
                onlineReservations: dailySettings.onlineReservations,
                waitlist: dailySettings.waitlist,
                minGuests: dailySettings.minGuests,
                maxGuests: dailySettings.maxGuests,
            })
        }
    }, [dailySettings])

    const onSubmit = (data: TRestaurantDailySettingValidator.TUpdateDailySettingForm) => {
        if (!dailySettings?.id) return
        updateDailySettingMutation.mutate({
            dailySettingId: dailySettings.id,
            dailySetting: data
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Daily Settings</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="closedDinnerHours"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Closed Dinner Hours</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            options={mealHoursData}
                                            placeholder="Select closed hours"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="closedAreas"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Closed Areas</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            value={field.value?.map(String) || []}
                                            onValueChange={(values) => {
                                                field.onChange(values.map(Number))
                                            }}
                                            options={areasData}
                                            placeholder="Select closed areas"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-col gap-4">
                            <FormField
                                control={form.control}
                                name="onlineReservations"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between gap-2">
                                        <FormLabel>Online Reservations</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="waitlist"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between gap-2">
                                        <FormLabel>Waitlist</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dinner"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between gap-2">
                                        <FormLabel>Dinner</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            loading={updateDailySettingMutation.isPending}
                            type="submit">
                            Save Changes
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}