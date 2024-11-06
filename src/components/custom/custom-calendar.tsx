"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"
import { ActiveModifiers, DayPicker, DayPickerSingleProps, DayProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
    date: Date
    setDate: (date: Date) => void
    onClickAddWaitList?: (date: Date) => void
}

const today = new Date()
const mockFullDates = [
    new Date(today.getFullYear(), today.getMonth(), 1),  // 1st
    new Date(today.getFullYear(), today.getMonth(), 2),  // 2nd
    new Date(today.getFullYear(), today.getMonth(), 3),  // 3rd
    new Date(today.getFullYear(), today.getMonth(), 4),   // 4th
    new Date(today.getFullYear(), today.getMonth(), 5),   // 5th
    new Date(today.getFullYear(), today.getMonth(), 6),   // 6th
].filter(date => date.getDay() !== 0 && date.getDay() !== 6); // Exclude weekends (0 = Sunday, 6 = Saturday)



function CustomCalendar({
    className,
    classNames,
    showOutsideDays = true,
    date,
    setDate,
    onClickAddWaitList,

    ...props
}: CalendarProps) {



    const [month, setMonth] = React.useState(date)

    React.useEffect(() => {
        if (month.getMonth() !== date.getMonth()) {
            setMonth(date)
        }
    }, [date])


    return (
        <DayPicker
            showOutsideDays={false}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center ",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center ",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1 ",
                head_row: "flex",
                row: "flex w-full mt-2 gap-x-1.5 !my-[9px] justify-between",
                cell: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",

                    "[&:has([aria-selected])]:rounded-md"
                ),
                // day: cn(
                //     buttonVariants({ variant: "ghost" }),
                //     "w-[79px] h-[44px] p-0 font-normal aria-selected:opacity-100"
                // ),
                day_range_start: "day-range-start",
                day_range_end: "day-range-end",
                day_selected:
                    "!bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside:
                    "day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-4 w-4 " />,
                IconRight: ({ ...props }) => <ChevronRightIcon className="h-4 w-4 " />,
                Caption: ({ ...props }) => <div className="flex justify-center w-full gap-x-5">
                    <Button
                        onClick={() => {
                            setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
                        }}

                        variant="ghost" className="w-7 h-7 p-0">
                        <ChevronLeftIcon className="h-4 w-4 " />
                    </Button>
                    <div className="flex  items-center gap-x-1 w-[150px] justify-center">
                        <span className="text-front-primary text-base font-semibold">{props.displayMonth.toLocaleString('default', { month: 'long' })}</span>
                        <span className="text-front-primary text-base font-semibold">{props.displayMonth.getFullYear()}</span>
                    </div>
                    <Button
                        onClick={() => {
                            setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
                        }}

                        variant="ghost" className="w-7 h-7 p-0">
                        <ChevronRightIcon className="h-4 w-4 " />
                    </Button>
                </div>,
                Head: () => <div className="flex gap-x-1.5 justify-between">
                    <div className="w-[44px] md:w-[79px] h-[20px] text-center text-base">Sun</div>
                    <div className="w-[44px] md:w-[79px] h-[20px] text-center text-base">Mon</div>
                    <div className="w-[44px] md:w-[79px] h-[20px] text-center text-base">Tue</div>
                    <div className="w-[44px] md:w-[79px] h-[20px] text-center text-base">Wed</div>
                    <div className="w-[44px] md:w-[79px] h-[20px] text-center text-base">Thu</div>
                    <div className="w-[44px] md:w-[79px] h-[20px] text-center text-base">Fri</div>
                    <div className="w-[44px] md:w-[79px] h-[20px] text-center text-base">Sat</div>
                </div>,

                Day: (props: DayProps) => {

                    const isFullDate = mockFullDates.some(d => d.toLocaleDateString() === props.date.toLocaleDateString())

                    const isWeekend = props.date.getDay() === 0 || props.date.getDay() === 6

                    const isBelongToMonth = props.date.getMonth() == month.getMonth()
                    const isSelected = date?.toLocaleDateString() === props.date.toLocaleDateString()
                    // const isFull
                    return isBelongToMonth ? <Button
                        // disabled={!isBelongToMonth}
                        onClick={() => {

                            setDate(props.date)
                        }}
                        variant="default" className={cn('test w-[44px] md:w-[79px] h-[44px]  p-0 font-normal bg-front-primary bg-white shadow-none hover:text-white text-front-primary', {
                            'bg-front-primary text-front-primary-foreground': isSelected,
                            'bg-gray-100 text-gray-500 hover:bg-gray-100 hover:text-gray-500': !isBelongToMonth || isFullDate || isWeekend,
                            "line-through": isFullDate,
                            // "hover:bg-primary hover:text-primary-foreground": !isSelected
                        })}>
                        {props.date.getDate()}
                        {
                            isFullDate && <Button
                                variant={'default'}
                                size={'sm'}
                                onClick={() => {
                                    onClickAddWaitList?.(props.date)
                                }}
                                className={cn("hidden md:inline-flex bg-front-primary absolute hover:bg-front-primary/40 -bottom-2  left-1/2 -translate-x-1/2 px-[6px] py-[2px] !h-max rounded-full ")}>
                                <PlusIcon className="h-3 w-3 " />
                                <span className="text-[9px]">Waitlist</span>
                            </Button>
                        }
                    </Button> : <div className="w-[44px] md:w-[79px] h-[44px]"></div>
                },



                // Head: () => <div className="bg-red-400">Head</div>
            }}
            month={month}
            fromYear={date.getFullYear()}
            toYear={date.getFullYear() + 1}

            {...props}
        />
    )
}
CustomCalendar.displayName = "CustomCalendar"

export { CustomCalendar }
