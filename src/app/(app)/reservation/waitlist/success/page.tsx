"use client"
import { Button } from "@/components/custom/button";
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper";
import HeadBanner from "@/components/custom/front/head-banner";
import { ResponsiveModal, ResponsiveModalHandleRef } from "@/components/modal/responsive-modal";
import { IconCalendar, IconGuests, IconLocation, IconSuccess, IconWarning } from "@/components/svgs";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function WaitlistSuccessPage() {


    const cancelWaitlistModalRef = useRef<ResponsiveModalHandleRef>({})


    const router = useRouter()

    const onClickLeaveWaitlist = () => {
        router.push('/reservation/waitlist/cancel')
    }

    return <div>
        <HeadBanner showHoldingSection={false} />
        <FrontMaxWidthWrapper className="pb-10 max-w-[525px]">
            <div className=""></div>
            <div className="px-2">

                <div className="flex flex-col items-center justify-center w-full">
                    <div className="h-40 overflow-hidden">
                        <IconSuccess className="size-48  " />
                    </div>
                    <div className=" text-lg md:text-xl font-bold text-front-primary mb-8 ">You have been placed on the waiting list</div>
                </div>

                <div className="flex p-4 md:p-8  justify-between border-front-primary border-[.5px] rounded-sm">
                    <div className="flex items-center space-x-2">
                        <div className="c">
                            <IconLocation className="size-8" />
                        </div>
                        <div className="c">
                            <div className="text-sm font-bold">RESTAURANT</div>
                            <div className="text-xs">TURK FATIH TUTAK</div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="c">
                            <IconCalendar className="size-8" />
                        </div>
                        <div className="c">
                            <div className="text-sm font-bold">FRIDAY</div>
                            <div className="text-xs">20 SEP 2024</div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="c">
                            <IconGuests className="size-8" />
                        </div>
                        <div className="c">
                            <div className="text-sm font-bold">GUESTS</div>
                            <div className="text-xs">2</div>
                        </div>
                    </div>

                </div>

                <Button
                    onClick={() => cancelWaitlistModalRef.current.openModal?.()}
                variant={'outline'} className=" border-destructive w-full h-[45px] mt-6 text-destructive hover:text-destructive hover:bg-gray-50">
                    Leave The  Waitinglist
                </Button>

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



        <ResponsiveModal
            handleRef={cancelWaitlistModalRef}
            modalContentClassName="max-w-[630px] flex flex-col items-center gap-y-4"
            sheetContentClassName="flex flex-col items-center gap-y-4"
        >
            <IconWarning className="size-8 text-[#94A3B8]" />
            <div className="max-w-[369px] text-center  text-xl font-medium text-front-primary">Leave the waitlist?</div>
            <div className="max-w-[369px] text-center text-gray-500">Are you sure you want to leave the waiting list?</div>

            <div className="flex gap-x-3 w-full h-[45px] mt-4 mb-4">
                <Button
                    onClick={() => cancelWaitlistModalRef.current.closeModal?.()}
                    variant={'outline'} className="rounded-sm flex-1 h-full border-front-primary text-sm">No Cancel</Button>
                <Button
                    onClick={() => {
                        cancelWaitlistModalRef.current.closeModal?.()
                        onClickLeaveWaitlist()
                    }}
                    className="bg-front-primary text-white rounded-sm flex-1 h-full text-sm">Yes, I am sure</Button>
            </div>
        </ResponsiveModal>




    </div>

}