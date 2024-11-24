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
import { useReservationStatusContext } from "../layout";

export default function ReservationSummaryPage() {


    const router = useRouter()

    const onGoBack = () => {
        router.back()
    }

    const { reservationStatusData } = useReservationStatusContext();

    const { getReservationState } = useReservationStates()



    const reservationId = reservationStatusData?.id

    const { data: reservationData } = api.reservation.getReservationStatusData.useQuery({ reservationId: reservationStatusData?.id! }, {
        enabled: !!reservationStatusData?.id
    })

    const handleContinueToPrepaymentPage = () => {
        router.push(`/reservation/status/${reservationId}/prepayment/payment`)
    }

    return <div>
        <HeadBanner showHoldingSection={false} />
        <FrontMaxWidthWrapper>
            <div className="mt-10"></div>
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

