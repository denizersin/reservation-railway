"use client";
import { Button } from "@/components/custom/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateQueryParams } from "@/hooks/useUpdateQueryParams";
import { IconAlertTriangle, IconArchive, IconBell, IconCashBanknote, IconClockHour3, IconDownload, IconInfoCircle, IconLayoutGrid, IconList, IconPrinter } from "@tabler/icons-react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, RefreshCwIcon, SearchIcon, SettingsIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useReservationsContext } from "../page";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { api } from "@/server/trpc/react";

export type TReservationsViewType = 'list' | 'table'

export function ReservationHeader() {

    const { date, setDate, queryDate } = useReservationsContext()

    console.log('headerr')


    const updateQueryParam = useUpdateQueryParams({ replace: true })

    const searchParams = useSearchParams()

    const view = (searchParams.get('view') || 'list') as TReservationsViewType


    const onToggleView = (view: TReservationsViewType) => {
        updateQueryParam({ view })
    }

    const onClickPrevDate = () => {
        const newDate = new Date(date)
        newDate.setDate(newDate.getDate() - 1)
        setDate(newDate)
    }

    const onClickNextDate = () => {
        const newDate = new Date(date)
        newDate.setDate(newDate.getDate() + 1)
        setDate(newDate)
    }

    const router = useRouter();

    const queryClient = useQueryClient()

    const onRefresh = () => {
        queryClient.invalidateQueries({
            queryKey: getQueryKey(api.reservation.getReservations, {
                date: queryDate
            }, 'query')
        })
    }



    return (
        <div>
            <div className="text-card-foreground text-2xl mb-4 font-normal">
                TURK FATIH TUTAK | {date.toDateString()}
            </div>
            <div className="flex  gap-x-3 py-2 ">
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={() => {
                            router.push('/panel/owner/reservation')
                        }}
                        variant="default" className="h-full">
                        Yeni Rezervasyon
                    </Button>
                    <div className="flex items-center space-x-1 border bg-background text-black dark:text-white p-1 rounded-md h-full">
                        <Button
                            onClick={onClickPrevDate}
                            tooltip="Geri" variant="ghost" size="icon" className="">
                            <ChevronLeftIcon className="h-4 w-4" />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button tooltip="Tarih sec" variant="ghost" className="justify-start text-left font-normal ">
                                    <CalendarIcon className="h-4 w-4" />
                                    {/* {date ? format(date, "PPP") : <span>TURK FATIH TUTAK | 26 Eylül Perşembe</span>} */}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(date) => {
                                        setDate(date || new Date())
                                        console.log('updated22')

                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Button onClick={onClickNextDate} tooltip="ileri" variant="ghost" size="icon" className="">
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                        <Button onClick={onRefresh} tooltip="yenile" variant="ghost" size="icon" className="">
                            <RefreshCwIcon className="h-4 w-4" />
                        </Button>
                        <Button tooltip="ayarlar" variant="ghost" size="icon" className="">
                            <SettingsIcon className="h-4 w-4" />
                        </Button>
                        <Button tooltip="ara" variant="ghost" size="icon" className="">
                            <SearchIcon className="h-4 w-4" />
                        </Button>
                    </div>
                    <Select>
                        <SelectTrigger className="w-[180px]  h-full">
                            <SelectValue placeholder="TURK FATIH TUTAK" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="turk-fatih-tutak">TURK FATIH TUTAK</SelectItem>
                            {/* Add more options as needed */}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-1 border bg-background text-black dark:text-white p-1 rounded-md h-full">
                    <Button tooltip="bildirimler"
                        variant="ghost" size="icon" className="">
                        <IconBell className="size-[17px]" />
                    </Button>
                    <Button tooltip="notlar&uyarilar" variant="ghost" size="icon" className="">
                        <IconAlertTriangle className="size-[17px]" />
                    </Button>
                    <Button tooltip="muhasebe islemleri" variant="ghost" size="icon" className="">
                        <IconCashBanknote className="size-[17px]" />
                    </Button>
                    <Button
                        tooltip="toplu konfirmasyon islemleri"
                        variant="ghost" size="icon" className="">
                        <IconArchive className="size-[17px]" />
                    </Button>

                </div>
                <div className="flex gap-x-2">
                    <div className="flex items-center space-x-1 border bg-background text-black dark:text-white p-1 rounded-md h-full">
                        <Button tooltip="yazir" variant="ghost" size="icon" className="">
                            <IconPrinter className="h-4 w-4" />
                        </Button>
                        <Button tooltip="disa aktar" variant="ghost" size="icon" className="">
                            <IconDownload className="h-4 w-4" />
                        </Button>

                    </div>
                    <div className="flex items-center space-x-1 border bg-background text-black dark:text-white p-1 rounded-md h-full">
                        <Button tooltip="ozet" variant="ghost" size="icon" className="">
                            <IconInfoCircle className="h-4 w-4" />
                        </Button>
                        <Button tooltip="Masa Duzeni" variant="ghost" size="icon" className="">
                            <IconLayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button tooltip="Satlik Gorunum" variant="ghost" size="icon" className="">
                            <IconClockHour3 className="h-4 w-4" />
                        </Button>

                    </div>
                </div>

                <div className="ml-auto flex items-center space-x-1 border bg-background text-black dark:text-white p-1 rounded-md h-full">

                    <Button onClick={() => onToggleView('list')}
                        tooltip="liste gorunumu"
                        variant={view === 'list' ? 'default' : 'ghost'}
                        size="icon" className="">
                        <IconList className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => onToggleView('table')}
                        tooltip="masa gorunumu"
                        variant={view === 'table' ? 'default' : 'ghost'}
                        size="icon" className="">
                        <IconLayoutGrid className="h-4 w-4" />
                    </Button>
                </div>

            </div>
        </div>

    )
}