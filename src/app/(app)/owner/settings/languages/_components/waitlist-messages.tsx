import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { api } from '@/server/trpc/react';
import TRestaurantMessagesValidator, { restaurantMessagesValidators } from "@/shared/validators/language";
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export const WaitlistMessages = ({
    currentLanguageId
}: { currentLanguageId: number }) => {
    const [dumb, setDumb] = useState(false)
    const { data: currentWaitlistMessageData, isLoading } = api.language.getWaitlistMessageByLanguage.useQuery({
        languageId: currentLanguageId!
    }, {
        enabled: !!currentLanguageId
    })

    const {
        mutate: updateWaitlistMessages,
        isPending
    } = api.language.updateWaitlistMessages.useMutation()

    const form = useForm<TRestaurantMessagesValidator.waitlistMessagesFormSchema>({
        resolver: zodResolver(restaurantMessagesValidators.waitlistMessagesFormSchema),
        defaultValues: {}
    });

    const onSubmit = (data: TRestaurantMessagesValidator.waitlistMessagesFormSchema) => {
        if (currentLanguageId) {
            updateWaitlistMessages({
                languageId: currentLanguageId,
                waitlistMessage: data
            });
        }
    };

    useEffect(() => {
        if (currentWaitlistMessageData) {
            const { id, restaurantId, languageId, ...fields } = currentWaitlistMessageData
            Object.entries(fields).forEach(([key, value]) => {
                form.setValue(key as any, value ?? '')
                setDumb(!dumb)
            })
        }
    }, [currentWaitlistMessageData, currentLanguageId])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {Object.keys(form.getValues()).map((fieldName) => (
                    <FormField
                        key={fieldName}
                        control={form.control}
                        name={fieldName as keyof TRestaurantMessagesValidator.waitlistMessagesFormSchema}
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