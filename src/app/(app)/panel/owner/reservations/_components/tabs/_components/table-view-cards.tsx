"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Users, CalendarDays, User } from 'lucide-react';

const TableViewCards = () => {
  const cardData = [
    { title: 'Boş Masa', value: '7', subtitle: 'Boş Masa', icon: Gift, color: 'bg-green-100' },
    { title: 'Dolu Masa', value: '12', subtitle: 'Dolu Masa', icon: Gift, color: 'bg-yellow-100' },
    { title: 'Kapalı Masa', value: '0', subtitle: 'Kapalı Masa', icon: Gift, color: 'bg-red-100' },
    { title: 'Doluluk Oranları', value: '%63', subtitle: 'Doluluk Oranları', icon: User, color: 'bg-blue-100' },
    { title: 'Misafir', value: '30', subtitle: 'Misafir', icon: Users, color: 'bg-green-100' },
    { title: 'Rezervasyon', value: '12', subtitle: 'Rezervasyon', icon: CalendarDays, color: 'bg-blue-100' },
    { title: 'NoShow', value: '12', subtitle: 'NoShow', icon: Gift, color: 'bg-gray-100' },
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