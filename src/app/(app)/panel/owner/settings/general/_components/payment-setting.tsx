"use client"
import { Button } from '@/components/custom/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from '@/components/ui/input'
import { getChangedFields } from '@/lib/utils'
import { api } from '@/server/trpc/react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from 'react'
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import TPaymentSettingValidator, { paymentSettingValidator } from '@/shared/validators/restaurant-setting/payment'
import { EnumPrepaymentAtNoShow } from '@/shared/enums/predefined-enums'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'

export const PaymentSettings = () => {
    const {
        data: paymentSettings,
        isLoading,
    } = api.restaurantSetting.getRestaurantPaymentSettings.useQuery()

    const queryClient = useQueryClient()
    const updatePaymentSettingMutation = api.restaurantSetting.updateRestaurantPaymentSetting.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.restaurantSetting.getRestaurantPaymentSettings) })
        }
    })

    const form = useForm<TPaymentSettingValidator.updatePaymentSettingFormSchema>({
        resolver: zodResolver(paymentSettingValidator.updatePaymentSettingFormSchema),})

    useEffect(() => {
        form.reset({
            ...paymentSettings,
        })
    }, [paymentSettings])

    const onSubmit = (data: TPaymentSettingValidator.updatePaymentSettingFormSchema) => {
        updatePaymentSettingMutation.mutate({
            paymentSettingId: paymentSettings?.id!,
            paymentSetting: data
        })
    }

    return (
        <Card className='mb-4'>
            <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-[500px]">
                        <FormField
                        
                            control={form.control}
                            name="prePaymentPricePerGuest"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pre-payment Price Per Guest</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="convertPrepaymentToSale"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Convert Prepayment to Sale</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(value) => field.onChange(value === 'true')}
                                            value={field.value?.toString()}
                                            className="flex flex-row space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-2">
                                                <RadioGroupItem value="true" />
                                                <FormLabel className="font-normal">Yes</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2">
                                                <RadioGroupItem value="false" />
                                                <FormLabel className="font-normal">No</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="prepaymentCancellationHours"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prepayment Cancellation Hours</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* cancellationAllowedHours */}
                        <FormField
                            control={form.control}
                            name="cancellationAllowedHours"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cancellation Allowed Hours</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notifyPrepaymentReminderHoursBefore"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notify Prepayment Reminder Hours Before</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
    
                        <FormField
                            control={form.control}
                            name="prepaymentAtNoShow"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prepayment at No Show</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex flex-col space-y-2"
                                        >
                                            {Object.values(EnumPrepaymentAtNoShow).map((value) => (
                                                <FormItem key={value} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={value} />
                                                    <FormLabel className="font-normal">{value}</FormLabel>
                                                </FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <Button
                            loading={updatePaymentSettingMutation.isPending}
                            type="submit">
                            Save Changes
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
