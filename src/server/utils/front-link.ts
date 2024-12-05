import { env } from "@/env"

const getConfirmationLink = ({
    reservationId

}: {
    reservationId: number
}) => {
    return `${env.BASE_URL}/reservation/status/${reservationId}`
}


const getPrepaymentLink = ({
    reservationId
}: {
    reservationId: number
}) => {
    return `${env.BASE_URL}/reservation/status/${reservationId}`
}

const getReservationDetailLink = ({
    reservationId
}: {
    reservationId: number
}) => {
    return `${env.BASE_URL}/reservation/status/${reservationId}`
}

const getReservationStatusLink = ({
    reservationId
}: {
    reservationId: number
}) => {
    return `${env.BASE_URL}/reservation/status/${reservationId}`
}

const getWaitlistStatusLink = ({
    waitlistId
}: {
    waitlistId: number
}) => {
    return `${env.BASE_URL}/waitlist/status/${waitlistId}`
}




export const reservationLinks = {
    confirmation: getConfirmationLink,
    prepayment: getPrepaymentLink,
    detail: getReservationDetailLink,
    status: getReservationStatusLink,
    waitlistStatus: getWaitlistStatusLink
}


