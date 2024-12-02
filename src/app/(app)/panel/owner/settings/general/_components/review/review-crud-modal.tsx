import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/custom/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { TRestaurantReviewWithTranslations } from '@/server/db/schema'
import { api } from '@/server/trpc/react'
import TReviewSettingsValidator, { reviewSettingsValidator } from '@/shared/validators/restaurant-setting/review'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'

type Props = {
    isOpen: boolean
    setOpen: (value: boolean) => void
    reviewData?: TRestaurantReviewWithTranslations
}

export const ReviewCrudModal = ({
    isOpen,
    setOpen,
    reviewData,
}: Props) => {
    const queryClient = useQueryClient()
    const isUpdate = Boolean(reviewData)

    const onSuccessCrud = () => {
        queryClient.invalidateQueries({
            queryKey: getQueryKey(api.restaurantSetting.getAllReviews)
        })
        setOpen(false)
    }

    const { mutate: createReview } = api.restaurantSetting.createReview.useMutation({
        onSuccess: onSuccessCrud
    })

    const { mutate: updateReview } = api.restaurantSetting.updateReview.useMutation({
        onSuccess: onSuccessCrud
    })

    const { data: restaurantLanguages } = api.restaurant.getRestaurantLanguages.useQuery()

    const form = useForm<TReviewSettingsValidator.TCreateReviewSchema>({
        resolver: zodResolver(reviewSettingsValidator.createReviewSchema),
        defaultValues: {
            review: {
                isActive: true,
                order: 1,
            },
            translations: restaurantLanguages?.map(lang => ({
                languageId: lang.id,
                title: '',
                description: '',
            }))
        }
    })

    const onSubmit = (data: TReviewSettingsValidator.TCreateReviewSchema) => {
        if (isUpdate && reviewData) {
            updateReview({ 
                id: reviewData.id, 
                reviewData: data 
            })
        } else {
            createReview(data)
        }
    }

    useEffect(() => {
        if (!reviewData || !restaurantLanguages) return

        const newTranslations = restaurantLanguages.map(lang => {
            const translation = reviewData.translations.find(t => t.languageId === lang.id)
            return {
                languageId: lang.id,
                title: translation?.title ?? '',
                description: translation?.description ?? '',
            }
        })

        form.reset({
            review: {
                isActive: reviewData.isActive,
                order: reviewData.order,
            },
            translations: newTranslations
        })
    }, [reviewData, restaurantLanguages])

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isUpdate ? 'Update Review' : 'Create New Review'}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="review.isActive"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Status</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(value) => field.onChange(value === 'true')}
                                            defaultValue={field.value ? 'true' : 'false'}
                                            className="flex flex-row space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <RadioGroupItem value="true" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Active
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <RadioGroupItem value="false" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Inactive
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="review.order"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Order</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {restaurantLanguages?.map((lang, index) => (
                            <div key={lang.id} className="space-y-4">
                                <h3 className="font-medium">{lang.language.name}</h3>
                                <FormField
                                    control={form.control}
                                    name={`translations.${index}.title`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`translations.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}

                        <Button type="submit">
                            {isUpdate ? 'Update Review' : 'Create Review'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}