import { getEnumValues } from "@/server/utils/server-utils";

export enum EnumLanguage {
    en = "en",
    tr = "tr",
    de = "de",
}

export enum EnumTheme {
    dark = 'dark',
    light = 'light',
}

export enum EnumUserRole {
    admin = "admin",
    owner = "owner",
    user = "user"
}
export type TEnumUserRole = keyof typeof EnumUserRole;

export enum EnumMeals {
    breakfast = "breakfast",
    lunch = "lunch",
    dinner = "dinner",
    bar = "bar",
}
export enum EnumReservationStatus {
    draft = 'draft',
    reservation = 'reservation',
    provision = 'provision',
    confirmation = 'confirmation',
    cancel = 'cancel',
    waitApprove = 'wait approve',
}

export enum EnumTableViewType {
    standartTable = 'standartTable',
    floorPlan = 'floorPlan',
}

export enum EnumDays {
    monday = 'monday',
    tuesday = 'tuesday',
    wednesday = 'wednesday',
    thursday = 'thursday',
    friday = 'friday',
    saturday = 'saturday',
    sunday = 'sunday',
}

export const DaysToSelect = getEnumValues(EnumDays).map(day => ({
    label: day as string,
    value: day as string
}))



export enum EnumReservationListingType {
    smartList = 'smartList',
    newestOnTop = 'newestOnTop',
}

export enum EnumGuestSelectionSide {
    left = 'left',
    right = 'right',
}

export enum EnumTableShape {
    square = 'square',
    rectangle = 'rectangle',
    round = 'round',
}

export enum EnumVipLevel {
    bigSpender = 'Big Spender',
    goodSpender = 'Good Spender',
    lowSpender = 'Low Spender',
    regularCustomer = 'Regular Customer',
    potentialCustomer = 'Potential Customer',
    blackList = 'Black List',
    lostCustomer = 'Lost Customer',
}

export const VipLevelToSelect = getEnumValues(EnumVipLevel).map(level => ({
    label: level as string,
    value: level as string
}))


export enum EnumGender {
    male = 'male',
    female = 'female',
    other = 'other',
}

export const GenderToSelect = getEnumValues(EnumGender).map(gender => ({
    label: gender as string,
    value: gender as string
}))

export enum EnumReservationPrepaymentStatus {
    pending = 'pending',
    success = 'success',
    failed = 'failed',
}

export enum EnumReservationPrepaymentType {
    "prepayment" = 'prepayment',
    "provision" = 'provision',
    "none" = 'none',
}