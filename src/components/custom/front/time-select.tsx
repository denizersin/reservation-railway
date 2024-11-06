import React, { useState } from 'react'
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

    


    const times = [
        { id: 1, time: '18:00', isAvailable: false },
        { id: 2, time: '18:30', isAvailable: false },
        { id: 3, time: '19:00', isAvailable: false },
        { id: 4, time: '19:30', isAvailable: false },
        { id: 5, time: '20:00', isAvailable: true },
        { id: 6, time: '20:30', isAvailable: true },
        { id: 7, time: '21:00', isAvailable: true },
        { id: 8, time: '21:30', isAvailable: true },
        { id: 9, time: '22:00', isAvailable: true },
    ]

    const otherTreeDayAvailableTimes = ([
        [
            { id: 1, time: '18:00', isAvailable: true },
            { id: 2, time: '18:30', isAvailable: true },
            { id: 3, time: '19:00', isAvailable: true },
            { id: 4, time: '19:30', isAvailable: true },
        ],
        [
            { id: 3, time: '19:00', isAvailable: true },
            { id: 4, time: '19:30', isAvailable: true },
        ],
        [
            { id: 5, time: '20:00', isAvailable: true },
            { id: 6, time: '20:30', isAvailable: true },
            { id: 7, time: '21:00', isAvailable: true },
            { id: 8, time: '21:30', isAvailable: true },
            { id: 9, time: '22:00', isAvailable: true },
        ]
    ])


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

    console.log(isMobile,'ismobile')

    const CONTENT = (
        <div className="flex flex-col">
            <div className="text-sm font-semibold ">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex gap-3 flex-wrap py-4 border-b ">
                {
                    times.map((item) => {

                        const isAvailable = item.isAvailable

                        const content = (
                            <div
                                onClick={() => setTime(item.time)}
                                className={cn(' px-4 py-2 cursor-pointer border rounded-full text-sm text-front-primary  ', {
                                    'bg-muted': time === item.time,
                                    'opacity-50 cursor-not-allowed': !isAvailable,
                                    "hover:bg-muted": isAvailable
                                })}
                                key={item.id}>{item.time}</div>
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

            {
                otherTreeDayAvailableTimes.map((item, index) => {
                    return <div>
                        <div className="text-sm font-semibold ">
                            {new Date(new Date().setDate(new Date().getDate() + index)).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="flex gap-3 flex-wrap py-2  ">
                            {
                                item.map((item) => {

                                    const isAvailable = item.isAvailable

                                    const CloseComponent = isMobile ? SheetClose : PopoverClose

                                    const content = (
                                        <div
                                            onClick={() => setTime(item.time)}
                                            className={cn(' px-4 py-2 cursor-pointer border rounded-full text-sm text-front-primary hover:bg-muted ', {
                                                'bg-muted': time === item.time
                                            })}
                                            key={item.id}>{item.time}</div>
                                    )

                                    return isAvailable ? <CloseComponent>
                                        {content}
                                    </CloseComponent> : content
                                })
                            }
                        </div>
                    </div>

                })
            }

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