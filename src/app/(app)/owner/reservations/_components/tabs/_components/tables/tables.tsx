import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

const dummyData = {
    "Ana Salon": [
        { id: 10, name: "Emir Dereli", time: "19:15", guests: "4/4" },
        { id: 11, name: "Gizem Yalınkılıç", time: "20:30", guests: "2/2" },
        { id: 12, name: "Erik Van Dooren", time: "18:30", guests: "2/2" },
        { id: 20, name: "Can Güneysu", time: "20:00", guests: "4/4" },
        { id: 21, name: "Cenk Demiroğlu", time: "20:00", guests: "2/2" },
        { id: 22, name: "Aydın Alıc", time: "19:30", guests: "2/2" },
        { id: 30, name: "Aziz Abdullah", time: "18:30", guests: "2/5" },
        { id: 31, name: "Heidi Tam", time: "18:30", guests: "2/2" },
        { id: 32, name: "Alec Mercer", time: "19:30", guests: "2/3" },
        { id: 40, name: "Francene Noel", time: "19:30", guests: "4/5" },
        { id: 41, name: "Manon Fisher", time: "18:30", guests: "2/2" },
        { id: 42, name: "Constantin Bertoli", time: "20:15", guests: "2/3" },
    ],
    "Chef Table": [
        { id: 10, name: "Emir Dereli", time: "19:15", guests: "4/4" },
        { id: 11, name: "Gizem Yalınkılıç", time: "20:30", guests: "2/2" },
        { id: 12, name: "Erik Van Dooren", time: "18:30", guests: "2/2" },
        { id: 20, name: "Can Güneysu", time: "20:00", guests: "4/4" },
    ],
    "Teras": []
};

const smallTables = ["A-1", "A-2", "A-3", "A-4", "A-5", "A-6", "A-7"];

const TablesView = () => {
    return (
        <div className="p-4">

            <Tabs defaultValue="Ana Salon">
                <div className='flex gap-x-2 items-center'>
                    <TabsList>
                        {Object.keys(dummyData).map((area) => (
                            <TabsTrigger key={area} value={area}>{area}</TabsTrigger>
                        ))}
                    </TabsList>
                    <Input
                        type="text"
                        placeholder="Ad soyad, şirket, telefon, e-posta adre"
                        className="max-w-[200px] p-2  rounded my-2"
                    />
                </div>

                {Object.entries(dummyData).map(([area, reservations]) => (
                    <TabsContent key={area} value={area}>
                        <div className="flex flex-wrap gap-x-2 gap-y-2">
                            {reservations.map((reservation) => (
                                <Card key={reservation.id} className="bg-foreground text-background size-[150px] ">
                                    <CardContent className="p-4 ">
                                        <div className="text-xl font-bold">{reservation.id}</div>
                                        <div className="text-sm">{reservation.name}</div>
                                        <div className="flex items-center text-xs mt-2">
                                            <Clock className="w-3 h-3 mr-1" /> {reservation.time}
                                        </div>
                                        <div className="flex items-center text-xs">
                                            <Users className="w-3 h-3 mr-1" /> {reservation.guests}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {smallTables.map((table) => (
                                <Card key={table} className="bg-background text-foreground size-[150px] ">
                                    <CardContent className="p-4 ">
                                        <div className="text-lg font-semibold">{table}</div>
                                        <div className="text-sm">2 Misafir</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default TablesView;