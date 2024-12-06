'use client'

import { Button } from "@/components/custom/button"
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { api } from "@/server/trpc/react"
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { GuestGeneralInformation } from "../../../guests/detail/[id]/_components/guest-general-information"
import { EnumVipLevel } from "@/shared/enums/predefined-enums"
import GuestCrudModal from "../../../guests/_components/guest-crud-modal"
import { useState } from "react"
import { IconCircleCheckFilled, IconCircleX } from "@tabler/icons-react"
import { getQueryKey } from "@trpc/react-query"
import { useQueryClient } from "@tanstack/react-query"

export const CurrentGuestDetail = ({ selectedGuestId, setGuestNote, setReservationNote }: {
    selectedGuestId: number
    setGuestNote: (note: string) => void
    setReservationNote: (note: string) => void
}) => {
    const { data: guestDetail, isLoading } = api.guest.getGuestDetail.useQuery({ guestId: selectedGuestId })
    const [isEditGuestModalOpen, setIsEditGuestModalOpen] = useState(false)
    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!guestDetail) {
        return null
    }

    const guestReservations = guestDetail.guestReservations || []

    const router = useRouter()

    const onClickRow = (reservationId: number) => {
        router.push(`/panel/owner/reservation/detail/${reservationId}`)
    }

    const queryClient = useQueryClient()

    const invalidateGuestDetail = () => {
        queryClient.invalidateQueries({ queryKey: getQueryKey(api.guest.getGuestDetail, { guestId: selectedGuestId },'query') })
    }

    const onSucsesUpdateGuest = () => {
        invalidateGuestDetail()
        setIsEditGuestModalOpen(false)
    }


    const InfoRow = ({ items }: { items: { label: string; value: JSX.Element | string | number | null | undefined }[] }) => (
        <TableRow >
            {items.map((item, index) => (
                <TableCell key={index}>
                    <div className="space-y-1 max-w-[300px] w-[250px]">
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="font-medium">{item.value || ""}</p>
                    </div>
                </TableCell>
            ))}
        </TableRow>
    )

    return (
        <div className="flex flex-col gap-3">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className='flex justify-between items-center'>
                        <div className="text-xl font-semibold">
                            {guestDetail.guest?.name} {guestDetail.guest?.surname}
                        </div>
                        <Button onClick={() => setIsEditGuestModalOpen(true)}>
                            Misafiri Düzenle
                        </Button>
                    </CardTitle>
                    <CardDescription>
                        Bu bölümden misafire ait genel bilgileri görebilirsiniz.
                    </CardDescription>
                </CardHeader>
                <CardContent className='max-w-full'>
                    <Table>
                        <TableBody>
                            <InfoRow
                                items={[
                                    { label: "Ad", value: guestDetail.guest?.name },
                                    { label: "Soyad", value: guestDetail.guest?.surname },
                                    { label: "Telefon", value: guestDetail.guest?.fullPhone }
                                ]}
                            />
                            <InfoRow
                                items={[
                                    { label: "E-posta", value: guestDetail.guest?.email },
                                    { label: "Ülke", value: guestDetail.guest?.phoneCodeCountry?.phoneCode + " " + guestDetail.guest?.phoneCodeCountry?.name },
                                    { label: "Dil", value: guestDetail.guest?.language?.name }
                                ]}
                            />
                            <InfoRow
                                items={[
                                    { label: "Toplam Rezervasyon", value: guestDetail.guestReservations?.length },
                                    { label: "Vip", value: guestDetail.guest?.isVip ? <IconCircleCheckFilled /> : <IconCircleX /> },
                                    { label: "Seviye", value: <Badge>{guestDetail.guest?.vipLevel}</Badge> }
                                ]}
                            />
                            <InfoRow
                                items={[
                                    { label: "Not", value: guestDetail.guest?.description },
                                    { label: "Kayıt Tarihi", value: (guestDetail.guest?.createdAt)?.toLocaleDateString('tr-TR') },
                                    { label: "ID", value: guestDetail.guest?.id }
                                ]}
                            />
                        </TableBody>
                    </Table>
                </CardContent>


            </Card>


            <div className="rounded-md border">
                <CardHeader>
                    <CardTitle>Rezervasyonlar</CardTitle>
                </CardHeader>
                <CardContent className='max-w-full'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rezervasyon Durumu</TableHead>
                                <TableHead>Tarih</TableHead>
                                <TableHead>Misafir Sayısı</TableHead>
                                <TableHead>Misafir Notu</TableHead>
                                <TableHead>Rezervasyon Notu</TableHead>
                                <TableHead>Varlık Durumu</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {guestReservations.map((reservation) => (
                                <TableRow
                                    key={reservation.id}
                                    className=" "
                                // onClick={() => onClickRow(reservation.id)}
                                >
                                    <TableCell>
                                        <Badge variant="outline">
                                            {reservation.reservationStatus.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(reservation.reservationDate), 'dd MMMM yyyy HH:mm', { locale: tr })}
                                    </TableCell>
                                    <TableCell>{reservation.guestCount}</TableCell>
                                    <TableCell className="flex flex-col gap-1 justify-center">
                                        <div className="max-w-[200px] max-h-[24px] truncate  text-center">
                                            {reservation.guestNote}
                                        </div>
                                        {reservation.guestNote && <Button variant={'link'} onClick={() => setGuestNote(reservation.guestNote || '')}>
                                            Notu Kullan
                                        </Button>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[200px] max-h-[24px] truncate ">
                                            {reservation.reservationNotes?.[0]?.note}
                                        </div>
                                        {reservation.reservationNotes?.[0]?.note && <Button variant={'link'} onClick={() => setReservationNote(reservation.reservationNotes?.[0]?.note || '')}>
                                            Notu Kullan
                                        </Button>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {reservation.reservationExistenceStatus.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </div>

            {isEditGuestModalOpen && <GuestCrudModal
                open={isEditGuestModalOpen}
                setOpen={setIsEditGuestModalOpen}
                guestId={guestDetail.guest?.id}
                onSucsesUpdateGuest={onSucsesUpdateGuest}
            />}

  
        </div>
    )
}