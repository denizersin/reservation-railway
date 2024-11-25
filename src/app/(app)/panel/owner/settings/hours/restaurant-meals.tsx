"use client"
import React, { useEffect, useMemo } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from '@/components/custom/button'
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { api } from '@/server/trpc/react'
import TRestaurantAssetsValidator, { restaurantAssetsValidator } from '@/shared/validators/restaurant/restauran-assets'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {}

const RestaurantMeals = (props: Props) => {
  const queryClient=useQueryClient()
  const { data: meals, isLoading } = api.predefiend.getMeals.useQuery()

  const {data:restaurantMeals} = api.restaurant.getRestaurantMeals.useQuery()

  const restaurantMealIds=useMemo(()=>restaurantMeals?.map(meal=>meal.mealId),[restaurantMeals])

  const updateRestaurantMealsMutation = api.restaurant.updateRestaurantMeals.useMutation({
    onSuccess: () => queryClient.invalidateQueries({
      queryKey:getQueryKey(api.restaurant.updateRestaurantMealDays)
    })
  })

  const form = useForm<TRestaurantAssetsValidator.restaurantMealsCrudSchema>({
    resolver: zodResolver(restaurantAssetsValidator.restaurantMealsCrudSchema),
    defaultValues: {
      mealIds: restaurantMealIds || [],
    },
  })

  const onSubmit = (data: TRestaurantAssetsValidator.restaurantMealsCrudSchema) => {
    updateRestaurantMealsMutation.mutate(data)
  }

  console.log(restaurantMealIds, 'restaurantMealIds')

  useEffect(() => {
    if (restaurantMealIds) {
      form.setValue('mealIds', restaurantMealIds)
    }
  }, [restaurantMealIds])
  

  if (isLoading) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restaurant Meals</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
          control={form.control}
          name="mealIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Restaurant Meals</FormLabel>
              </div>
              {meals?.map((meal) => (
                <FormField
                  key={meal.id}
                  control={form.control}
                  name="mealIds"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={meal.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value.includes(meal.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, meal.id])
                                : field.onChange(
                                  field.value.filter(
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
            </FormItem>
          )}
        />
        <Button
          loading={updateRestaurantMealsMutation.isPending}
          type="submit"
        >
          Save Changes
        </Button>
      </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default RestaurantMeals