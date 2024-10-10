"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import TRoomValidator, { createRoomSchema } from "@/shared/validators/room"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/custom/button"
import { api } from "@/server/trpc/react"
import { TRoomWithTranslations } from "@/server/db/schema/room"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useQueryClient } from "@tanstack/react-query"
import { getQueryKey } from "@trpc/react-query"

type FormValues = TRoomValidator.createRoomSchema

export function RoomCrudModal({
    isOpen,
    setOpen,
    room
}: {
    isOpen: boolean,
    setOpen: (value: boolean) => void,
    room?: TRoomWithTranslations
}) {
    const isUpdate = !!room
    const queryClient = useQueryClient()

    const { data: restaurantLanguages } = api.restaurant.getLanguages.useQuery()

    const form = useForm<FormValues>({
        resolver: zodResolver(createRoomSchema),
        defaultValues: {
            isWaitingRoom: room?.isWaitingRoom ?? false,
            order: room?.order ?? 1,
            translations: []
        }
    })

    const onSuccessCrud = () => {
        queryClient.invalidateQueries({
            queryKey: getQueryKey(api.room.getRooms)
        })
        setOpen(false)
    }

    const createRoomMutation = api.room.createRoom.useMutation({
        onSuccess: onSuccessCrud
    })

    const updateRoomMutation = api.room.updateRoom.useMutation({
        onSuccess: onSuccessCrud
    })

    function onSubmit(data: FormValues) {
        if (isUpdate && room) {
            updateRoomMutation.mutate({
                roomId: room.id,
                data
            })
        } else {
            createRoomMutation.mutate(data)
        }
    }

    useEffect(() => {
        if (restaurantLanguages) {
            console.log(restaurantLanguages,'langss')
            form.setValue('translations', restaurantLanguages.map(language => ({
                languageId: language.languageId,
                name: room?.translations.find(t => t.languageId === language.languageId)?.name ?? '',
                description: room?.translations.find(t => t.languageId === language.languageId)?.description ?? ''
            })))
        }
    }, [restaurantLanguages, room])

    useEffect(() => {
        if (!isOpen) {
            form.reset()
        }
    }, [isOpen])

    console.log(
        form.formState.errors,'errors'
    )

    console.log(form.getValues(),'values')

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isUpdate ? 'Update Room' : 'Create New Room'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="isWaitingRoom"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Waiting Room</FormLabel>
                                        <FormDescription>
                                            Is this a waiting room?
                                        </FormDescription>
                                    </div>
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
                                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {restaurantLanguages?.map((language, index) => (
                            <div key={language.languageId} className="space-y-4">
                                <h3 className="text-lg font-semibold">{language.language.name} Translation</h3>
                                <FormField
                                    control={form.control}
                                    name={`translations.${index}.languageId`}
                                    render={({ field }) => (
                                        <Input type="hidden" {...field} value={language.languageId} />
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`translations.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`translations.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                        <Button
                            type="submit"
                            loading={createRoomMutation.isPending || updateRoomMutation.isPending}
                        >
                            {isUpdate ? 'Update Room' : 'Create Room'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}