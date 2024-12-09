"use client"

import { AreaSelect } from "@/components/custom/front/area-select";
import { FrontCard } from "@/components/custom/front/card";
import { DateSelect } from "@/components/custom/front/date-select";
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper";
import { GuestSelect } from "@/components/custom/front/guest-select";
import HeadBanner from "@/components/custom/front/head-banner";
import { TimeSelect } from "@/components/custom/front/time-select";
import { Button } from "@/components/custom/button";
import { useReservationStates } from "@/hooks/front/useReservatoinStates";
import { useShowLoadingModal } from "@/hooks/useShowLoadingModal";
import { getNext3Months } from "@/lib/utils";
import { api, RouterOutputs } from "@/server/trpc/react";
import { EnumMealNumeric } from "@/shared/enums/predefined-enums";
import { useRouter } from "next/navigation";
import React, { createContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStartOfDay } from "@/hooks/useStartOfDay";



export type TMonthAvailabilityRow = RouterOutputs['reservation']['getMonthAvailabilityByGuestCount'][0]
type TRestaurantDailySettingData = RouterOutputs['restaurantSetting']['getDailySettings']


//define context
type TMonthAvailabilityContext = {
    monthAvailabilityData: TMonthAvailabilityRow[] | undefined
    guestCount: number,
    isLoadingMonthAvailability: boolean,
    selectedDate: Date | undefined,
    setSelectedDate: (date: Date | undefined) => void,
    selectedTime: string | undefined,
    setSelectedTime: (time: string | undefined) => void,
    selectedAreaId: number | undefined,
    setSelectedAreaId: (areaId: number | undefined) => void,
    areaName: string | undefined,
    setAreaName: (areaName: string | undefined) => void,
    month: Date,
    setMonth: (month: Date) => void,
    next3Months: Date[],
    dailySettings: TRestaurantDailySettingData | undefined,

}

export const MonthAvailabilityContext = createContext<TMonthAvailabilityContext>({} as TMonthAvailabilityContext)

export default function RootPage() {



    const { mutate: holdTable, isSuccess: isOccupiedTableSuccess, isPending: isOccupiedTableLoading } = api.reservation.holdTable.useMutation({})





    // void api.post.getLatest.prefetch();
    const router = useRouter();

    const next3Months = useMemo(() => getNext3Months(), [])

    const { getReservationState, updateReservationState, clearReservationState, updateWaitlistReservationState } = useReservationStates()

    const [today, setToday] = useState(next3Months[0]!)

    const [date, setDate] = React.useState<Date | undefined>(undefined)
    const [month, setMonth] = React.useState<Date>(today)
    const [guestCount, setGuestCount] = React.useState<number>(0)
    const [time, setTime] = React.useState<string | undefined>(undefined)
    const [areaId, setAreaId] = React.useState<number | undefined>(undefined)
    const [areaName, setAreaName] = React.useState<string | undefined>(undefined)
    function handleContinue() {
        updateReservationState({
            areaId: areaId!,
            date: date!,
            guestCount: guestCount,
            time: time!,
            areaName: areaName!
        })

        const isValid = date && areaId && guestCount && time
        if (!isValid) return
        date.setHours(Number(time?.split(':')[0]), Number(time?.split(':')[1]), 0)
        holdTable({
            date: date!,
            time: time!,
            guestCount: guestCount,
            mealId: EnumMealNumeric.dinner,
            roomId: areaId!
        })

    }

    useEffect(() => {
        if (isOccupiedTableSuccess) {
            router.push('/reservation/user-info')
        }
    }, [isOccupiedTableSuccess])


    function onClickAddWaitList(waitlistDate: Date) {
        updateWaitlistReservationState({
            date: waitlistDate,
            guestCount: guestCount,
        })
        router.push('/reservation/waitlist')
    }


    useEffect(() => {
        const reservationState = getReservationState()
        if (reservationState) {
            setGuestCount(reservationState.guestCount)
            setDate(reservationState.date)
            setTime(reservationState.time)
            setAreaId(reservationState.areaId)
        }
    }, [])



    // const { data: monthAvailabilityData, isLoading: isLoadingMonthAvailability } = api.reservation.getMonthAvailability.useQuery({
    //     month: month,
    //     mealId: EnumMealNumeric.dinner
    // })


    const { data: monthAvailabilityData, isLoading: isLoadingMonthAvailability } = api.reservation.getMonthAvailabilityByGuestCount.useQuery({
        month: month.getMonth(),
        mealId: EnumMealNumeric.dinner,
        guestCount: guestCount,
        monthDate: month

    }, {
        enabled: !!guestCount
    })



    const queryDateDailySettings = useStartOfDay(date);
    const { data: dailySettings, isLoading: isLoadingDailySettings } = api.restaurantSetting.getDailySettings.useQuery({
        date: queryDateDailySettings,
    })


    // const { data: monthAvailabilityByGuestCountData, isLoading: isLoadingMonthAvailabilityByGuestCount } = api.reservation.getMonthAvailabilityByGuestCount.useQuery({
    //     month: month.getMonth(),
    //     mealId: EnumMealNumeric.dinner,
    //     guestCount: guestCount
    // })


    //"dd-mm-yy"
    const [avaliableDates, setAvaliableDates] = useState<Record<string, TMonthAvailabilityRow>>({});





    const handleGuestCountChange = (guestCount: number) => {



        setGuestCount(guestCount)
    }



    const { t } = useTranslation('common')

    console.log(t('welcome'))
    console.log(date, 'date')


    const contextValue: TMonthAvailabilityContext = {
        monthAvailabilityData,
        guestCount,
        isLoadingMonthAvailability,
        selectedDate: date,
        setSelectedDate: setDate,
        selectedTime: time,
        setSelectedTime: setTime,
        selectedAreaId: areaId,
        setSelectedAreaId: setAreaId,
        areaName,
        setAreaName,
        month,
        setMonth,
        next3Months,
        dailySettings
    }


    useShowLoadingModal([isLoadingMonthAvailability])


    return (
        <MonthAvailabilityContext.Provider value={contextValue}>
            <div className='relative h-full overflow-hidden bg-background flex text-front-primary'>
                <div className="main h-screen overflow-y-scroll flex-1">
                    <div className="text-5xl h-[200vh] ">
                        <HeadBanner />
                        <FrontMaxWidthWrapper className="">
                            <GuestSelect guestCount={guestCount} setGuestCount={setGuestCount} />
                            <DateSelect date={date} setDate={setDate} onClickAddWaitList={onClickAddWaitList} />
                            <TimeSelect time={time} setTime={setTime} />
                            <AreaSelect areaId={areaId} setAreaId={setAreaId} />
                            <div className="px-2 md:px-0">
                                <Button loading={isOccupiedTableLoading} onClick={handleContinue} className="bg-front-primary text-white w-full h-[45px] rounded-sm mt-6">Continue</Button>
                                <FrontCard className="mt-6">
                                    <FrontCard.Title className="">Are you a large group?</FrontCard.Title>
                                    <div className="font-light text-sm ">To ensure a smooth experience for all our guests, a
                                        <span className="font-medium"> maximum of 5 people </span>
                                        per booking are allowed on a single table.</div>
                                </FrontCard>
                            </div>
                        </FrontMaxWidthWrapper>

                    </div>
                </div>
            </div>
        </MonthAvailabilityContext.Provider>

    );
}
