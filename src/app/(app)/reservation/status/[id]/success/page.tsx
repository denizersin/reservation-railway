"use client";
import { Button } from "@/components/custom/button";
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper";
import HeadBanner from "@/components/custom/front/head-banner";
import { ResponsiveModal, ResponsiveModalHandleRef } from "@/components/modal/responsive-modal";
import { IconAppleCalendar, IconGoogleCalendar, IconOutlookCalendar, IconSuccess, IconWarning } from "@/components/svgs";
import { useShowLoadingModal } from "@/hooks/useShowLoadingModal";
import { api } from "@/server/trpc/react";
import { EnumReservationStatus } from "@/shared/enums/predefined-enums";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { DressCodeCard } from "../../../_components/dress-code-card";
import { ReservationStatusHeader } from "../../../_components/reservation-status-header";
import { TermsConditionsCard } from "../../../_components/terms-conditions-card";
import { SummaryCard } from "../../../summary/[id]/page";
import { useReservationStatusContext } from "../layout";

export default function ReservationSummaryPage() {

    const { reservationStatusData } = useReservationStatusContext()

    const router = useRouter()

    const onGoBack = () => {
        router.back()
    }


    const cancelReservationModalRef = useRef<ResponsiveModalHandleRef>({})

    const cancelReservationConfirmationModalRef = useRef<ResponsiveModalHandleRef>({})


    const queryClient = useQueryClient()

    const {
        mutate: cancelPublicReservation,
        isPending: isCancelingPublicReservation
    } = api.reservation.cancelPublicReservation.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.reservation.getReservationStatusData) })
        }
    })

    const handleCancelReservation = () => {
        cancelPublicReservation({ reservationId: reservationStatusData?.id! })
    }

    const addToCalendarModalRef = useRef<ResponsiveModalHandleRef>({})

    const onClickAddToCalendar = () => {
        addToCalendarModalRef.current.closeModal?.()
    }

    useShowLoadingModal([isCancelingPublicReservation])

    const canCancelReservation = reservationStatusData?.reservationStatus.status !== EnumReservationStatus.completed

    return <div>
        <HeadBanner showHoldingSection={false} />
        <FrontMaxWidthWrapper className="pb-10">
            <div className=""></div>
            <ReservationStatusHeader
                date={reservationStatusData?.reservationDate}
                time={reservationStatusData?.hour}
                guestCount={reservationStatusData?.guestCount}
                showBackButton={false} onGoBack={onGoBack} />
            <div className="px-2">

                <div className="flex flex-col items-center justify-center w-full">
                    <div className="h-40 overflow-hidden">
                        <IconSuccess className="size-48  " />
                    </div>
                    <div className=" text-lg md:text-xl font-bold text-front-primary mb-8">Your Reservation is Successful!</div>
                </div>

                <SummaryCard
                    guestCount={reservationStatusData?.guestCount!}
                    area={reservationStatusData?.roomName!}
                    date={reservationStatusData?.reservationDate!}
                    time={reservationStatusData?.hour!}
                    prepaymentAmount={reservationStatusData?.currentPrepayment?.amount}
                    className="my-6 "
                />

                <div className="my-6 flex gap-x-3 h-[45px] ">
                    <Button
                        onClick={() => addToCalendarModalRef.current.openModal?.()}
                        variant={'outline'} className="rounded-sm flex-1 h-full border-front-primary text-front-primary">
                        Add to Calendar
                    </Button>
                    <Button
                        disabled={!canCancelReservation}
                        onClick={() => cancelReservationModalRef.current.openModal?.()}
                        variant={'outline'} className="rounded-sm flex-1 h-full border-destructive">
                        Cancel Reservation
                    </Button>
                </div>

                <div className="my-6">
                    <TermsConditionsCard />
                </div>

                <div className="my-6">
                    <DressCodeCard />
                </div>

                <div className="my-6">
                    <Image
                        className="max-w-full"
                        src='/map-ss.png' alt="map" width={638} height={477} />
                </div>

                <div className="flex flex-col items-center justify-center">
                    <Button variant={'ghost'}>
                        Change your reservation?
                    </Button>
                    <div className="text-sm text-front-primary">Please contact us for date/time, change of number of people and all your other request.</div>
                    <div className="flex gap-x-2">
                        <div className="">(0212) 243 26 33</div>
                        <div className="">info@turkfatih.com</div>
                    </div>
                </div>


            </div>
        </FrontMaxWidthWrapper>

        <ResponsiveModal
            handleRef={cancelReservationModalRef}
            modalContentClassName="max-w-[630px] flex flex-col items-center gap-y-4"
            sheetContentClassName="flex flex-col items-center gap-y-4"
        >
            <IconWarning className="size-8 text-[#94A3B8]" />
            <div className="max-w-[369px] text-center  text-xl font-medium text-front-primary">Cancel Reservation</div>
            <div className="max-w-[369px] text-center text-gray-500">The amount you have paid for your reservation will not be refunded.</div>
            <div className="max-w-[369px] text-center text-gray-500">Are you sure you want to cancel this reservation?</div>

            <div className="flex gap-x-3 w-full h-[45px] mt-4 mb-4">
                <Button
                    onClick={() => cancelReservationModalRef.current.closeModal?.()}
                    variant={'outline'} className="rounded-sm flex-1 h-full border-front-primary text-sm">No Cancel</Button>
                <Button
                    onClick={() => {
                        console.log('closee')
                        cancelReservationConfirmationModalRef.current.openModal?.()
                        cancelReservationModalRef.current.closeModal?.()
                    }}
                    className="bg-front-primary text-white rounded-sm flex-1 h-full text-sm">Yes, I am sure</Button>
            </div>
        </ResponsiveModal>

        <ResponsiveModal
            handleRef={cancelReservationConfirmationModalRef}
            modalContentClassName="max-w-[630px] flex flex-col items-center gap-y-4"
            sheetContentClassName="flex flex-col items-center gap-y-4"
        >
            <IconWarning className="size-8 text-[#94A3B8]" />
            <div className="max-w-[369px] text-center  text-xl font-medium text-front-primary">Cancel Reservation</div>
            <div className="max-w-[369px] text-center text-gray-500">Are you sure you want to cancel this reservation?</div>

            <div className="flex gap-x-3 w-full h-[45px] mt-4 mb-4">
                <Button
                    onClick={() => cancelReservationConfirmationModalRef.current.closeModal?.()}
                    variant={'outline'} className="rounded-sm flex-1 h-full border-front-primary text-sm">No Cancel</Button>
                <Button
                    onClick={handleCancelReservation}

                    className="bg-front-primary text-white rounded-sm flex-1 h-full text-sm">Yes, I am sure</Button>
            </div>
        </ResponsiveModal>


        <ResponsiveModal
            modalContentClassName="max-w-[630px] flex flex-col items-center gap-y-4"
            sheetContentClassName="flex flex-col items-center gap-y-3"
            handleRef={addToCalendarModalRef}
        >
            <div className="max-w-[369px] text-center  text-xl font-medium text-front-primary">Add to Calendar</div>

            <div
                onClick={onClickAddToCalendar}
                className="bg-gray-100 w-full flex justify-center items-center gap-x-3 h-[56px] cursor-pointer hover:bg-gray-200">
                <IconGoogleCalendar className="size-8 " />
                <div className="text-sm text-front-primary font-medium">Add to Google Calendar</div>
            </div>

            {/* applecalendar */}

            <div
                onClick={onClickAddToCalendar}
                className="bg-gray-100 w-full flex justify-center items-center gap-x-3 h-[56px] cursor-pointer hover:bg-gray-200">
                <IconAppleCalendar className="size-8 " />
                <div className="text-sm text-front-primary font-medium">Add to Apple Calendar</div>
            </div>

            {/* outlookcalendar */}

            <div
                onClick={onClickAddToCalendar}
                className="bg-gray-100 w-full flex justify-center items-center gap-x-3 h-[56px] cursor-pointer hover:bg-gray-200">
                <IconOutlookCalendar className="size-8 " />
                <div className="text-sm text-front-primary font-medium">Add to Outlook Calendar</div>
            </div>


        </ResponsiveModal>

    </div>
}