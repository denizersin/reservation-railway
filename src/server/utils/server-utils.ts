import { DEFAULT_UTC_OFFSET } from "./server-constants";

export const REFRESH_TOKEN_EXPIRY_DAYS = 30
export const JWT_EXPIRY_DAYS = 5

//make this function

export const getEnumValues = <T extends object>(enumType: T) => {
    type Key = keyof typeof enumType;
    type Value = typeof enumType[Key]
    return Object.values(enumType) as [Value, ...Value[]]
}




export function formatTimeWithoutSeconds(time: string): string {
    return time.slice(0, 5);  // '12:30:00' -> '12:30'
}

export function formatimeWithSeconds(time: string): string {
    // Saniye ekleyerek dönüştür
    return `${time}:00`; // '12:30' -> '12:30:00'
}


export function getLocalTime(date: Date): Date {
    return new Date(date.getTime() + 3 * 60 * 60 * 1000);
}

export function getStartAndEndOfDay(
    { date, utcOffset = DEFAULT_UTC_OFFSET }: { date: Date, utcOffset?: number }
): { start: Date, end: Date } {
    const newDate=new Date(date)
    const startOfDay = new Date(newDate.setUTCHours(0, 0, 0, 0) - (utcOffset * 60 * 60 * 1000));
    const endOfDay = new Date(newDate.setUTCHours(23, 59, 59, 999) - (utcOffset * 60 * 60 * 1000));
    return { start: startOfDay, end: endOfDay };
}



export function utcHourToLocalHour(hour: string, utcOffset = DEFAULT_UTC_OFFSET): string {
    const [h, m] = hour.split(':').map(Number);
    const hours = h as number
    const minutes = m as number
    if (isNaN(hours) || isNaN(minutes)) {
        throw new Error('Invalid time format');
    }

    // Apply the offset and normalize to 24-hour format
    let localHours = (hours + utcOffset + 24) % 24;

    // Format hours and minutes to two digits
    const formattedHours = localHours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
}

export function localHourToUtcHour(localTime: string, utcOffset = DEFAULT_UTC_OFFSET): string {
    
    const [h, m] = localTime.split(':').map(Number);
    const hours = h as number
    const minutes = m as number
    if (isNaN(hours) || isNaN(minutes)) {
        throw new Error('Invalid time format');
    }

    // Calculate UTC hours and normalize to 24-hour format
    let utcHours = (hours - utcOffset) % 24;

    // Normalize negative hours
    if (utcHours < 0) {
        utcHours += 24;
    }

    // Format hours and minutes to two digits
    const formattedHours = utcHours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
}



export function getMonthDays(startDate: Date, endDate: Date) {
    const days: Date[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
}


//getRandom 
export function getRandom(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
