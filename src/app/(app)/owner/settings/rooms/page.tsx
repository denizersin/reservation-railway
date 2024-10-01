"use client"
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const dummyData = [
    { restaurant: "TURK FATIH TUTAK", title: "Ana Salon", order: 1, code: "", tableCount: 12, capacity: 36 },
    { restaurant: "TURK FATIH TUTAK", title: "Chef Table", order: 2, code: "", tableCount: 2, capacity: 6 },
    { restaurant: "TURK FATIH TUTAK", title: "Teras", order: 3, code: "", tableCount: 14, capacity: 42 },
];

const RestaurantAreasTable = () => {
    const handleAddNewArea = () => {
        // Implement the logic to add a new area
        console.log("Add new area clicked");
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ayarlar / Alanlar</CardTitle>
                <Button onClick={handleAddNewArea}>Yeni Alan Ekle</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Restoran</TableHead>
                            <TableHead>Başlık</TableHead>
                            <TableHead>Sıra</TableHead>
                            <TableHead>Kod</TableHead>
                            <TableHead>Masa Sayısı</TableHead>
                            <TableHead>Kapasite</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dummyData.map((area, index) => (
                            <TableRow key={index}>
                                <TableCell>{area.restaurant}</TableCell>
                                <TableCell>{area.title}</TableCell>
                                <TableCell>{area.order}</TableCell>
                                <TableCell>{area.code}</TableCell>
                                <TableCell>{area.tableCount}</TableCell>
                                <TableCell>{area.capacity}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default RestaurantAreasTable;