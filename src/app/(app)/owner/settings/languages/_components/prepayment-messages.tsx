import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { api } from '@/server/trpc/react';
import TRestaurantMessagesValidator, { restaurantMessagesValidators } from "@/shared/validators/language";
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export const PrepaymentMessages = ({
    currentLanguageId
}: { currentLanguageId: number }) => {
    const [dumb, setDumb] = useState(false)
    const { data: currentPrepaymentMessageData, isLoading } = api.language.getPrepaymentMessageByLanguage.useQuery({
        languageId: currentLanguageId!
    }, {
        enabled: !!currentLanguageId
    })

    const {
        mutate: updatePrepaymentMessages,
        isPending
    } = api.language.updatePrepaymentMessages.useMutation()

    const form = useForm<TRestaurantMessagesValidator.prepaymentMessagesFormSchema>({
        resolver: zodResolver(restaurantMessagesValidators.prepaymentMessagesFormSchema),
        defaultValues: {}
    });

    const onSubmit = (data: TRestaurantMessagesValidator.prepaymentMessagesFormSchema) => {
        if (currentLanguageId) {
            updatePrepaymentMessages({
                languageId: currentLanguageId,
                prepaymentMessage: data
            });
        }
    };

    useEffect(() => {
        if (currentPrepaymentMessageData) {
            const { id, restaurantId, languageId, ...fields } = currentPrepaymentMessageData
            Object.entries(fields).forEach(([key, value]) => {
                form.setValue(key as any, value ?? '')
                setDumb(!dumb)
            })
        }
    }, [currentPrepaymentMessageData, currentLanguageId])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {Object.keys(form.getValues()).map((fieldName) => (
                    <FormField
                        key={fieldName}
                        control={form.control}
                        name={fieldName as keyof TRestaurantMessagesValidator.prepaymentMessagesFormSchema}
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
    );
};