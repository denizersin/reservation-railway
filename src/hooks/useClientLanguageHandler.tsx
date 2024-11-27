import { useEffect } from "react";
import { useLanguage } from "./useLanguage";
import useFirstRender from "./useFirstRender";
import { getQueryKey } from "@trpc/react-query";
import { api } from "@/server/trpc/react";
import { useQueryClient } from "@tanstack/react-query";


const apiKeys=[
    getQueryKey(api.room.getRooms),
    getQueryKey(api.restaurant.getTags),
    getQueryKey(api.reservation.getActiveReviewsByLanguage),
]

export function useClientLanguageHandler() {


    const { language } = useLanguage()

    const isFirstRender = useFirstRender()

    const queryClient = useQueryClient()

    useEffect(() => {
        if (isFirstRender) return

        apiKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: key })
        })


    }, [language])

}