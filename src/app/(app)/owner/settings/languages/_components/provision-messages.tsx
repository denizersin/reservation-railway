import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { api } from '@/server/trpc/react';
import TRestaurantMessagesValidator, { restaurantMessagesValidators } from "@/shared/validators/language";
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export const ProvisionMessages = ({
    currentLanguageId
}: { currentLanguageId: number }) => {
    const [dumb, setDumb] = useState(false)
    const { data: currentProvisionMessageData, isLoading } = api.language.getProvisionMessageByLanguage.useQuery({
        languageId: currentLanguageId!
    }, {
        enabled: !!currentLanguageId
    })

    const {
        mutate: updateProvisionMessages,
        isPending
    } = api.language.updateProvisionMessages.useMutation()

    const form = useForm<TRestaurantMessagesValidator.provisionMessagesFormSchema>({
        resolver: zodResolver(restaurantMessagesValidators.provisionMessagesFormSchema),
        defaultValues: {}
    });

    const onSubmit = (data: TRestaurantMessagesValidator.provisionMessagesFormSchema) => {
        if (currentLanguageId) {
            updateProvisionMessages({
                languageId: currentLanguageId,
                provisionMessage: data
            });
        }
    };

    useEffect(() => {
        if (currentProvisionMessageData) {
            const { id, restaurantId, languageId, ...fields } = currentProvisionMessageData
            Object.entries(fields).forEach(([key, value]) => {
                form.setValue(key as any, value ?? '')
                setDumb(!dumb)
            })
        }
    }, [currentProvisionMessageData, currentLanguageId])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {Object.keys(form.getValues()).map((fieldName) => (
                    <FormField
                        key={fieldName}
                        control={form.control}
                        name={fieldName as keyof TRestaurantMessagesValidator.provisionMessagesFormSchema}
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
