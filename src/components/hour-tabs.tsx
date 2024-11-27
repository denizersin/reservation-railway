import { cn } from "@/lib/utils"
import { api } from "@/server/trpc/react"
import { useEffect } from "react"

interface MealHour {
    hour: string
}

interface HourTabsProps {
    selectedHour?: string
    setHour: (hour: string) => void
    className?: string
    selectedMealId: number
}

export const HourTabs = ({
    selectedHour,
    setHour,
    className,
    selectedMealId
}: HourTabsProps) => {


    const { data: mealHours } = api.restaurant.getRestaurantMealHours.useQuery({
        mealId: selectedMealId!,

    }, {
        select: (data) => data.find((d) => d.meal.id === selectedMealId)?.mealHours,
        enabled: Boolean(selectedMealId)
    })


    useEffect(() => {
        if (!selectedHour) {
            setHour(mealHours?.[0]?.hour ?? '')
        }
    }, [mealHours])



    return (
        <div className={cn('flex gap-x-2 my-2', className)}>
            {mealHours?.map((hour) => (
                <div
                    onClick={() => setHour(hour.hour)}
                    key={hour.hour}
                    className={cn(
                        'flex flex-col shadow-md p-2 rounded-md px-4 bg-secondary hover:bg-secondary/20 cursor-pointer',
                        {
                            'bg-primary text-primary-foreground hover:bg-primary': selectedHour === hour.hour
                        }
                    )}
                >
                    <h1>{hour.hour}</h1>
                </div>
            ))}
        </div>
    )
}