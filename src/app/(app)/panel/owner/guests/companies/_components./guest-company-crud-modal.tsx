import { Button } from '@/components/custom/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { TGuestCompany } from '@/server/db/schema'
import { api } from '@/server/trpc/react'
import TGuestValidator, { guestValidator } from '@/shared/validators/guest'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

type Props = {
    guestCompany?: TGuestCompany
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}

const GuestCompanyCrudModal = ({
    guestCompany,
    isOpen,
    setIsOpen
}: Props) => {
    const queryClient = useQueryClient()

    const form = useForm<TGuestValidator.CreateGuestCompanySchema>({
        resolver: zodResolver(guestValidator.createGuestCompanySchema),
        defaultValues: {
            companyName: '',
            email: '',
            phone: ''
        }
    })

    const onSuccessCrud = () => {
        setIsOpen(false)
        queryClient.invalidateQueries({
            queryKey: getQueryKey(api.guest.getGuestCompaniesPagination)
        })
    }

    const { mutate: createGuestCompany, isPending: isCreateGuestCompanyPending } = api.guest.createGuestCompanyWithName.useMutation({
        onSuccess: onSuccessCrud
    })
    const { mutate: updateGuestCompany, isPending: isUpdateGuestCompanyPending } = api.guest.updateGuestCompany.useMutation({
        onSuccess: onSuccessCrud
    })

    const isUpdating = !!guestCompany

    const onSubmit = (data: TGuestValidator.CreateGuestCompanySchema) => {
        if (isUpdating && guestCompany) {
            updateGuestCompany({
                id: guestCompany.id,
                data
            })
        } else {
            createGuestCompany(data)
        }
    }

    useEffect(() => {
        if (guestCompany) {
            form.reset({
                companyName: guestCompany.companyName,
                email: guestCompany.email || '',
                phone: guestCompany.phone || ''
            })
        }
    }, [guestCompany])

    useEffect(() => {
        form.reset()
    }, [isOpen])

    const isLoading = isCreateGuestCompanyPending || isUpdateGuestCompanyPending
    const isDisabled = isLoading || form.formState.isSubmitting

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className='max-w-[500px]'>
                <DialogHeader>
                    <DialogTitle>{isUpdating ? 'Update Company' : 'Create Company'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email (Optional)</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone (Optional)</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="tel" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='flex justify-end'>
                            <Button
                                type="submit"
                                disabled={isDisabled}
                                loading={isLoading}
                            >
                                {isUpdating ? 'Update Company' : 'Create Company'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default GuestCompanyCrudModal