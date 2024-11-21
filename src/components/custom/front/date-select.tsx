import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet"
import React, { useState } from 'react'

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"




import { IconArrowLeft, IconArrowRight, IconCalendar } from '@/components/svgs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CustomCalendar } from '../custom-calendar'
import { MonthAvailabilityContext } from "@/app/(app)/reservation/page"


type Props = {
    date: Date | undefined
    setDate: (date: Date) => void
    isWaitlistSelect?: boolean
    onClickAddWaitList?: () => void
}


export const DateSelect = ({
    date,
    setDate,
    isWaitlistSelect,
    onClickAddWaitList
}: Props) => {

    const [sheetOpen, setSheetOpen] = useState(false)

    const [popOverOpen, setPopOverOpen] = useState(false)


    const { isLoadingMonthAvailability, guestCount,setSelectedAreaId,setSelectedTime } = React.useContext(MonthAvailabilityContext)

    

    const isDisabled = isLoadingMonthAvailability || isWaitlistSelect

    const TriggerElement = <div

        className='w-full flex items-center py-5 px-2 cursor-pointer hover:bg-gray-50  justify-between text-base border-b'>
        <div className="c ">
            <IconArrowLeft className="w-3 h-5" />
        </div>
        <div className="c flex flex-col items-center">
            <div className="text-front-primary font-semibold mb-1 flex items-center gap-x-2">
                <div className="">{date?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                {isWaitlistSelect && <Button
                    variant={'default'}
                    size={'sm'}
                    className={cn("inline-flex bg-front-primary  hover:bg-front-primary/40  px-[6px] py-[2px] !h-max rounded-full ")}>
                    <span className="text-[9px]">Waitlisted</span>
                </Button>}
            </div>
            <div className="flex items-center gap-2 text-gray-500">
                <div className=""><IconCalendar className="size-4 " /></div>
                <div className="text-sm">Date</div>
            </div>
        </div>
        <div className="c">
            <IconArrowRight className="w-3 h-5" />
        </div>
    </div>




    const onDateSelect = (date: Date) => {
        setSheetOpen(false)
        setPopOverOpen(false)
        setDate(date)
        setSelectedTime(undefined)
        setSelectedAreaId(undefined)
    }

 

    return (
        <div className='w-full '>
            <div className="w-full md:hidden">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    {
                        isDisabled ? TriggerElement :
                            <SheetTrigger asChild className='w-full'>
                                {TriggerElement}
                            </SheetTrigger>
                    }
                    <SheetContent side={'bottom'} >
                        <SheetTitle className='mb-3'>Select number of guests</SheetTitle>
                        <SheetDescription>
                            <CustomCalendar
                                date={date}
                                mode='single'
                                onDateSelect={onDateSelect}
                                onClickAddWaitList={onClickAddWaitList}
                            />
                        </SheetDescription>
                        <Button className='bg-front-primary text-white w-full'>See Waitlist</Button>

                    </SheetContent>
                </Sheet>
            </div>


            <div className="w-full hidden md:block ">
                <Popover open={popOverOpen} onOpenChange={setPopOverOpen}>
                    {
                        isDisabled ? TriggerElement :
                            <PopoverTrigger asChild className='w-full'>
                                {TriggerElement}
                            </PopoverTrigger>
                    }
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] flex flex-col p-0">
                        <CustomCalendar
                            date={date}
                            mode='single'
                            onDateSelect={onDateSelect}
                            onClickAddWaitList={onClickAddWaitList}
                        />

                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}