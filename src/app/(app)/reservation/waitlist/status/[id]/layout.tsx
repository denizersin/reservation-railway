"use client"
import { useShowLoadingModal } from "@/hooks/useShowLoadingModal"
import { api, RouterOutputs } from "@/server/trpc/react"
import { EnumWaitlistStatus } from "@/shared/enums/predefined-enums"
import { useParams, useRouter } from "next/navigation"
import { createContext, useContext, useEffect } from "react"

type TWaitlistStatusData = RouterOutputs['waitlist']['getWaitlistStatusData']

type TWaitlistStatusContext = {
    waitlistStatusData: TWaitlistStatusData | undefined
    isLoading: boolean
}

const WaitlistStatusContext = createContext<TWaitlistStatusContext>({} as TWaitlistStatusContext)

export function useWaitlistStatusContext() {
    return useContext(WaitlistStatusContext)
}

type Props = {
    children: React.ReactNode
    params: {
        id: string
    }
}

export default function Layout({ children, params }: Props) {

    const { id } = useParams()

    const waitlistId = Number(id)

    const router = useRouter()


    const { data: waitlistStatusData, isLoading } = api.waitlist.getWaitlistStatusData.useQuery({ waitlistId })


    useEffect(() => {
        if (!waitlistStatusData) return

        const isCanceled = waitlistStatusData.status === EnumWaitlistStatus.cancelled
        const isConfirmed = waitlistStatusData.status === EnumWaitlistStatus.confirmed
        const isCreated = waitlistStatusData.status === EnumWaitlistStatus.created

        console.log('waitlistStatusData', waitlistStatusData)

        if (isCanceled) {
            router.replace(`/reservation/waitlist/status/${waitlistId}/cancel`)
        }
        else if (isConfirmed) {
            router.replace(`/reservation/waitlist/status/${waitlistId}/confirm-summary`)
        }
        else if (isCreated) {
            router.replace(`/reservation/waitlist/status/${waitlistId}/created`)
        }

    }, [waitlistStatusData])

    useShowLoadingModal([isLoading])

    return (
        <WaitlistStatusContext.Provider value={{
            waitlistStatusData: waitlistStatusData!,
            isLoading
        }}>
            {children}
        </WaitlistStatusContext.Provider>
    )
}