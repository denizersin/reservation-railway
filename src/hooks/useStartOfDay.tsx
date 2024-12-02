import { DEFAULT_UTC_OFFSET } from "@/server/utils/server-constants"
import { useMemo } from "react"

export const useStartOfDay = (date?: Date) => {
    const queryDate = useMemo(() => {
        // Turkey's timezone offset (UTC+3)
        const turkeyTimezoneOffset = 3;
        
        const now = date || new Date();
        
        // Create a new date object for Turkey time
        const turkeyTime = new Date(now);
        
        // Set the time to start of day in Turkey's timezone
        const startOfDay = new Date(Date.UTC(
            turkeyTime.getFullYear(),
            turkeyTime.getMonth(),
            turkeyTime.getDate(),
            0, // Set to midnight in UTC
            0,
            0,
            0
        ));
        
        // Adjust for Turkey's timezone
        startOfDay.setUTCHours(startOfDay.getUTCHours() - turkeyTimezoneOffset);
        
        return startOfDay;
    }, [date])
    
    return queryDate;
}