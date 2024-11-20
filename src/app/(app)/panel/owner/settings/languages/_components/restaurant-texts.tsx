import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/server/trpc/react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { restaurantMessagesValidators } from '@/shared/validators/language';
import RichTextEditor from '@/components/rich-text-editor';


type Props = {
    currentLanguageId: number;
};

export const RestaurantTexts = ({ currentLanguageId }: Props) => {
    const { data: restaurantTexts, isLoading } = api.language.getRestaurantTexts.useQuery({
        languageId: currentLanguageId,
    });

    const updateRestaurantTextsMutation = api.language.updateRestaurantTexts.useMutation();

    const form = useForm({
        resolver: zodResolver(restaurantMessagesValidators.restaurantTextsFormSchema),
        defaultValues: {
            reservationRequirements: '',
            dressCode: '',
            agreements: '',

        },
    });

    React.useEffect(() => {
        if (restaurantTexts) {
            const { id, restaurantId, languageId, ...fields } = restaurantTexts;
            Object.entries(fields).forEach(([key, value]) => {
                form.setValue(key as any, value ?? '')
            })
        }
    }, [restaurantTexts, currentLanguageId, form]);

    const onSubmit = form.handleSubmit(async (data) => {
        try {
            await updateRestaurantTextsMutation.mutateAsync({
                languageId: currentLanguageId,
                restaurantTexts: data,
            });
            // Optionally, show a success message
        } catch (error) {
            // Handle error
            console.error('Failed to update restaurant texts:', error);
        }
    });



    if (isLoading) return <div>Loading...</div>;

    return (
        <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">


                <FormField
                    control={form.control}
                    name="reservationRequirements"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Reservation Requirements</FormLabel>
                            <FormControl>
                                <RichTextEditor
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="dressCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dress Code</FormLabel>
                            <FormControl>
                                <RichTextEditor
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="agreements"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Agreements</FormLabel>
                            <FormControl>
                                <RichTextEditor
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={updateRestaurantTextsMutation.isPending}>
                    {updateRestaurantTextsMutation.isPending ? 'Updating...' : 'Update Restaurant Texts'}
                </Button>
            </form>
        </Form>
    );
};