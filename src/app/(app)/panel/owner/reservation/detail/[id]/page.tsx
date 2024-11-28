import { ReservationDetailPage } from '../reservation-detail-page'

type Props = {
    params: {
        id: string
    }
}

const page = async (props: Props) => {

    const reservationId = Number(props.params.id)



    return (
        <ReservationDetailPage />
    )
}

export default page