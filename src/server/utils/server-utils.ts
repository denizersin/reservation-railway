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