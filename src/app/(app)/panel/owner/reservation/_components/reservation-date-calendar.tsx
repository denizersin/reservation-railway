
"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


export function ReservationDateCalendar({ date, setDate, disabled }: {
    date: Date,
    setDate: (date: Date) => void,
    disabled?: boolean
}) {


    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[240px] pl-3 text-left font-normal my-3",
                        !date && "text-muted-foreground"
                    )}
                >
                    {date ? (
                        format(date, "PPP")
                    ) : (
                        <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    disabled={disabled}
                    mode="single"
                    selected={date}
                    onSelect={(value) => setDate(value || date)}
                    // disabled={(date) =>
                    //     date < new Date() 
                    // }
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}