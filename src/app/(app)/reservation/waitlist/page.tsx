"use client"
import { FrontCard } from "@/components/custom/front/card";
import { DateSelect } from "@/components/custom/front/date-select";
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper";
import { GuestSelect } from "@/components/custom/front/guest-select";
import HeadBanner from "@/components/custom/front/head-banner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReservationWaitlistPage() {

    const [date, setDate] = useState<Date | undefined>(new Date())
    const [guestCount, setGuestCount] = useState<number>(1)


    const router = useRouter()

    function handleContinue() {
        console.log('continue')
        router.push('/reservation/waitlist/join')
    }

    return <div>
        <HeadBanner showHoldingSection={false} />
        <FrontMaxWidthWrapper className="mt-10">
            <GuestSelect guestCount={guestCount} setGuestCount={setGuestCount} />
            <DateSelect date={date!} setDate={setDate} isWaitlistSelect={true} />

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
}