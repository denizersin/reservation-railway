import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Building, Star, AlertTriangle } from 'lucide-react';

type CardData = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}

const MainCards = () => {
  const guestData: CardData[] = [
    { title: 'Misafir', value: '25556', subtitle: 'Misafir', icon: Users, color: 'bg-green-100' },
    { title: 'VIP', value: '114', subtitle: 'VIP', icon: Shield, color: 'bg-red-100' },
    { title: 'Şirket', value: '303', subtitle: 'Şirket', icon: Building, color: 'bg-blue-100' },
  ];

  const distributionData: CardData[] = [
    { title: 'Büyük Harcama', value: '2', subtitle: 'Büyük Harcama', icon: Star, color: 'bg-yellow-100' },
    { title: 'İyi Harcama', value: '0', subtitle: 'İyi Harcama', icon: Star, color: 'bg-yellow-100' },
    { title: 'Düşük Harcama', value: '0', subtitle: 'Düşük Harcama', icon: Star, color: 'bg-yellow-100' },
    { title: 'Normal Müşteri', value: '22', subtitle: 'Normal Müşteri', icon: Star, color: 'bg-yellow-100' },
    { title: 'Potansiyel Müşteri', value: '1', subtitle: 'Potansiyel Müşteri', icon: Star, color: 'bg-yellow-100' },
    { title: 'Kara Liste', value: '11', subtitle: 'Kara Liste', icon: AlertTriangle, color: 'bg-gray-100' },
    { title: 'Kayıp Müşteri', value: '11', subtitle: 'Kayıp Müşteri', icon: AlertTriangle, color: 'bg-gray-100' },
  ];

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
        {renderCards(distributionData)}
      </div>
    </div>
  );
}

export default MainCards;