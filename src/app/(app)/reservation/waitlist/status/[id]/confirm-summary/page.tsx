"use client";
import { ReservationStatusHeader } from "@/app/(app)/reservation/_components/reservation-status-header";
import { SummaryCard } from "@/app/(app)/reservation/_components/summary-card";
import { Button } from "@/components/custom/button";
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper";
import HeadBanner from "@/components/custom/front/head-banner";
import { useReservationStates } from "@/hooks/front/useReservatoinStates";
import { api } from "@/server/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useWaitlistStatusContext } from "../layout";

export default function ReservationSummaryPage() {


    const router = useRouter()

    const onGoBack = () => {
        router.back()
    }

    const { waitlistStatusData } = useWaitlistStatusContext();

    const { getReservationState } = useReservationStates()



    const reservationId = waitlistStatusData?.assignedReservationId

    const { data: reservationData } = api.reservation.getReservationStatusData.useQuery({ reservationId: waitlistStatusData?.assignedReservationId! }, {
        enabled: !!waitlistStatusData?.assignedReservationId
    })

    const handleContinueToPrepaymentPage = () => {
        router.push(`/reservation/status/${reservationId}`)
    }

    return <div>
        <HeadBanner showHoldingSection={false} />
        <FrontMaxWidthWrapper>
            
            <ReservationStatusHeader showBackButton={false} onGoBack={onGoBack} />
            <div className="px-2">
                <SummaryCard
                    guestCount={reservationData?.guestCount!}
                    area={reservationData?.roomName!}
                    date={reservationData?.reservationDate!}
                    time={reservationData?.hour!}
                />
                <Button onClick={handleContinueToPrepaymentPage} className="bg-front-primary rounded-sm w-full text-sm mt-4 h-[45px]">
                    Continue To Prepayment Page
                </Button>
            </div>
        </FrontMaxWidthWrapper>

    </div>
}

