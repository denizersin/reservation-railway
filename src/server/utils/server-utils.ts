export const REFRESH_TOKEN_EXPIRY_DAYS = 30
export const JWT_EXPIRY_DAYS = 5

//make this function

export const getEnumValues = <T extends object>(enumType: T) => {
    type Key = keyof typeof enumType;
    return Object.values(enumType) as [Key, ...Key[]] 
}



