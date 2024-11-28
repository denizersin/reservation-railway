import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Building, Star, AlertTriangle } from 'lucide-react';
import { db } from '@/server/db';
import { tblGuest, tblGusetCompany } from '@/server/db/schema';
import { and, count, eq } from 'drizzle-orm';
import { EnumVipLevel } from '@/shared/enums/predefined-enums';
import { getEnumValues } from '@/server/utils/server-utils';
import { vipLevels } from '../../reservations/_components/tabs/_components/table/data';

type CardData = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}

const MainCards = async () => {

  const [totalGuests] = await db.select({
    count: count()
  }).from(tblGuest);

  const [vipGuests] = await db.select({
    count: count()
  }).from(tblGuest)
    .where(eq(tblGuest.isVip, true));

  const [companies] = await db.select({
    count: count()
  }).from(tblGusetCompany);

  const guestData: CardData[] = [
    { title: 'Misafir', value: totalGuests?.count?.toString() || '0', subtitle: 'Misafir', icon: Users, color: 'bg-green-100' },
    { title: 'VIP', value: vipGuests?.count?.toString() || '0', subtitle: 'VIP', icon: Shield, color: 'bg-red-100' },
    { title: 'Şirket', value: companies?.count?.toString() || '0', subtitle: 'Şirket', icon: Building, color: 'bg-blue-100' },
  ];

  // const distributionData2: {
  //   EnumVipLevel: EnumVipLevel
  //   count: number
  // }[] 


  const distributionData = await Promise.all(getEnumValues(EnumVipLevel).map(async (level) => {
    const [_count] = await db.select({
      count: count()
    }).from(tblGuest)
      .where(eq(tblGuest.vipLevel, level));
    return {
      EnumVipLevel: level,
      count: _count?.count?.toString() || '0'
    }
  }))

  const distributionData2: CardData[] = distributionData.map((item) => ({
    title: item.EnumVipLevel,
    value: item.count,
    subtitle: item.EnumVipLevel,
    icon: vipLevels.find((level) => level.value === item.EnumVipLevel)?.icon!,
    color: 'bg-yellow-100'
  }))




  const renderCards = (cards: CardData[]) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} >
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Misafirler</h2>
        {renderCards(guestData)}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Listelere Göre Dağılım</h2>
        {renderCards(distributionData2)}
      </div>
    </div>
  );
}

export default MainCards;