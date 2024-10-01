import React, { useMemo, useState } from 'react'
import { CustomSelect } from '@/components/custom/custom-select'
import { MultiSelect } from '@/components/custom/multi-select'
import { api } from '@/server/trpc/react'
import { MEAL_HOURS } from '@/shared/data/predefined'
import TRestaurantAssetsValidator from '@/shared/validators/restaurant/restauran-assets'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Props = {
    open: boolean
    setOpen: (open: boolean) => void
}

export const CreateHourModal: React.FC<Props> = ({ open, setOpen }) => {
    const queryClient = useQueryClient()

    const mealHoursToSelect = useMemo(() => MEAL_HOURS.map(hour => ({
        value: hour,
        label: hour,
    })), [])

    console.log(mealHoursToSelect, 'mealHoursToSelect')

    const {
        data: restaurantMeals,
    } = api.restaurant.getRestaurantMeals.useQuery()

    const { mutate: createMealHoursMutation, isPending } = api.restaurant.createRestaurantMealHours.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.restaurant.getRestaurantMealHours) })
            setOpen(false)
        }
    })

    const restaurantMealsOptions = useMemo(() => restaurantMeals?.map(meal => ({
        value: String(meal.mealId),
        label: meal.meal.name
    })) || [], [restaurantMeals])

    const [mealId, setMealId] = useState<string | undefined>()
    const [selectedHours, setSelectedHours] = useState<string[]>([])

    const onSubmit = () => {
        if (mealId && selectedHours.length > 0) {
            const mealHours: TRestaurantAssetsValidator.restaurantMealHoursAddSChema['mealHours'] = selectedHours.map(hour => ({
                mealId: Number(mealId),
                hour,
                isOpen: true
            }))
            createMealHoursMutation({
                mealHours
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Meal Hours</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <CustomSelect
                        data={restaurantMealsOptions}
                        onValueChange={(value) => setMealId(value)}
                        placeholder="Select a meal"
                    />
                    <MultiSelect
                        options={mealHoursToSelect}
                        onValueChange={setSelectedHours}
                        placeholder="Select hours"
                        variant="inverted"
                        disabled={isPending}
                        
                    />
                </div>
                <DialogFooter>
                    <Button 
                        onClick={onSubmit} 
                        disabled={!mealId || selectedHours.length === 0 || isPending}
                    >
                        {isPending ? 'Creating...' : 'Create Hours'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}