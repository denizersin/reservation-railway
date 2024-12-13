import { Button } from '@/components/custom/button'
import { CustomSelect } from '@/components/custom/custom-select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useColorsSelectData } from '@/hooks/predefined/predfined'
import { api } from '@/server/trpc/react'
import TRestaurantTagValidator, { restaurantTagValidator } from '@/shared/validators/restaurant-tag'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

type Props = {
    isOpen: boolean
    setOpen: (value: boolean) => void
    tagId?: number
}

export function TagCreateModal({ isOpen, setOpen, tagId }: Props) {

    const isUpdate = Boolean(tagId)

    const queryClient = useQueryClient()

    const onSuccessCrud = () => {
        queryClient.invalidateQueries({
            queryKey: getQueryKey(api.restaurant.getAlltags)
        })
        setOpen(false)
    }

    const createTagMutation = api.restaurant.createTag.useMutation({
        onSuccess: () => {
            onSuccessCrud()
        }
    })

    const updateTagMutation = api.restaurant.updateTag.useMutation({
        onSuccess: () => {
            onSuccessCrud()
        }
    })

    const { selectData: colorsSelectData } = useColorsSelectData()


    const {
        data: restaurantLanguages
    } = api.restaurant.getRestaurantLanguages.useQuery()


    const form = useForm<TRestaurantTagValidator.createRestaurantTagFormSchema>({
        resolver: zodResolver(restaurantTagValidator.createRestaurantTagFormSchema),
        defaultValues: {
            translations: restaurantLanguages?.map(lang => ({
                name: '',
                code: '',
                languageId: lang.id
            }))
        },
    })

    const onSubmit = (data: TRestaurantTagValidator.createRestaurantTagFormSchema) => {
        if (tagId) {
            updateTagMutation.mutate({ id: tagId, translations: data.translations, tag: { color: data.color } })
        } else {
            createTagMutation.mutate(data)
        }
    }

    console.log(tagId, 'tagId')

    const { data: tagData } = api.restaurant.getTagTranslations.useQuery({
        tagId: tagId!
    }, {
        enabled: Boolean(tagId)
    })

    const translations = tagData?.translations


    console.log(form.getValues(), 'form.getValues()')

    console.log(form.formState.errors, 'form.formState.errors')


    useEffect(() => {
        if (!translations) return
        console.log('RESET')
        const newTraanslations
            = restaurantLanguages?.map(lang => {
                const translation = translations?.find(t => t.languageId === lang.language.id)
                return {
                    name: translation?.name ?? '',
                    code: translation?.code ?? '',
                    languageId: lang.language.id
                }
            })

        console.log(newTraanslations, 'newTraanslations')
        form.reset({ translations: newTraanslations, color: tagData?.color })


    }, [translations])


    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Tag</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* <CustomSelect
                            data={colorsSelectData}
                            label="Color"
                            name="tag.color"
                        /> */}
                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <FormControl>
                                        <CustomSelect
                                            value={field.value}
                                            onValueChange={(value) => field.onChange(value)}
                                            data={colorsSelectData} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {restaurantLanguages?.map((lang, index) => (
                            <div key={lang.id} className="space-y-2">
                                <h3 className="font-medium">{lang.language.name}</h3>
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
                                    name={`translations.${index}.code`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Code</FormLabel>
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
                            loading={createTagMutation.isPending}
                            type="submit">
                            {isUpdate ? 'Update Tag' : 'Create Tag'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}