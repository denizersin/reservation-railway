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


import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"




import { IconArrowLeft, IconArrowRight, IconGuests, IconImage, IconSittingArea } from '@/components/svgs'
import { Button } from '@/components/ui/button'
import { PopoverClose } from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { MonthAvailabilityContext } from '@/app/(app)/page'
import { format } from 'date-fns'


type Props = {
    areaId: number | undefined
        setAreaId: (areaId: number) => void
}

type Item = {
    id: number
    count: number
}

export const AreaSelect = ({
    areaId,
    setAreaId
}: Props) => {


    const areas = [
        {
            id: 1,
            name: 'Area 1',
            image: <Image
                className='max-w-full'
                src={'/tt-back.png'} alt='area 1'
                width={1264}
                height={904}
            />,
            isAvailable: true
        },
        {
            id: 2,
            name: 'Area 2',
            image: <Image
                className='max-w-full'
                src={'/tt-back.png'} alt='area 2'
                width={1264}
                height={904}
            />,
            isAvailable: false
        }
    ]


    const { selectedDate, monthAvailabilityData, guestCount, selectedTime } = useContext(MonthAvailabilityContext)


    const avaliableRooms = useMemo(() => {
        if (!(selectedDate && monthAvailabilityData && guestCount && selectedTime)) return []


        const row = monthAvailabilityData?.find(r => format(r.date, 'dd-mm-yy') === format(selectedDate, 'dd-mm-yy'))

        const avaliableRooms = row?.roomStatus.map(roomRecord => {
            const isRoomAvaliable = roomRecord.hourStatus.some(hourRecord => {
                const isAvaliable = hourRecord.avaliableMinCapacity > 0 &&
                    guestCount >= hourRecord.avaliableMinCapacity && guestCount <= hourRecord.avaliableMaxCapacity;

                return isAvaliable && hourRecord.hour === selectedTime

            })
            return {
                ...roomRecord,
                isAvailableForTime: isRoomAvaliable
            }
        })
        return avaliableRooms || []
    }, [monthAvailabilityData, guestCount, selectedTime])

    const currentArea = useMemo(() => {
        return avaliableRooms.find(a => a.room.id === areaId)
    }, [avaliableRooms, areaId])


    const TriggerElement = <div className='w-full flex items-center py-5 px-2 cursor-pointer hover:bg-gray-50  justify-between text-base border-b'>
        <div className="c ">
            <IconArrowLeft className="w-3 h-5" />
        </div>
        <div className="c flex flex-col items-center">
            <div className="text-front-primary font-semibold mb-1">{currentArea?.room.name}</div>
            <div className="flex items-center gap-2 text-gray-500">
                <div className=""><IconSittingArea className="size-4 " /></div>
                <div className="text-sm">Sitting Area</div>
            </div>
        </div>
        <div className="c">
            <IconArrowRight className="w-3 h-5" />
        </div>
    </div>


    const [showImage, setShowImage] = useState(false)
    const [currentImage, setCurrentImage] = useState<string | undefined>(undefined)


    const handleShowImage = (image: string) => {
        setShowImage(true)
        setCurrentImage(image)
    }


    return (
        <div className='w-full '>
            <div className="w-full md:hidden">
                <Sheet >
                    <SheetTrigger asChild>
                        {TriggerElement}
                    </SheetTrigger>
                    <SheetContent side={'bottom'} >
                        <SheetTitle className='mb-3'>Select number of guests</SheetTitle>
                        <SheetDescription>
                            {
                                areas.map((item) => {

                                    const isAvailable = item.isAvailable
                                    return <div

                                        key={item.id}
                                        className={cn('flex items-center gap-2 py-3 border-b ', {
                                            'bg-muted': currentArea?.room.id === item.id,
                                            'cursor-pointer hover:bg-muted': isAvailable,
                                            'opacity-50 cursor-not-allowed': !isAvailable
                                        })}>
                                        <div
                                            onClick={() => {
                                                handleShowImage(item.name)
                                            }}
                                            className="c flex flex-col items-center gap-y-2 p-1">
                                            <IconImage className="size-4 text-front-primary" />
                                            <div className="text-sm text-front-primary border-none underline">
                                                see image
                                            </div>
                                        </div>
                                        <SheetClose
                                            onClick={() => {
                                                if (isAvailable) {
                                                    setAreaId(item.id)
                                                }
                                            }}
                                            className="flex-1 px-4  max-w-[478px] flex flex-col items-center justify-center">
                                            <div className="">{item.name}</div>
                                            <div className=" text-gray-600 text-xs">It has a maximum capacity of 2 people.</div>
                                        </SheetClose>
                                    </div>
                                })
                            }
                        </SheetDescription>
                    </SheetContent>
                </Sheet>
            </div>


            <div className="w-full hidden md:block ">
                <Popover>
                    <PopoverTrigger asChild className='w-full'>
                        {TriggerElement}
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] flex flex-col p-4 ">
                        {
                            avaliableRooms.map((item) => {

                                const isAvailable = item.isAvailableForTime
                                return <div

                                    key={item.room.id}
                                    className={cn('flex items-center gap-2 py-3 border-b ', {
                                        'bg-muted': currentArea?.room.id === item.room.id,
                                        'cursor-pointer hover:bg-muted': isAvailable,
                                        'opacity-50 cursor-not-allowed': !isAvailable
                                    })}>
                                    <div
                                        onClick={() => {
                                            handleShowImage(item.room.name)
                                        }}
                                        className="c flex flex-col items-center gap-y-2 p-1">
                                        <IconImage className="size-4 text-front-primary" />
                                        <div className="text-sm text-front-primary border-none underline">
                                            see image
                                        </div>
                                    </div>
                                    <PopoverClose
                                        onClick={() => {
                                            if (isAvailable) {
                                                setAreaId(item.room.id)
                                            }
                                        }}
                                        className={cn('flex-1 px-4  max-w-[478px] flex flex-col items-center justify-center ', {
                                            'cursor-pointer hover:bg-muted': isAvailable,
                                            'opacity-50 cursor-not-allowed': !isAvailable
                                        })}>
                                        <div className="">{item.room.name}</div>
                                        <div className=" text-gray-600 text-xs">It has a maximum capacity of 2 people.</div>
                                    </PopoverClose>
                                </div>
                            })
                        }
                    </PopoverContent>
                </Popover>
            </div>



            <Dialog
                open={showImage}
                onOpenChange={setShowImage}
            >
                <DialogContent className="w-full max-w-[900px]">
                    <DialogHeader>
                        <DialogTitle>
                            {currentImage}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        {currentImage &&
                            areas.find((item) => item.name === currentImage)?.image
                        }
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}