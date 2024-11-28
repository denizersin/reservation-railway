import { DEFAULT_UTC_OFFSET } from "@/server/utils/server-constants"
import { useMemo } from "react"

export const useStartOfDay = (date?: Date) => {

    const queryDate = useMemo(() => {

        // Türkiye'nin timezone offset'i (UTC+3)
        const turkeyTimezoneOffset = 3;

        const now = date || new Date();

        // Direkt olarak Türkiye saatine çevirelim
        const turkeyTime = new Date(now.getTime() + (3600000 * (turkeyTimezoneOffset)));

        // Günün başlangıcını ayarlayalım (saat 00:00)
        const startOfDay = new Date(Date.UTC(
            turkeyTime.getFullYear(),
            turkeyTime.getMonth(),
            turkeyTime.getDate(),
            -turkeyTimezoneOffset, // UTC'de günün başlangıcı için gerekli saat offseti
            0,
            0,
            0
        ));





        return startOfDay

    }, [date])
    return queryDate
}