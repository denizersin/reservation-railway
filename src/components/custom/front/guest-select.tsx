import React, { useContext, useState } from 'react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"




import { IconArrowLeft, IconArrowRight, IconGuests } from '@/components/svgs'
import { Button } from '@/components/ui/button'
import { PopoverClose } from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
import { MonthAvailabilityContext } from '@/app/(app)/reservation/page'


type Props = {
  guestCount: number
  setGuestCount: (count: number) => void,
  disabled?: boolean
}

type Item = {
  id: number
  count: number
}

export const GuestSelect = ({
  guestCount,
  setGuestCount,
  disabled = false
}: Props) => {


  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isPopOverOpen, setIsPopOverOpen] = useState(false)

  const {
    setSelectedAreaId,
    setAreaName,
    setSelectedTime,
    setSelectedDate
  }=useContext(MonthAvailabilityContext)

  const items: Item[] = new Array(5).fill(0).map((_, i) => ({ id: i + 1, count: i + 1 }))


  const TriggerElement = <div className='w-full flex items-center py-5 px-2 cursor-pointer hover:bg-gray-50  justify-between text-base border-b'>
    <div className="c ">
      <IconArrowLeft className="w-3 h-5" />
    </div>
    <div className="c flex flex-col items-center">
      <div className="text-front-primary font-semibold mb-1">{guestCount}</div>
      <div className="flex items-center gap-2 text-gray-500">
        <div className=""><IconGuests className="size-4 " /></div>
        <div className="text-sm">Guests</div>
      </div>
    </div>
    <div className="c">
      <IconArrowRight className="w-3 h-5" />
    </div>
  </div>


  const handleGuestCountChange = (count: number) => {
    setGuestCount(count)
    setSelectedDate(undefined)
    setSelectedTime(undefined)
    setSelectedAreaId(undefined)
    setAreaName('')

  }


  return (
    <div className='w-full '>
      <div className="w-full md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            {
              disabled ? TriggerElement :
                <SheetTrigger asChild className='w-full'>
                  {TriggerElement}
                </SheetTrigger>
            }
          </SheetTrigger>
          <SheetContent side={'bottom'} >
            <SheetTitle className='mb-3'>Select number of guests</SheetTitle>
            <SheetDescription>
              {
                items.map((item) => {
                  return <SheetClose
                    onClick={() => handleGuestCountChange(item.count)}
                    key={item.id}
                    className={cn('w-full text-front-primary hover:bg-muted py-3 border-b text-base', {
                      'bg-muted': guestCount === item.count
                    })}>
                    {item.count}
                  </SheetClose>
                })
              }
            </SheetDescription>
          </SheetContent>
        </Sheet>
      </div>


      <div className="w-full hidden md:block ">
        <Popover open={isPopOverOpen} onOpenChange={setIsPopOverOpen}>

          {
            disabled ? TriggerElement :
              <PopoverTrigger asChild className='w-full'>
                {TriggerElement}
              </PopoverTrigger>
          }
          <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] flex flex-col p-0">
            {
              items.map((item) => {
                return <PopoverClose
                  onClick={() => handleGuestCountChange(item.count)}
                  key={item.id}
                  className={cn('w-full text-front-primary hover:bg-muted py-3 border-b text-base', {
                    'bg-muted': guestCount === item.count
                  })}>
                  {item.count}
                </PopoverClose>
              })
            }
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}