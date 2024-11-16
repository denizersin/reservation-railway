const getConfirmationLink = ({
    reservationId

}: {
    reservationId: number
}) => {
    return `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reservation/confirmation/${reservationId}`
}


const getPrepaymentLink = ({
    reservationId
}: {
    reservationId: number
}) => {
    return `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reservation/prepayment/${reservationId}`
}

const getReservationDetailLink = ({
    reservationId
}: {
    reservationId: number
}) => {
    return `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reservation/detail/${reservationId}`
}




export const reservationLinks = {
    confirmation: getConfirmationLink,
    prepayment: getPrepaymentLink,
    detail: getReservationDetailLink
}