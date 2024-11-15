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
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'


type Props = {
    open: boolean,
    setOpen: (open: boolean) => void
    guestData?: TGuest,
    guestId?: number
}

const GuestCrudModal = ({
    open,
    setOpen,
    guestData,
    guestId
}: Props) => {
    const queryClient = useQueryClient();

    const { selectData: restaurantTags, isLoading: isLoadingRestaurantTags } = useRestaurantTagsSelectData();
    const { selectData: countries, isLoading: isLoadingCountries } = useCountriesSelectData();
    const { selectData: languages, isLoading: isLoadingLanguages } = useLanguagesSelectData();
    const { selectData: guestCompanies, isLoading: isLoadingGuestCompanies } = useGuestCompanySelectData();


    const form = useForm<TGuestValidator.CreateGuestForm>({
        resolver: zodResolver(guestValidator.createGuestSchemaForm),
        defaultValues: {
            isVip: false,
            isSendSmsAndEmail: false,
            isSendConfirmationNotifs: false,
            isClaimProvision: false,
            isSendReviewNotifs: false,
            tagIds: []
        }
    })

    const onSuccsessCrud = () => {
        setOpen(false)
        queryClient.invalidateQueries({
            queryKey: getQueryKey(api.guest.getGuestsPagination)
        })
    }

    const {
        mutate: createGuest,
        isPending: isCreatingGuest
    } = api.guest.createGuest.useMutation({
        onSuccess: onSuccsessCrud
    })
    const {
        mutate: updateGuest,
        isPending: isUpdatingGuest
    } = api.guest.updateGuest.useMutation({
        onSuccess: onSuccsessCrud
    })

    const { data: guestDetailData } = api.guest.getGuestDetail.useQuery({
        guestId: guestId!
    }, {
        enabled: !!guestId
    })


    const onSubmit = (data: TGuestValidator.CreateGuest) => {
        if (isUpdate) {
            const id = guestData?.id || guestId!
            updateGuest({
                data: {
                    ...data,
                },
                id
            })
        } else {
            createGuest(data)
        }
    }



    useEffect(() => {
        if (guestData) {
            const { tags, ...rest } = guestData;
            form.reset({
                ...rest,
                tagIds: tags.map((tag) => tag.tagId)
            })
        }
    }, [guestData])

    useEffect(() => {
        if (guestDetailData?.guest) {
            const { guest: { tags, ...rest }, guestReservations } = guestDetailData;
            form.reset({
                ...rest,
                tagIds: tags.map((tag) => tag.tagId)
            })

        }
    }, [guestDetailData])

    useEffect(() => {
        form.reset()
    }, [open])

    console.log(form.getValues(), 'values')

    const isUpdate = !!guestId || !!guestData


    const isLoading = isLoadingRestaurantTags || isLoadingCountries || isLoadingLanguages || isLoadingGuestCompanies || isCreatingGuest || isUpdatingGuest
    const isDisabled = isLoading || form.formState.isSubmitting

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='max-h-[90vh] overflow-y-auto max-w-[800px]'>
                <DialogHeader>
                    <DialogTitle>{isUpdate ? 'Update Guest' : 'Create Guest'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className=" grid grid-cols-2 gap-4 ">

                        {/* Personal Information */}
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem >
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
                                <FormLabel>Language</FormLabel>
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
                            <FormItem className='flex flex-col flex-1'>
                                <FormLabel className='opacity-0'>Is VIP</FormLabel>
                                <div className='flex flex-1 items-center  gap-2'>
                                    <FormLabel>Is VIP</FormLabel>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </div>

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
                            <FormItem className='flex flex-col flex-1'>
                                <FormLabel className='opacity-0'>Send SMS and Email</FormLabel>
                                <div className='flex flex-1 items-center  gap-2'>
                                    <FormLabel>Send SMS and Email</FormLabel>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </div>

                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="isSendConfirmationNotifs" render={({ field }) => (
                            <FormItem className='flex flex-col flex-1'>
                                <FormLabel className='opacity-0'>Send Confirmation Notifications</FormLabel>
                                <div className='flex flex-1 items-center  gap-2'>
                                    <FormLabel>Send Confirmation Notifications</FormLabel>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="isClaimProvision" render={({ field }) => (
                            <FormItem className='flex flex-col flex-1'>
                                <FormLabel className='opacity-0'>Claim Provision</FormLabel>
                                <div className='flex flex-1 items-center  gap-2'>
                                    <FormLabel>Claim Provision</FormLabel>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="isSendReviewNotifs" render={({ field }) => (
                            <FormItem className='flex flex-col flex-1'>
                                <FormLabel className='opacity-0'>Send Review Notifications</FormLabel>
                                <div className='flex flex-1 items-center  gap-2'>
                                    <FormLabel>Send Review Notifications</FormLabel>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </div>
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

                        <div className='col-span-2 '>
                            <FormField control={form.control} name="isContactAssistant" render={({ field }) => (
                                <FormItem className='flex flex-col flex-1'>
                                    <FormLabel className='opacity-0'>Contact Assistant</FormLabel>
                                    <div className='flex flex-1 items-center  gap-2'>
                                        <FormLabel>Contact Assistant</FormLabel>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className='col-span-2 flex justify-end'>
                            <FormControl >
                                <Button
                                    className='w-fit'
                                    disabled={isDisabled}
                                    type="submit"
                                    loading={isLoading || form.formState.isSubmitting}
                                >
                                    {isUpdate ? 'Update Guest' : 'Create Guest'}
                                </Button>
                            </FormControl>
                        </div>

                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default GuestCrudModal