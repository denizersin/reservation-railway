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
    prepayment = 'prepayment',
    confirmation = 'confirmation',
    cancel = 'cancel',
    confirmed = 'confirmed',
}

export const EnumReservationStatusNumeric: Record<EnumReservationStatus, number> = {
    [EnumReservationStatus.draft]: 1,
    [EnumReservationStatus.reservation]: 2,
    [EnumReservationStatus.prepayment]: 3,
    [EnumReservationStatus.confirmation]: 4,
    [EnumReservationStatus.cancel]: 5,
    [EnumReservationStatus.confirmed]: 6,
}






//presentence
export enum EnumReservationExistanceStatus {
    notExist = 'not exist',
    waitingTable = 'waiting table',
    inRestaurant = 'in restaurant',
    checkedOut = 'checked out',
}



export const EnumReservationExistanceStatusNumeric: Record< EnumReservationExistanceStatus, number> = {
    [EnumReservationExistanceStatus.notExist]: 1,
    [EnumReservationExistanceStatus.waitingTable]: 3,
    [EnumReservationExistanceStatus.inRestaurant]: 4,
    [EnumReservationExistanceStatus.checkedOut]: 5,
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
    // "provision" = 'provision',
    "none" = 'none',
}

export enum EnumReservationPrepaymentNumeric{
    "prepayment" = 1,
    // "provision" = 2,
    "none" = 3,
}


export enum NotificationType {
    RESERVATION_CONFIRMATION = 'RESERVATION_CONFIRMATION',
    RESERVATION_CANCEL = 'RESERVATION_CANCEL',
}


export enum EnumNotificationType {
    SMS = "SMS",
    EMAIL = "EMAIL",
}

export enum EnumNotificationStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    FAILED = "FAILED",
}

export enum EnumNotificationMessageType {
    NewReservation = "NewReservation",
    DateTimeChange = "DateTime Change",
    GuestCountChange = "Guest Count Change",
    ReservationCancellation = "Reservation Cancellation",
    ReservationConfirmationRequest = "Reservation Confirmation Request",
    ReservationConfirmed = "Reservation Confirmed",
    ReservationCompleted = "Reservation Completed",
    ReservationReminder = "Reservation Reminder",
    ReservationFeedback = "Reservation Feedback",
    NotifiedForPrepayment = "Notified For Prepayment",
    AskedForPrepayment = "Asked For Prepayment",
    ReservationCreated = "Reservation Created",
}

export enum EnumPrepaymentStatus {
    pending = 'pending',
    success = 'success',
    cancelled = 'cancelled',
    failed = 'failed',
}

export enum EnumBillPaymentStatus {
    pending = 'pending',
    success = 'success',
    failed = 'failed',
}

export enum EnumHistoryActionType{
    RESERVATION_CREATED = "Reservation Created",
    RESERVATION_CONFIRMED = "Reservation Confirmed",
    RESERVATION_CANCELLED = "Reservation Cancelled",
    ASKED_FOR_PREPAYMENT = "Asked For Prepayment",
    NOTIFIED_FOR_PREPAYMENT = "Notified For Prepayment",
    RESERVATION_COMPLETED = "Reservation Completed",
    PREPAYMENT_SUCCESS = "Prepayment Success",
}



