import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from '@/lib/utils'
import { api } from '@/server/trpc/react'
import TPersonelValidator, { personelValidator } from '@/shared/validators/user/personel'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Calendar } from "@/components/ui/calendar"
import { TPersonel } from '@/server/db/schema/guest'
import { Button } from '@/components/custom/button'

type Props = {
    open: boolean,
    setOpen: (open: boolean) => void
    personelData?: TPersonel
}

const PersonelCrudModal = ({
    open,
    setOpen,
    personelData
}: Props) => {
    const queryClient = useQueryClient();

    const form = useForm<TPersonelValidator.CreatePersonelSchema>({
        resolver: zodResolver(personelValidator.createPersonelSchema),
        defaultValues: {
            fullName: '',
            phone: '',
            email: '',
            birthDate: null,
            specialId: '',
        }
    })

    const onSuccessCrud = () => {
        setOpen(false)
        queryClient.invalidateQueries({
            queryKey: getQueryKey(api.restaurant.getPersonels)
        })
    }

    const {
        mutate: createPersonel,
        isPending: isCreatingPersonel
    } = api.restaurant.createPersonel.useMutation({
        onSuccess: onSuccessCrud
    })
    const { mutate: updatePersonel,
        isPending: isUpdatingPersonel
    } = api.restaurant.updatePersonel.useMutation({
        onSuccess: onSuccessCrud
    })

    const onSubmit = (data: TPersonelValidator.CreatePersonelSchema) => {
        if (personelData) {
            updatePersonel({
                id: personelData.id,
                data: data
            })
        } else {
            createPersonel(data)
        }
    }

    useEffect(() => {
        if (personelData) {
            form.reset(personelData)
        }
    }, [personelData])

    const isLoading = isCreatingPersonel || isUpdatingPersonel
    const isDisabled = isLoading || form.formState.isSubmitting

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>{personelData ? 'Update Personel' : 'Create Personel'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <Input {...field} />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <Input {...field} type="email" />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <Input {...field} />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="birthDate" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Birth Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
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
                                            selected={field.value ?? undefined}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="specialId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Special ID</FormLabel>
                                <Input {...field} />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <Button
                            disabled={isDisabled}
                            type="submit"
                            loading={isLoading}
                        >
                            {personelData ? 'Update Personel' : 'Create Personel'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default PersonelCrudModal
