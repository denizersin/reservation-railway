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

const dummyData = [
  { name: "Atakan Ozen", phone: "(0530) 201 86 68", email: "atakanozen@21masa.com.tr", createdAt: "26 Eylül 2024 Perşembe 19:04" },
  { name: "Hilmican Erkol", phone: "(0530) 878 06 09", email: "hilmicanerkol8@gmail.com", createdAt: "26 Eylül 2024 Perşembe 17:27" },
  { name: "Kelly James Clark", phone: "+1-6162040719", email: "kclark84@yahoo.com", createdAt: "26 Eylül 2024 Perşembe 16:20" },
  { name: "John Vestergaard", phone: "", email: "jv@schmidtgroup.dk", createdAt: "26 Eylül 2024 Perşembe 14:30" },
  { name: "Sun Yoo", phone: "", email: "sychgo1@gmail.com", createdAt: "26 Eylül 2024 Perşembe 14:24" },
  { name: "Jen Chieh Cheng", phone: "+886-970813027", email: "raphael813@gmail.com", createdAt: "26 Eylül 2024 Perşembe 13:43" },
  { name: "Tamer Tarık Selbes", phone: "(0539) 962 00 35", email: "tarikselbes@gmail.com", createdAt: "26 Eylül 2024 Perşembe 13:26" },
  { name: "Christopher Brewer", phone: "+1-7039662660", email: "htbrewski00@gmail.com", createdAt: "26 Eylül 2024 Perşembe 11:59" },
];

const ListExample = () => {
  return (
    <Card className="w-full my-8">
      <CardHeader>
        <CardTitle>Yeni Misafirler</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>Cep Telefonu</TableHead>
              <TableHead>E-Posta Adresi</TableHead>
              <TableHead>Oluşturulma Zamanı</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyData.map((guest, index) => (
              <TableRow key={index}>
                <TableCell>{guest.name}</TableCell>
                <TableCell>{guest.phone}</TableCell>
                <TableCell>{guest.email}</TableCell>
                <TableCell>{guest.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ListExample;