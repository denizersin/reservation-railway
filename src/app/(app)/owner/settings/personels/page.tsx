"use client";
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
    { name: "Eren Karaçam", phone: "", email: "", birthDate: "", createdAt: "13.06.2023 20:26:00" },
    { name: "İsmail Aydın", phone: "", email: "", birthDate: "", createdAt: "5.05.2023 15:25:00" },
    { name: "Mustafa Avcı", phone: "", email: "", birthDate: "", createdAt: "26.03.2024 18:40:00" },
    { name: "Tolgahan Bıyıklı", phone: "", email: "", birthDate: "", createdAt: "5.05.2023 15:25:00" },
    { name: "Yusuf Çelik", phone: "", email: "", birthDate: "", createdAt: "5.05.2023 15:25:00" },
];

const EmployeesTable = () => {
    const handleAddNewEmployee = () => {
        // Implement the logic to add a new employee
        console.log("Add new employee clicked");
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ayarlar / Çalışanlar</CardTitle>
                <Button onClick={handleAddNewEmployee}>Yeni Çalışan Ekle</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ad Soyad</TableHead>
                            <TableHead>Telefon</TableHead>
                            <TableHead>E-Posta Adresi</TableHead>
                            <TableHead>Doğum Tarihi</TableHead>
                            <TableHead>Oluşturulma Zamanı</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dummyData.map((employee, index) => (
                            <TableRow key={index}>
                                <TableCell>{employee.name}</TableCell>
                                <TableCell>{employee.phone}</TableCell>
                                <TableCell>{employee.email}</TableCell>
                                <TableCell>{employee.birthDate}</TableCell>
                                <TableCell>{employee.createdAt}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default EmployeesTable;