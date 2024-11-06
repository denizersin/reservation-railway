"use client";
import HeadBanner from "@/components/custom/front/head-banner"
import { ReservationStatusHeader } from "../_components/reservation-status-header"
import { useRouter } from "next/navigation"
import { FrontCard } from "@/components/custom/front/card"
import { IconCalendar, IconClock, IconGuests, IconLocation, IconSuccess, IconTable, IconWallet } from "@/components/svgs"
import { useState } from "react"
import { localStorageStates } from "@/data/local-storage-states"
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper";
import { Button } from "@/components/custom/button";
import { cn } from "@/lib/utils";
import { SummaryCard } from "../summary/page";

export default function ReservationSummaryPage() {


    const router = useRouter()

    const onGoBack = () => {
        router.back()
    }

    const [reservationState, setReservationState] = useState(localStorageStates.getReservationState())


    const handleContinueToPrepaymentPage = () => {
        router.push('/reservation/prepayment')
    }

    return <div>
        <HeadBanner showHoldingSection={false} />
        <FrontMaxWidthWrapper>
            <div className="mt-10"></div>
            <div className="px-2">


                <div className="flex flex-col items-center justify-center w-full">
                    <div className="h-40 overflow-hidden">
                        <IconSuccess className="size-48  text-destructive" />
                    </div>
                    <div className=" text-lg md:text-xl font-bold text-front-primary mb-12">Your Reservation is Cancelled!</div>
                </div>

                <SummaryCard
                    guestCount={reservationState?.guestCount!}
                    area={reservationState?.area!}
                    date={reservationState?.date!}
                    time={reservationState?.time!}
                />

                <div className="my-4 mt-14">
                    <div className="text-center text-front-primary font-semibold">Contact Us</div>

                    <div className="text-sm text-center my-3">Do you have any questions? Please contact us</div>

                    <div className="flex gap-x-3 font-semibold text-sm justify-center w-full my-3">
                        <div className="">(0212) 243 26 33</div>
                        <div className="">info@fatihtutak.com</div>
                    </div>
                </div>
            </div>
        </FrontMaxWidthWrapper>

    </div>
}

