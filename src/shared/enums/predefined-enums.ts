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

export enum EnumMealNumeric {
    breakfast = 1,
    lunch = 2,
    dinner = 3,
    bar = 4,
}

export enum EnumReservationStatus {
    draft = 'draft',
    reservation = 'reservation',
    prepayment = 'prepayment',
    confirmation = 'confirmation',
    cancel = 'cancel',
    confirmed = 'confirmed',
    completed = 'completed',
    holding = 'holding',
}

export const EnumReservationStatusNumeric: Record<EnumReservationStatus, number> = {
    [EnumReservationStatus.draft]: 1,
    [EnumReservationStatus.reservation]: 2,
    [EnumReservationStatus.prepayment]: 3,
    [EnumReservationStatus.confirmation]: 4,
    [EnumReservationStatus.cancel]: 5,
    [EnumReservationStatus.confirmed]: 6,
    [EnumReservationStatus.completed]: 7,
    [EnumReservationStatus.holding]: 8,
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
export enum EnumDaysNumeric{
    sunday = 0,
    monday = 1,
    tuesday = 2,
    wednesday = 3,
    thursday = 4,
    friday = 5,
    saturday = 6,
}

export enum EnumMonths {
    january = 'january',
    february = 'february',
    march = 'march',
    april = 'april',
    may = 'may',
    june = 'june',
    july = 'july',
    august = 'august',
    september = 'september',
    october = 'october',
    november = 'november',
    december = 'december',
}

export enum EnumMonthsNumeric {
    january = 0,
    february = 1,
    march = 2,
    april = 3,
    may = 4,
    june = 5,
    july = 6,
    august = 7,
    september = 8,
    october = 9,
    november = 10,
    december = 11,
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
    ReservationDateChange = "Reservation Date Change",
    ReservationTimeChange = "Reservation Time Change",
    ReservationGuestCountChange = "Reservation Guest Count Change",
}

export const EnumNotificationMessageTypeNumeric: Record<EnumNotificationMessageType, number> = {
    [EnumNotificationMessageType.NewReservation]: 1,
    [EnumNotificationMessageType.DateTimeChange]: 2,
    [EnumNotificationMessageType.GuestCountChange]: 3,
    [EnumNotificationMessageType.ReservationCancellation]: 4,
    [EnumNotificationMessageType.ReservationConfirmationRequest]: 5,
    [EnumNotificationMessageType.ReservationConfirmed]: 6,
    [EnumNotificationMessageType.ReservationCompleted]: 7,
    [EnumNotificationMessageType.ReservationReminder]: 8,
    [EnumNotificationMessageType.ReservationFeedback]: 9,
    [EnumNotificationMessageType.NotifiedForPrepayment]: 10,
    [EnumNotificationMessageType.AskedForPrepayment]: 11,
    [EnumNotificationMessageType.ReservationCreated]: 12,
    [EnumNotificationMessageType.ReservationDateChange]: 13,
    [EnumNotificationMessageType.ReservationTimeChange]: 14,
    [EnumNotificationMessageType.ReservationGuestCountChange]: 15,

}

export enum EnumWaitlistNotificationMessageType {
    CreatedReservationFromWaitlist = "Created Reservation From Waitlist",
    CancelWaitlist = "Cancel Waitlist",
    AddedToWaitlist = "Added To Waitlist",
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


export enum EnumHeader{
    RESTAURANT_ID = 'restaurant_id',
    LANGUAGE = 'language',
}


export enum EnumWaitlistStatus {
    created = 'created',
    confirmed = 'confirmed',
    cancelled = 'cancelled',
}


export enum EnumInvoiceType {
    individual = 'individual',
    corporate = 'corporate',
}

export enum EnumReviewSendDay {
    CHECK_OUT_DAY = 'CHECK_OUT_DAY',
    NEXT_DAY = 'NEXT_DAY',
}

export enum EnumReviewSendType {
    SMS = 'SMS',
    EMAIL = 'EMAIL',
    SMS_AND_EMAIL = 'SMS_AND_EMAIL',
}

export enum EnumReviewStatus {
    NOT_SENT = 'NOT_SENT',
    PENDING = 'PENDING',
    REVIEWED = 'REVIEWED',
}


//payment setting
export enum EnumPrepaymentAtNoShow {
    convertToSale = 'convertToSale',
    refund = 'refund',
    none = 'none',
}

