import React, { useMemo } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { api, RouterOutputs } from '@/server/trpc/react'
import { useLanguage } from '@/hooks/useLanguage'
import { useReservationsContext } from '../../../reservations/page'
import { useStartOfDay } from '@/hooks/useStartOfDay'
import { Badge } from '@/components/ui/badge'

type Props = {
    reservationDetailData: RouterOutputs['reservation']['getReservationDetail']
}

export const GeneralInformation = ({ reservationDetailData }: Props) => {


    const { language } = useLanguage();

    const reservationDate = new Date(reservationDetailData.reservationDate).toLocaleDateString(`${language}-${language.toUpperCase()}`, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',

    });


    const queryDate = useStartOfDay(reservationDetailData.reservationDate)

    const { data: reservations } = api.reservation.getReservations.useQuery({
        date: queryDate
    })

    const tablesState = useMemo(() => {

        const thisReservation = reservationDetailData
        const thisReservationId = reservationDetailData.id

        const tables = thisReservation.tables.map(t => t.table.no).join(', ')


        const linkedToThisTables = reservations?.filter(t => t.id !== thisReservationId && t?.linkedReservationId && t?.linkedReservationId === thisReservationId).map(t => t.tables.map(t => t.table.no).join(', ')).join(', ')

        const isLinkedToOtherTables = Boolean(thisReservation.linkedReservationId)

        const thisLinkedWithOtherTables = reservations?.filter(t => t.id !== thisReservationId && t?.id === thisReservation.linkedReservationId).map(t => t.tables.map(t => t.table.no).join(', ')).join(', ')

        return {
            tables,
            linkedToThisTables,
            isLinkedToOtherTables,
            thisLinkedWithOtherTables
        }

    }, [reservations, reservationDetailData.id])


    const tagsElements = useMemo(() => {
        const tagsElements = reservationDetailData.tags?.map(t => <Badge
            className={`bg-${t.tag.color}`}
        >{t.tag.translations?.[0]?.name}</Badge>)
        return tagsElements
    }, [reservationDetailData])

    console.log(tagsElements,'tags')


    const InfoRow = ({ items }: { items: { label: string; value: JSX.Element | string | number }[] }) => (
        <TableRow >
            {items.map((item, index) => (
                <TableCell key={index}>
                    <div className="space-y-1 max-w-[300px] w-[250px]">
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="font-medium">{item.value}</p>
                    </div>
                </TableCell>
            ))}
        </TableRow>
    )

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Genel Bilgiler</CardTitle>
                <CardDescription>
                    Bu bölümden rezervasyona ait genel bilgileri görebilirsiniz.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        <InfoRow
                            items={[
                                { label: "Tarih", value: reservationDate },
                                { label: "Saat", value: reservationDetailData.hour },
                                { label: "Misafir", value: reservationDetailData.guestCount }
                            ]}
                        />
                        <InfoRow
                            items={[
                                { label: "Oda", value: reservationDetailData.room?.translations?.[0]?.name! },
                                {
                                    label: "Masa", value: <div className='max-w-[300px] w-[250px]'>
                                        <div className="">
                                            {tablesState.tables}
                                        </div>
                                        <div className='flex flex-wrap gap-2'>
                                            {tablesState.linkedToThisTables}
                                        </div>
                                    </div>
                                },
                                { label: "Durum", value: reservationDetailData.reservationStatus.status },
                            ]}
                        />
                        <InfoRow
                            items={[
                                { label: "Ad Soyad", value: reservationDetailData.guest.name + ' ' + reservationDetailData.guest.surname },
                                { label: "Cep Telefonu", value: reservationDetailData.guest.fullPhone },
                                { label: "E-Posta Adresi", value: reservationDetailData.guest.email }
                            ]}
                        />
                        <InfoRow
                            items={[
                                { label: "Misafir Notu", value: reservationDetailData.guestNote || "Not bulunmuyor" },
                                { label: "Etiketler", value: <div className='flex flex-wrap gap-2'>
                                    {tagsElements}
                                </div> },
                                { label: "Id", value: reservationDetailData.id }
                            ]}
                        />
                        <InfoRow
                            items={[
                                {
                                    label: "Oluşturan",
                                    value: reservationDetailData.createdOwner?.name || "Guest"
                                },
                                // {
                                //     label: "Son Güncelleyen",
                                //     value: `${reservationData.lastUpdatedBy.name} (${reservationData.lastUpdatedBy.date})`
                                // },
                                // { label: "Sağlayıcı", value: reservationData.provider }
                            ]}
                        />
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}