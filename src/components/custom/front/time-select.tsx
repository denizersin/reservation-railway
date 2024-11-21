import React, { useContext, useMemo, useState } from 'react'
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




import { IconArrowLeft, IconArrowRight, IconClock, IconGuests } from '@/components/svgs'
import { Button } from '@/components/ui/button'
import { PopoverClose } from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useMediaQueries'
import { format } from 'date-fns'
import { MonthAvailabilityContext } from '@/app/(app)/reservation/page'


type Props = {
    time: string | undefined
    setTime: (time: string) => void
}

type Item = {
    id: number
    count: number
}

export const TimeSelect = ({
    time,
    setTime
}: Props) => {

    const isMobile = useIsMobile();






    const { selectedDate, monthAvailabilityData, guestCount } = useContext(MonthAvailabilityContext)


    const avaliableHours = useMemo(() => {
        if (!(selectedDate && monthAvailabilityData && guestCount)) return []

        const allHours: string[] = []

        const row = monthAvailabilityData?.find(r => format(r.date, 'dd-mm-yy') === format(selectedDate, 'dd-mm-yy'))
        const avaliables = row?.roomStatus.map(roomRecord => {
            return roomRecord.hourStatus.map(hourRecord => {
                allHours.push(hourRecord.hour)
                const isAvaliable = hourRecord.avaliableMinCapacity > 0 &&
                    guestCount >= hourRecord.avaliableMinCapacity && guestCount <= hourRecord.avaliableMaxCapacity;
                return isAvaliable ? hourRecord.hour : undefined

            }).filter(Boolean)
        })

        const r = avaliables?.flat().filter(Boolean) as string[]

        const uniqueAllHours = [...new Set(allHours)]


        //remove duplicate
        return uniqueAllHours.map(hour => ({
            time: hour,
            isAvailable: r.includes(hour)
        }))
    }, [monthAvailabilityData, guestCount, selectedDate])








    const TriggerElement = <div className='w-full flex items-center py-5 px-2 cursor-pointer hover:bg-gray-50  justify-between text-base border-b'>
        <div className="c ">
            <IconArrowLeft className="w-3 h-5" />
        </div>
        <div className="c flex flex-col items-center">
            <div className="text-front-primary font-semibold mb-1   ">{time}</div>
            <div className="flex items-center gap-2 text-gray-500">
                <div className=""><IconClock className="size-4 " /></div>
                <div className="text-sm">Time</div>
            </div>
        </div>
        <div className="c">
            <IconArrowRight className="w-3 h-5" />
        </div>
    </div>

    console.log(isMobile, 'ismobile')

    const CONTENT = (
        <div className="flex flex-col">
            <div className="text-sm font-semibold ">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex gap-3 flex-wrap py-4 border-b ">
                {
                    avaliableHours.map((item) => {

                        const isAvailable = item.isAvailable

                        const content = (
                            <div
                                onClick={() => setTime(item.time)}
                                className={cn(' px-4 py-2 cursor-pointer border rounded-full text-sm text-front-primary  ', {
                                    'bg-muted': time === item.time,
                                    'opacity-50 cursor-not-allowed': !isAvailable,
                                    "hover:bg-muted": isAvailable
                                })}
                                key={item.time}>{item.time}</div>
                        )

                        const CloseComponent = isMobile ? SheetClose : PopoverClose
                        return isAvailable ? <CloseComponent>
                            {content}
                        </CloseComponent> : content
                    })
                }
            </div>
            <div className="text-sm font-semibold my-2 mb-4">
                We have tables available on other days too
            </div>


        </div>
    )




    return (
        <div className='w-full '>
            <div className="w-full md:hidden">
                <Sheet >
                    <SheetTrigger asChild>
                        {TriggerElement}
                    </SheetTrigger>
                    <SheetContent side={'bottom'} >
                        <SheetTitle className='mb-3'>Select Time</SheetTitle>
                        <SheetDescription>
                            {CONTENT}
                        </SheetDescription>
                    </SheetContent>
                </Sheet>
            </div>


            <div className="w-full hidden md:block ">
                <Popover>
                    <PopoverTrigger asChild className='w-full'>
                        {TriggerElement}
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] flex flex-col p-4">
                        {CONTENT}
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}