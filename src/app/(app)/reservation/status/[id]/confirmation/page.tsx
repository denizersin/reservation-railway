"use client";
import { Button } from "@/components/custom/button";
import { FrontCard } from "@/components/custom/front/card";
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper";
import HeadBanner from "@/components/custom/front/head-banner";
import { IconCalendar, IconClock, IconGuests, IconLocation, IconTable, IconWallet } from "@/components/svgs";
import { useShowLoadingModal } from "@/hooks/useShowLoadingModal";
import { cn } from "@/lib/utils";
import { api } from "@/server/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useReservationStatusContext } from "../layout";

export default function ReservationConfirmationPage() {


    const { reservationStatusData, } = useReservationStatusContext()

    const queryClient = useQueryClient()

    const { mutate: confirmReservation, isPending } = api.reservation.confirmPublicReservation.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.reservation.getReservationStatusData) })
        }
    })

    const handleConfirmation = () => {
        confirmReservation({ reservationId: reservationStatusData?.id! })
    }

    useShowLoadingModal([isPending])

    return <div>
        <HeadBanner showHoldingSection={false} />
        <FrontMaxWidthWrapper>
            <div className="mt-10"></div>
            <div className="px-2">
                <SummaryCard
                    guestCount={reservationStatusData?.guestCount!}
                    area={reservationStatusData?.roomName!}
                    date={reservationStatusData?.reservationDate!}
                    time={reservationStatusData?.hour!}
                />
                <Button loading={isPending} onClick={handleConfirmation} className="bg-front-primary rounded-sm w-full text-sm mt-4 h-[45px]">
                    Will you be able to attend?
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