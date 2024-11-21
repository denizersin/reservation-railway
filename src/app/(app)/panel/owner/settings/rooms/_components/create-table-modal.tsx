import { Button } from "@/components/custom/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from '@/server/trpc/react'
import { getEnumValues } from '@/server/utils/server-utils'
import { EnumTableShape } from '@/shared/enums/predefined-enums'
import TRoomValidator, { roomValidator } from '@/shared/validators/room'
import { zodResolver } from "@hookform/resolvers/zod"
import React, { useContext, useMemo } from 'react'
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RoomDetailContext } from "../[id]/page"
import { useQueryClient } from "@tanstack/react-query"
import { getQueryKey } from "@trpc/react-query"

type Props = {
    isOpen: boolean,
    setOpen: (value: boolean) => void,
}

const CreateTableModal = ({ isOpen, setOpen }: Props) => {
    const queryClinet = useQueryClient()

    const { roomId } = useContext(RoomDetailContext);

    const form = useForm<TRoomValidator.createRoomTableFormSchema>({
        resolver: zodResolver(roomValidator.createRoomTableFormSchema),
        defaultValues: {
            tableCount: 1,
            orderStartAt: 1,
            tableNumberStartAt: 0,
            minCapacity: 1,
            maxCapacity: 2,
            shape: EnumTableShape.square,
        },
    })

    const squaresToSelect = useMemo(() => getEnumValues(EnumTableShape)
        .map(shape => ({
            label: shape as string,
            value: shape as string
        })), [])

    const { mutate: createTable,isPending:isCreating } = api.room.createTable.useMutation({
        onSuccess:()=>{
            setOpen(false)
            queryClinet.invalidateQueries({
                queryKey: getQueryKey(api.room.getTables)
            })
        }
    })

    const onSubmit = (data: TRoomValidator.createRoomTableFormSchema) => {
        createTable({
            roomId,
            data
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Table(s)</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className=" grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="tableCount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kaç adet masa eklensin?</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormDescription>Girdiğiniz sayı kadar masa oluşturulur.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="orderStartAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sıralama kaçtan başlasın?</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormDescription>Masaların kaçıncı sırada görünecekleri.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tableNumberStartAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Masa numaraları kaçtan başlasın?</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormDescription>Masa numaraları girdiğiniz sayıdan itibaren birer birer arttırılarak oluşturulur. Daha önceden aynı numarada masa var ise o masa eklenmez.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="startLetter"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Başına harf eklensin mi?</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>Masa numaralarının başına harf ekleyebilirsiniz.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="endLetter"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sonuna harf eklensin mi?</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>Masa numaralarının sonuna harf ekleyebilirsiniz.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={form.control}
                            name="minCapacity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>En az kaç misafir ağırlanabilir?</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="maxCapacity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>En fazla kaç misafir ağırlanabilir?</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="shape"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Masa Şekli</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Masa şeklini seçin" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {squaresToSelect.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Kare veya Yuvarlak olarak masaların şekillerini belirleyebilirsiniz.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                        loading={isCreating}
                        type="submit">Oluştur</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateTableModal