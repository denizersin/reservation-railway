import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { api } from '@/server/trpc/react';
import TRestaurantMessagesValidator, { restaurantMessagesValidators } from "@/shared/validators/language";
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CodeMessages } from "./code-messages";

export const ReservationMessages = ({
    currentLanguageId
}: { currentLanguageId: number }) => {
    const [dumb, setDumb] = useState(false)
    const { data: currentReservationMessageData, isLoading } = api.language.getReservationMessageByLanguage.useQuery({
        languageId: currentLanguageId!
    }, {
        enabled: !!currentLanguageId
    })

    const {
        mutate: updateReservationMessages,
        isPending
    } = api.language.updateReservationMessages.useMutation()

    const form = useForm<TRestaurantMessagesValidator.reservationMessagesFormSchema>({
        resolver: zodResolver(restaurantMessagesValidators.reservationMessagesFormSchema),
        defaultValues: {}
    });

    const onSubmit = (data: TRestaurantMessagesValidator.reservationMessagesFormSchema) => {
        if (currentLanguageId) {
            updateReservationMessages({
                languageId: currentLanguageId,
                reservationMessages: data
            });
        }
    };



    useEffect(() => {
        if (currentReservationMessageData) {
            const { id, restaurantId, languageId, ...fields } = currentReservationMessageData
            Object.entries(fields).forEach(([key, value]) => {
                form.setValue(key as any, value ?? '')
                setDumb(!dumb)
            })
        }
    }, [currentReservationMessageData, currentLanguageId])


    return (
        <div className="flex flex-col md:flex-row">
            <Form
                {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
                    {Object.keys(form.getValues()).map((fieldName) => (
                        <FormField
                            key={fieldName}
                            control={form.control}
                            name={fieldName as keyof TRestaurantMessagesValidator.reservationMessagesFormSchema}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            key={fieldName}
                                            {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                    <Button type="submit" disabled={isPending || isLoading}>
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </Button>

                </form>
            </Form>
            <CodeMessages />
        </div>

    );
};