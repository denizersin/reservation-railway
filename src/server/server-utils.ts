export const REFRESH_TOKEN_EXPIRY_DAYS = 30
export const JWT_EXPIRY_DAYS = 5

//make this function

export const getEnumValues = (enumType: Object) => {
    return Object.values(enumType) as [string, ...string[]];
}