"use client"

import { AreaSelect } from "@/components/custom/front/area-select";
import { FrontCard } from "@/components/custom/front/card";
import { DateSelect } from "@/components/custom/front/date-select";
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper";
import { GuestSelect } from "@/components/custom/front/guest-select";
import HeadBanner from "@/components/custom/front/head-banner";
import { TimeSelect } from "@/components/custom/front/time-select";
import useAuth from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { localStorageStates } from "@/data/local-storage-states";
import useLocalStorage from "@/hooks/useLocalStorage";
import { api } from "@/server/trpc/react";
import { EnumHeader, EnumMealNumeric, EnumUserRole } from "@/shared/enums/predefined-enums";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";


export default function Home() {

  // void api.post.getLatest.prefetch();

  const pathname = usePathname();

  const session = useAuth()

  const router = useRouter();


  useEffect(() => {
    if (session.isLoading) return;
    if (!session.isAuthenticated) {
      //!TODO: remove this
      // router.push('/auth/login')
      return;
    };
    if (session.session?.user.userRole === EnumUserRole.admin && !pathname.includes('admin')) {
      router.push('/admin')
    } else if (session.session?.user.userRole === EnumUserRole.owner && !pathname.includes('owner')) {
      router.push('/owner')
    }


  }, [session.isAuthenticated, session.isLoading])

  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [month, setMonth] = React.useState<number>(new Date().getMonth())
  const [guestCount, setGuestCount] = React.useState<number>(1)
  const [time, setTime] = React.useState<string | undefined>(undefined)
  const [area, setArea] = React.useState<string | undefined>(undefined)

  function handleContinue() {
    localStorageStates.updateReservationState({
      area: area!,
      date: date!,
      guestCount: guestCount,
      time: time!
    })

    router.push('/reservation/user-info')
  }



  function onClickAddWaitList() {
    router.push('/reservation/waitlist')
  }

  useEffect(() => {
    const reservationState = localStorageStates.getReservationState()
    if (reservationState) {
      setGuestCount(reservationState.guestCount)
      setDate(reservationState.date)
      setTime(reservationState.time)
      setArea(reservationState.area)
    }



  }, [])

  const [restaurantId, setRestaurantId] = useLocalStorage({
    key: EnumHeader.RESTAURANT_ID,
    defaultValue: 1,
  })



  const { data: monthAvailabilityData } = api.reservation.getMonthAvailability.useQuery({
    month: month,
    mealId: EnumMealNumeric.dinner
  })


  const [avaliableDates, setAvaliableDates] = useState<Record<string, boolean>>({})


  const handleGuestCountChange = (guestCount: number) => {

    monthAvailabilityData?.forEach((day) => {
      const date = day.date
      const avaliableTables = day.roomStatus.map((room) => room.hourStatus.filter((hour) => (hour.avaliableGuest >= guestCount)))
      setAvaliableDates((prev) => ({
        ...prev,
        [date.toISOString()]: avaliableTables.length > 0
      }))
    })


    setGuestCount(guestCount)
  }










  return (
    <div className='relative h-full overflow-hidden bg-background flex text-front-primary'>
      <div className="main h-screen overflow-y-scroll flex-1">
        <div className="text-5xl h-[200vh] ">
          <HeadBanner />
          <FrontMaxWidthWrapper className="mt-10">
            <GuestSelect guestCount={guestCount} setGuestCount={setGuestCount} />
            <DateSelect date={date!} setDate={setDate} onClickAddWaitList={onClickAddWaitList} />
            <TimeSelect time={time} setTime={setTime} />
            <AreaSelect area={area} setArea={setArea} />
            <div className="px-2 md:px-0">
              <Button onClick={handleContinue} className="bg-front-primary text-white w-full h-[45px] rounded-sm mt-6">Continue</Button>
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
  );
}
