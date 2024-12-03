import { cn } from '@/lib/utils'
import { TRestaurantMeal } from '@/server/db/schema'
import { api } from '@/server/trpc/react'
import React from 'react'

type Props = {
    selectedMealId: number | undefined
    selectedHour: string | undefined
    setSelectedHour: (hour: string) => void
}

export const MelHoursTabs = ({
    selectedMealId,
    selectedHour,
    setSelectedHour
}: Props) => {

    const { data: mealHours } = api.restaurant.getRestaurantMealHours.useQuery({
        mealId: selectedMealId!,

    }, {
        select: (data) => data.find((d) => d.meal.id === selectedMealId)?.mealHours,
        enabled: !!selectedMealId
    },)
    return (
        <div>
            <div className='flex gap-x-2 my-2'>
                {
                    mealHours?.map((hour) => (
                        <div
                            onClick={() => setSelectedHour(hour.hour)}
                            key={hour.hour} className={cn('flex flex-col shadow-md p-2 rounded-md px-4 bg-secondary hover:bg-secondary/20 cursor-pointer', {
                                'bg-primary text-primary-foreground hover:bg-primary ': selectedHour === hour.hour
                            })}>
                            <h1>{hour.hour}</h1>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}