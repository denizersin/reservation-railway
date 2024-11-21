import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TTable } from '@/server/db/schema/room'
import { api } from '@/server/trpc/react'
import TRoomValidator, { roomValidator } from '@/shared/validators/room'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { useEffect } from 'react'
import { EnumTableShape } from '@/shared/enums/predefined-enums'
import { Input } from '@/components/ui/input'
import { CustomSelect } from '@/components/custom/custom-select'
import { Button } from '@/components/custom/button'

type Props = {
    isOpen: boolean,
    setOpen: (value: boolean) => void,
    table: TTable
}

const UpdateTableModal = ({ isOpen, setOpen, table }: Props) => {
    const queryClient = useQueryClient()

    const { mutate: updateTable, isPending } = api.room.updateTable.useMutation({
        onSuccess: () => {
            setOpen(false)
            form.reset()
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.room.getTables)
            })
        }
    })

    const form = useForm<TRoomValidator.updateRoomTableFormSchema>({
        resolver: zodResolver(roomValidator.updateRoomTableFormSchema),
        defaultValues: {
            ...table,
        }
    })

    const onSubmit = (data: TRoomValidator.updateRoomTableFormSchema) => {
        updateTable({
            tableId: table.id,
            data
        })
    }

    const tableShapes = Object.entries(EnumTableShape).map(([_, value]) => ({
        label: value,
        value: value
    }))

    useEffect(() => {
        if (table) {
            form.reset({
                ...table,
            })
        }
    }, [table])

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Table</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="no"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Table Number</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="order"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Order</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            {...field} 
                                            onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="minCapacity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Min Capacity</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            {...field} 
                                            onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                        />
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
                                    <FormLabel>Max Capacity</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            {...field} 
                                            onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                        />
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
                                    <FormLabel>Shape</FormLabel>
                                    <CustomSelect
                                        data={tableShapes}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        placeholder="Select shape"
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPending}>
                            Update Table
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateTableModal