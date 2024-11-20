import { IconAlarm, IconArrowLeft } from "@/components/svgs"
import { localStorageStates } from "@/data/local-storage-states"
import { useState } from "react"

export const ReservationStatusHeader = ({
    onGoBack,
    showBackButton = true
}: {
    onGoBack: () => void
    showBackButton?: boolean
}) => {

    const [reservationState, setReservationState] = useState(localStorageStates.getReservationState())


    return <div className="flex items-center mb-8">
        {showBackButton && <IconArrowLeft onClick={onGoBack} className="size-5 mr-2 text-front-primary cursor-pointer" />}
        <div className="text-lg flex-1 flex justify-center items-center">
            <IconAlarm className="size-5 mr-2 text-front-primary " />
            <div className="w-max h-max border-b border-front-primary text-front-primary text-sm">
                {reservationState?.guestCount} guests,{" "}
                {reservationState?.date?.toLocaleDateString?.()} at{" "}
                {reservationState?.time}
            </div>
        </div>
    </div>
}