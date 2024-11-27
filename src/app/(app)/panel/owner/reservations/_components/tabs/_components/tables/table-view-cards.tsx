"use client"
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Users, CalendarDays, User } from 'lucide-react';
import { useReservationsContext } from '../../../../page';
import { EnumMealNumeric, EnumReservationExistanceStatus } from '@/shared/enums/predefined-enums';
import { api } from '@/server/trpc/react';

const TableViewCards = () => {

  const { queryDate, rawReservationsData } = useReservationsContext()
  const { data: avaliableTablesData } = api.reservation.getTableStatues.useQuery({
    date: queryDate,
    mealId: EnumMealNumeric.dinner
  })



  const counts = useMemo(() => {

    const allTables = avaliableTablesData?.flatMap(r => r.tables) || []

    const reservedTablesCount = allTables.filter(t => t.reservation).length
    const closedTablesCount = allTables.filter(t => !(t.table?.isActive)).length
    const emptyTablesCount = allTables.filter(t => !t.reservation).length

    const guestCount = rawReservationsData?.reduce((acc, r) => acc + r.guestCount, 0) || 0
    const nonExistGuestCount = rawReservationsData?.filter(r => r.reservationExistenceStatus.status === EnumReservationExistanceStatus.notExist).length || 0

    const reservationCount = rawReservationsData?.length || 0

    const dolulukOranlari = ((reservedTablesCount / allTables.length) * 100).toFixed(0)

    return {
      reservedTablesCount,
      closedTablesCount,
      emptyTablesCount,
      guestCount,
      nonExistGuestCount,
      reservationCount,
      dolulukOranlari
    }

  }, [avaliableTablesData, rawReservationsData])




  const cardData = [
    { title: 'Boş Masa', value: counts.emptyTablesCount, subtitle: 'Boş Masa', icon: Gift, color: 'bg-green-100' },
    { title: 'Dolu Masa', value: counts.reservedTablesCount, subtitle: 'Dolu Masa', icon: Gift, color: 'bg-yellow-100' },
    { title: 'Kapalı Masa', value: counts.closedTablesCount, subtitle: 'Kapalı Masa', icon: Gift, color: 'bg-red-100' },
    { title: 'Doluluk Oranları', value: `${counts.dolulukOranlari}%`, subtitle: 'Doluluk Oranları', icon: User, color: 'bg-blue-100' },
    { title: 'Misafir', value: counts.guestCount, subtitle: 'Misafir', icon: Users, color: 'bg-green-100' },
    { title: 'Rezervasyon', value: counts.reservationCount, subtitle: 'Rezervasyon', icon: CalendarDays, color: 'bg-blue-100' },
    { title: 'NoShow', value: counts.nonExistGuestCount, subtitle: 'NoShow', icon: Gift, color: 'bg-gray-100' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card, index) => (
        <Card key={index} className=''>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className='pb-3'>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TableViewCards;