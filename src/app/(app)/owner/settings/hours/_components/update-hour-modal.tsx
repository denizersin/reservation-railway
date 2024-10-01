import { CustomSelect } from '@/components/custom/custom-select'
import { TMealHour } from '@/server/db/schema/restaurant-assets'
import { api } from '@/server/trpc/react'
import { MEAL_HOURS } from '@/shared/data/predefined'
import React, { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/custom/button'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  hourData: TMealHour
}

export const UpdateHourModal: React.FC<Props> = ({
  open,
  setOpen,
  hourData
}) => {

  console.log(hourData, 'hourData')

  const queryClient = useQueryClient()

  const meelHoursToSelect = useMemo(() => MEAL_HOURS.map(hour => ({
    value: hour,
    label: hour
  })), [])

  const [newHour, setNewHour] = useState<string>(hourData.hour)

  const {
    mutate: updateMealHourMutation,
    isPending
  } = api.restaurant.updateMealHour.useMutation({
    onSuccess: () => {
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: getQueryKey(api.restaurant.getRestaurantMealHours) })
    }
  })

  const handleUpdate = () => {
    updateMealHourMutation({
      mealHourId: hourData.id,
      data: { hour: newHour }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Meal Hour</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <CustomSelect
            data={meelHoursToSelect}
            value={newHour}
            onValueChange={(value) => setNewHour(value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate}
            loading={isPending}
           disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Hour'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}