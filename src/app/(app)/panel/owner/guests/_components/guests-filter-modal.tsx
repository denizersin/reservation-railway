import TGuestValidator, { guestValidator } from "@/shared/validators/guest"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { Input } from '@/components/ui/input'
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { CustomSelect } from '@/components/custom/custom-select'
import { useCountriesSelectData, useGuestCompanySelectData, useLanguagesSelectData } from "@/hooks/predefined/predfined"
import { VipLevelToSelect } from "@/shared/enums/predefined-enums"
import { Checkbox } from "@/components/ui/checkbox"
import { DEFAULT_ROWS_PER_PAGE } from "@/lib/constants"

export function GuestsFilterModal({
    open,
    setOpen,
    queryInput,
    setQueryInput
}: {
    open: boolean
    setOpen: (open: boolean) => void
    queryInput: TGuestValidator.GuestsPaginationSchema
    setQueryInput: (queryInput: TGuestValidator.GuestsPaginationSchema) => void
}) {

        const form = useForm<TGuestValidator.GuestsPaginationSchema>({
        resolver: zodResolver(guestValidator.guestsPaginationSchema),
        defaultValues: queryInput
    })

    const onSubmit = (data: TGuestValidator.GuestsPaginationSchema) => {
        setQueryInput({
            ...data,
            pagination: {
                ...data.pagination,
                page: 1
            },
            global_search: undefined
        })
        setOpen(false)
    }

    const { selectData: countries } = useCountriesSelectData();
    const { selectData: guestCompanies } = useGuestCompanySelectData();
    const { selectData: languages } = useLanguagesSelectData();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Filter</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField control={form.control} name="filters.name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <Input {...field} placeholder="Enter name" />
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="filters.surname" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Surname</FormLabel>
                                    <Input {...field} placeholder="Enter surname" />
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="filters.email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <Input {...field} placeholder="Enter email" />
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="filters.phone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <Input {...field} placeholder="Enter phone" />
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="filters.companyId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company</FormLabel>
                                    <CustomSelect
                                        data={guestCompanies}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={String(field.value)}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="filters.countryId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <CustomSelect
                                        data={countries}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={String(field.value)}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="filters.languageId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Language</FormLabel>
                                    <CustomSelect
                                        data={languages}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={String(field.value)}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="filters.isVip" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Is VIP</FormLabel>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="filters.vipLevel" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>VIP Level</FormLabel>
                                    <CustomSelect
                                        data={VipLevelToSelect}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="filters.isContactAssistant" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Assistant</FormLabel>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="flex justify-end">
                                <Button type="submit">Apply Filters</Button>
                            </div>
                        </form>
                    </Form>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    )
}