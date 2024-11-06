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




import { IconArrowLeft, IconArrowRight, IconCalendar, IconGuests } from '@/components/svgs'
import { Button } from '@/components/ui/button'
import { PopoverClose } from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
import { CustomCalendar } from '../custom-calendar'


type Props = {
    date: Date
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

    console.log(onClickAddWaitList, 'onClickAddWaitList')


    const TriggerElement = <div className='w-full flex items-center py-5 px-2 cursor-pointer hover:bg-gray-50  justify-between text-base border-b'>
        <div className="c ">
            <IconArrowLeft className="w-3 h-5" />
        </div>
        <div className="c flex flex-col items-center">
            <div className="text-front-primary font-semibold mb-1 flex items-center gap-x-2">
                <div className="">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                {isWaitlistSelect && <Button
                    variant={'default'}
                    size={'sm'}
                    className={cn("hidden md:inline-flex bg-front-primary  hover:bg-front-primary/40  px-[6px] py-[2px] !h-max rounded-full ")}>
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


    React.useEffect(() => {
        setSheetOpen(false)
    }, [date])

    return (
        <div className='w-full '>
            <div className="w-full md:hidden">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    {
                        isWaitlistSelect ? TriggerElement :
                            <SheetTrigger asChild>
                                {TriggerElement}
                            </SheetTrigger>
                    }
                    <SheetContent side={'bottom'} >
                        <SheetTitle className='mb-3'>Select number of guests</SheetTitle>
                        <SheetDescription>
                            <CustomCalendar
                                date={date}
                                setDate={setDate}
                                mode='single'
                                onClickAddWaitList={onClickAddWaitList}
                            />
                        </SheetDescription>
                        <Button className='bg-front-primary text-white w-full'>See Waitlist</Button>

                    </SheetContent>
                </Sheet>
            </div>


            <div className="w-full hidden md:block ">
                <Popover>
                    {
                        isWaitlistSelect ? TriggerElement :
                            <PopoverTrigger asChild className='w-full'>
                                {TriggerElement}
                            </PopoverTrigger>
                    }
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] flex flex-col p-0">
                        <PopoverClose>
                            <CustomCalendar
                                date={date}
                                setDate={setDate}
                                mode='single'
                                onClickAddWaitList={onClickAddWaitList}
                            />
                        </PopoverClose>

                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}