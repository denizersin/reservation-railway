"use client";
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper";
import HeadBanner from "@/components/custom/front/head-banner";
import { IconSuccess } from "@/components/svgs";
import { useRouter } from "next/navigation";
import { useReservationStatusContext } from "../layout";
import { SummaryCard } from "../../../_components/summary-card";

export default function ReservationCancelPage() {

    const { reservationStatusData } = useReservationStatusContext()


    const router = useRouter()



    return <div>
        <HeadBanner showHoldingSection={false} />
        <FrontMaxWidthWrapper>
            
            <div className="px-2">


                <div className="flex flex-col items-center justify-center w-full">
                    <div className="h-40 overflow-hidden">
                        <IconSuccess className="size-48  text-front-primary" />
                    </div>
                    <div className=" text-lg md:text-xl font-bold text-front-primary mb-12">Thank you for your review!</div>
                </div>

                <SummaryCard
                    guestCount={reservationStatusData?.guestCount!}
                    area={reservationStatusData?.roomName!}
                    date={reservationStatusData?.reservationDate!}
                    time={reservationStatusData?.hour!}
                    prepaymentAmount={reservationStatusData?.currentPrepayment?.amount}
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

