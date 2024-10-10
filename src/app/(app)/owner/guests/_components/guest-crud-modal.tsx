import { Button } from '@/components/custom/button'
import { CustomSelect } from '@/components/custom/custom-select'
import { MultiSelect } from '@/components/custom/multi-select'
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCountriesSelectData, useGuestCompanySelectData, useLanguagesSelectData, useRestaurantTagsSelectData } from '@/hooks/predefined/predfined'
import { cn } from '@/lib/utils'
import { TGuest } from '@/server/db/schema/guest'
import { api } from '@/server/trpc/react'
import { GenderToSelect, VipLevelToSelect } from '@/shared/enums/predefined-enums'
import TGuestValidator, { guestValidator } from '@/shared/validators/guest'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'


type Props = {
    open: boolean,
    setOpen: (open: boolean) => void
    guestData?: TGuest
}

const GuestCrudModal = ({
    open,
    setOpen,
    guestData
}: Props) => {
    const { selectData: restaurantTags, isLoading: isLoadingRestaurantTags  } = useRestaurantTagsSelectData();
    const { selectData: countries, isLoading: isLoadingCountries } = useCountriesSelectData();
    const { selectData: languages, isLoading: isLoadingLanguages } = useLanguagesSelectData();
    const { selectData: guestCompanies, isLoading: isLoadingGuestCompanies } = useGuestCompanySelectData();


    const form = useForm<TGuestValidator.CreateGuest>({
        resolver: zodResolver(guestValidator.createGuestSchema),
        defaultValues: {
            isVip: false,
            isSendSmsAndEmail: false,
            isSendConfirmationNotifs: false,
            isClaimProvision: false,
            isSendReviewNotifs: false,
            tagIds: []
        }
    })

    const { mutate: createGuest } = api.guest.createGuest.useMutation()
    const { mutate: updateGuest } = api.guest.updateGuest.useMutation()


    const onSubmit = (data: TGuestValidator.CreateGuest) => {
        if (guestData) {
            console.log(data,)
            updateGuest({ data: {
                ...data,
            }, id: guestData.id })
        } else {
            createGuest(data)
        }
    }

    console.log(form.formState.errors, 'errors')


    useEffect(() => {
        if (guestData) {
            const { tags, ...rest } = guestData;
            form.reset({
                ...rest,
                tagIds: tags.map((tag) => tag.tagId)
            })
        }
    }, [guestData])

    const isLoading = isLoadingRestaurantTags || isLoadingCountries || isLoadingLanguages || isLoadingGuestCompanies
    const isDisabled = isLoading || form.formState.isSubmitting

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Create Guest</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className=" grid grid-cols-2 gap-4">

                        {/* Personal Information */}
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <Input {...field} />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="surname" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Surname</FormLabel>
                                <Input {...field} />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <Input {...field} />
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
                        <FormField control={form.control} name="stablePhone" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stable Phone</FormLabel>
                                <Input {...field} />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="gender" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <CustomSelect
                                    data={GenderToSelect}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="birthDate" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Birth Date</FormLabel>
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
                                                selected={field.value}
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
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="anniversaryDate" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Anniversary Date</FormLabel>
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
                                                selected={field.value ?? new Date()}
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
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <Input {...field} />
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Assistant Information */}
                        <FormField control={form.control} name="assistantName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assistant Name</FormLabel>
                                <Input {...field} />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="assistantPhone" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assistant Phone</FormLabel>
                                <Input {...field} />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="assistantEmail" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assistant Email</FormLabel>
                                <Input {...field} />
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Company Information */}
                        <FormField control={form.control} name="companyId" render={({ field }) => (
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

                        <FormField control={form.control} name="countryId" render={({ field }) => (
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
                        <FormField control={form.control} name="languageId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Country</FormLabel>
                                <CustomSelect
                                    data={languages}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    value={String(field.value)}
                                />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="position" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Position</FormLabel>
                                <Input {...field} />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="department" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <Input {...field} />
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* VIP Information */}
                        <FormField control={form.control} name="isVip" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Is VIP</FormLabel>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="vipLevel" render={({ field }) => (
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

                        {/* Notification Information */}
                        <FormField control={form.control} name="isSendSmsAndEmail" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Send SMS and Email</FormLabel>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="isSendConfirmationNotifs" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Send Confirmation Notifications</FormLabel>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="isClaimProvision" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Claim Provision</FormLabel>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="isSendReviewNotifs" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Send Review Notifications</FormLabel>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Tags */}
                        <FormField control={form.control} name="tagIds" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tags</FormLabel>
                                <MultiSelect
                                    options={restaurantTags}
                                    onValueChange={(value) => field.onChange(value.map((v) => Number(v)))}
                                    value={field.value.map((v) => String(v))}
                                />
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormControl>
                            <Button 
                                disabled={isDisabled}
                                type="submit"
                                loading={isLoading || form.formState.isSubmitting}
                            >
                                {guestData ? 'Update Guest' : 'Create Guest'}
                            </Button>
                        </FormControl>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default GuestCrudModal