import React, { useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/server/trpc/react'
import { getEnumValues } from '@/server/utils/server-utils'
import { EnumDays } from '@/shared/enums/predefined-enums'
import { restaurantMealDaysCrudSchema } from '@/shared/validators/restaurant/restauran-assets'
import type TRestaurantAssetsValidator from '@/shared/validators/restaurant/restauran-assets'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'



const RestaurantMealDays: React.FC = () => {
    const days = useMemo(() => getEnumValues(EnumDays), [])
    const [dummy, setDummy] = useState(false)

    const { data: restaurantMeals } = api.restaurant.getRestaurantMeals.useQuery()

    const { data: restaurantMealDays } = api.restaurant.getRestaurantMealDays.useQuery()

    const {
        mutate: updateRestaurantMealDays,
        isPending
    } = api.restaurant.updateRestaurantMealDays.useMutation()

    const form = useForm<TRestaurantAssetsValidator.restaurantMealDaysCrudSchema>({
        resolver: zodResolver(restaurantMealDaysCrudSchema),
        defaultValues: {
            mealDays: []
        }
    })

    // const { fields } = useFieldArray({
    //     control: form.control,
    //     name: 'mealDays'
    // })
    const fields = form.getValues('mealDays')
    console.log(fields, 'fields')


    const onSubmit = (data: TRestaurantAssetsValidator.restaurantMealDaysCrudSchema) => {
        updateRestaurantMealDays(data)
    }

    console.log(restaurantMealDays, 'restaurantMealDays')

    useEffect(() => {
        if (restaurantMealDays && restaurantMeals) {
            const mealDays = restaurantMealDays?.map(mealDay => ({
                mealId: mealDay.meal.id,
                day: mealDay.day,
                isOpen: mealDay.isOpen
            }))
            form.reset({ mealDays })
            form.trigger('mealDays');
            setDummy(!dummy)

        }
    }, [restaurantMealDays, restaurantMeals])


    console.log(form.getValues(), 'values')

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {fields.length > 0 && restaurantMeals?.map((restaurantMeal) => (
                    <div key={restaurantMeal.id} className="space-y-4">
                        <h3 className="text-lg font-semibold">{restaurantMeal.meal.name}</h3>
                        {days.map((day) => {
                            const fieldIndex = fields.findIndex(
                                (field) => field.mealId === restaurantMeal.mealId && field.day === day
                            )
                            console.log(fieldIndex, 'fieldIndex', day)
                            return (
                                <FormField
                                    key={`mealDays.${fieldIndex}.isOpen`}
                                    control={form.control}
                                    name={`mealDays.${fieldIndex}.isOpen`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormLabel className="font-medium">{day}</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={(value) => field.onChange(value === 'open')}
                                                    defaultValue={field.value ? 'open' : 'closed'}
                                                    className="flex space-x-1"
                                                    value={field.value ? 'open' : 'closed'}
                                                >
                                                    <FormItem className="flex items-center space-x-1 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="open" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Open
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-1 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="closed" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Closed</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )
                        })}
                    </div>
                ))}
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save'}
                </Button>
            </form>
        </Form>
    )
}

export default RestaurantMealDays