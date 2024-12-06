import { IconAlarm, IconArrowLeft } from "@/components/svgs"
import { useReservationStates } from "@/hooks/front/useReservatoinStates"
import { useState } from "react"

export const ReservationStatusHeader = ({
    onGoBack,
    showBackButton = true,
    guestCount,
    date,
    time
}: {
    onGoBack: () => void
    showBackButton?: boolean,
    guestCount?: number
    date?: Date
    time?: string
}) => {

    const { getReservationState } = useReservationStates()
    const [reservationState, setReservationState] = useState(getReservationState())


    const count = guestCount ?? reservationState?.guestCount
    const dateString = date?.toLocaleDateString?.() ?? reservationState?.date?.toLocaleDateString?.()
    const timeValue = time ?? reservationState?.time

    return <div className="flex items-center mb-10">
        {showBackButton && <IconArrowLeft onClick={onGoBack} className="size-5 mr-2 text-front-primary cursor-pointer" />}
        <div className="text-lg flex-1 flex justify-center items-center">
            <IconAlarm className="size-5 mr-2 text-front-primary " />
            <div className="w-max h-max border-b border-front-primary text-front-primary text-sm">
                {count} guests,{" "}
                {dateString} at{" "}
                {timeValue}
            </div>
        </div>
    </div>
}