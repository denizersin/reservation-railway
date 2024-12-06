"use client";
import { Button } from "@/components/custom/button";
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper";
import HeadBanner from "@/components/custom/front/head-banner";
import { useReservationStates } from "@/hooks/front/useReservatoinStates";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ReservationStatusHeader } from "../../_components/reservation-status-header";
import { SummaryCard } from "../../_components/summary-card";

export default function ReservationSummaryPage() {


    const router = useRouter()

    const onGoBack = () => {
        router.back()
    }

    const { getReservationState } = useReservationStates()

    const [reservationState, setReservationState] = useState(getReservationState())

    const { id } = useParams()

    const reservationId = Number(id)

    const handleContinueToPrepaymentPage = () => {
        router.push(`/reservation/status/${reservationId}`)
    }

    return <div>
        <HeadBanner showHoldingSection={false} />
        <FrontMaxWidthWrapper>
            
            <ReservationStatusHeader showBackButton={false} onGoBack={onGoBack} />
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

