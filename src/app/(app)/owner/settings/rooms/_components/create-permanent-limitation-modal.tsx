import { Button } from '@/components/custom/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { api } from '@/server/trpc/react';
import TLimitationValidator, { limitationValidator } from '@/shared/validators/reservation-limitation/inex';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useMutationCallback } from '@/hooks/useMutationCallback';

type Props = {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
};

const CreatePermanentLimitationModal: React.FC<Props> = ({ isOpen, setOpen }) => {
    const { onUpdateReservationLimitations } = useMutationCallback()
    const queryClient = useQueryClient()
    const { data: rooms } = api.room.getRooms.useQuery({});

    const { mutate: createPermanentLimitation, isPending } = api.reservation.createPermanentLimitation.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.reservation.getPermanentLimitations) });
            onUpdateReservationLimitations()
            setOpen(false);
            form.reset();
        },
    });

    const form = useForm<TLimitationValidator.createPermanentLimitationSchema>({
        resolver: zodResolver(limitationValidator.createPermanentLimitationSchema),
        defaultValues: {
            roomId: undefined,
            startDate: undefined,
            endDate: undefined,
        },
    });
    const onSubmit = (values: TLimitationValidator.createPermanentLimitationSchema) => {
        //startDate will be 00:00:00 and will be date type
        const startDate = values.startDate
        startDate.setHours(0, 0, 0, 0)

        const sdate = new Date(startDate)

        //endDate will be 23:59:59
        const endDate = values.endDate
        endDate.setHours(23, 59,)


        const edate = new Date(endDate)

        console.log(edate.toString(), 'edate')
        console.log(sdate.toString(), 'sdate')

        return;

        const formattedValues = {
            ...values,
            startDate: sdate,
            endDate: edate,
        };

        console.log(formattedValues, 'formattedValues');
        createPermanentLimitation(formattedValues);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Permanent Limitation</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="roomId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room</FormLabel>
                                    <Select onValueChange={
                                        (value) => {
                                            field.onChange(Number(value));
                                        }
                                    } defaultValue={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a room" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {rooms?.map((room) => (
                                                <SelectItem key={room.id} value={room.id.toString()}>
                                                    {room.translations[0]?.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Start Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(value) => {
                                                    field.onChange(value)
                                                }}
                                                disabled={(date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>End Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" loading={isPending}>Create Permanent Limitation</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePermanentLimitationModal;