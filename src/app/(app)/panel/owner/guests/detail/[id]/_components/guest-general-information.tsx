import React from 'react'
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
    TableRow,
} from "@/components/ui/table"
import { RouterOutputs } from '@/server/trpc/react'
import { Badge } from '@/components/ui/badge'
import { EnumVipLevel } from '@/shared/enums/predefined-enums'

type Props = {
    guestDetail: RouterOutputs['guest']['getGuestDetail']
}

export const GuestGeneralInformation = ({ guestDetail }: Props) => {

    const InfoRow = ({ items }: { items: { label: string; value: JSX.Element | string | number | null | undefined }[] }) => (
        <TableRow >
            {items.map((item, index) => (
                <TableCell key={index}>
                    <div className="space-y-1 max-w-[300px] w-[250px]">
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="font-medium">{item.value || "Belirtilmemiş"}</p>
                    </div>
                </TableCell>
            ))}
        </TableRow>
    )

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Misafir Bilgileri</CardTitle>
                <CardDescription>
                    Bu bölümden misafire ait genel bilgileri görebilirsiniz.
                </CardDescription>
            </CardHeader>
            <CardContent>
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
                                { label: "Toplam Rezervasyon", value: guestDetail.guestReservations?.length },
                                { label: "Durum", value: <Badge>{guestDetail.guest?.vipLevel===EnumVipLevel.blackList ? "Black List" : "Active"}</Badge> }
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
    )
}