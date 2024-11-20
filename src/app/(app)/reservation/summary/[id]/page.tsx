"use client";
import HeadBanner from "@/components/custom/front/head-banner"
import { ReservationStatusHeader } from "../../_components/reservation-status-header"
import { useParams, useRouter } from "next/navigation"
import { FrontCard } from "@/components/custom/front/card"
import { IconCalendar, IconClock, IconGuests, IconLocation, IconTable, IconWallet } from "@/components/svgs"
import { useState } from "react"
import { localStorageStates } from "@/data/local-storage-states"
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper";
import { Button } from "@/components/custom/button";
import { cn } from "@/lib/utils";

export default function ReservationSummaryPage() {


    const router = useRouter()

    const onGoBack = () => {
        router.back()
    }

    const [reservationState, setReservationState] = useState(localStorageStates.getReservationState())

    const { id } = useParams()

    const reservationId = Number(id)

    const handleContinueToPrepaymentPage = () => {
        router.push(`/reservation/status/${reservationId}`)
    }

    return <div>
        <HeadBanner showHoldingSection={false} />
        <FrontMaxWidthWrapper>
            <div className="mt-10"></div>
            <ReservationStatusHeader onGoBack={onGoBack} />
            <div className="px-2">
                <SummaryCard
                    guestCount={reservationState?.guestCount!}
                    area={reservationState?.areaName!}
                    date={reservationState?.date!}
                    time={reservationState?.time!}
                />
                <Button onClick={handleContinueToPrepaymentPage} className="bg-front-primary rounded-sm w-full text-sm mt-4 h-[45px]">
                    Continue To Prepayment Page
                </Button>
            </div>
        </FrontMaxWidthWrapper>

    </div>
}

export const SummaryCard = ({
    guestCount,
    area,
    date,
    time,
    prepaymentAmount,
    className
}: {
    guestCount: number,
    area: string,
    date: Date,
    time: string,
    prepaymentAmount?: number,
    className?: string
}) => {
    return <FrontCard className={cn("bg-gray-50 ", className)}  >
        <FrontCard.Title>Summary</FrontCard.Title>

        <div className="flex flex-col gap-y-1">


            {/* location */}
            <div className="flex items-center">
                <IconLocation className="size-5 mr-2 text-front-primary" />
                <div className="text-sm text-front-primary">TURK FATIH TUTAK</div>
            </div>

            {/* date */}
            <div className="flex items-center">
                <IconCalendar className="size-5 mr-2 text-front-primary" />
                <div className="text-sm text-front-primary">{date?.toLocaleDateString()}</div>
            </div>

            {/* time */}
            <div className="flex items-center">
                <IconClock className="size-5 mr-2 text-front-primary" />
                <div className="text-sm text-front-primary">{time}</div>
            </div>
            {/* table */}
            <div className="flex items-center">
                <IconTable className="size-5 mr-2 text-front-primary" />
                <div className="text-sm text-front-primary">{area}</div>
            </div>
            {/* guests */}
            <div className="flex items-center">
                <IconGuests className="size-5 mr-2 text-front-primary" />
                <div className="text-sm text-front-primary">{guestCount} Guests</div>
            </div>


            {prepaymentAmount && <div className="flex items-center">
                <IconWallet className="size-5 mr-2 text-front-primary" />
                <div className="text-sm text-front-primary">{prepaymentAmount} TL</div>
            </div>}

        </div>

    </FrontCard>
}