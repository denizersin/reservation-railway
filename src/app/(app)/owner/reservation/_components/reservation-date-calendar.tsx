
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


export function ReservationDateCalendar({ date, setDate }: { date: Date, setDate: (date: Date) => void }) {


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
                    mode="single"
                    selected={date}
                    onSelect={(value) => setDate(value || date)}
                    disabled={(date) =>
                        date < new Date() 
                    }
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}