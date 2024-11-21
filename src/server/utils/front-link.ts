const getConfirmationLink = ({
    reservationId

}: {
    reservationId: number
}) => {
    return `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reservation/status/${reservationId}`
}


const getPrepaymentLink = ({
    reservationId
}: {
    reservationId: number
}) => {
    return `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reservation/status/${reservationId}`
}

const getReservationDetailLink = ({
    reservationId
}: {
    reservationId: number
}) => {
    return `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reservation/status/${reservationId}`
}

const getReservationStatusLink = ({
    reservationId
}: {
    reservationId: number
}) => {
    return `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reservation/status/${reservationId}`
}




export const reservationLinks = {
    confirmation: getConfirmationLink,
    prepayment: getPrepaymentLink,
    detail: getReservationDetailLink,
    status: getReservationStatusLink
}
