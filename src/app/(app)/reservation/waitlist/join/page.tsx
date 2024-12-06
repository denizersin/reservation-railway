"use client"
import { Button } from "@/components/custom/button"
import { FrontCard } from "@/components/custom/front/card"
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper"
import HeadBanner from "@/components/custom/front/head-banner"
import { MultiSelect } from "@/components/custom/multi-select"
import { ResponsiveModal, ResponsiveModalHandleRef } from "@/components/modal/responsive-modal"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useReservationStates } from "@/hooks/front/useReservatoinStates"
import { usePhoneCodesSelectData, useReservationTagsSelectData } from "@/hooks/predefined/predfined"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/server/trpc/react"
import { EnumMealNumeric } from "@/shared/enums/predefined-enums"
import TclientValidator, { clientValidator } from "@/shared/validators/front/create"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { RefObject, useRef } from "react"
import { useForm } from "react-hook-form"
import { CookieContent } from "../../_components/cookie-content"
import { ReservationStatusHeader } from "../../_components/reservation-status-header"
import { CustomComboSelect } from "@/components/custom/custom-combo-select"
export type UserInfoImperativeModalRefs = RefObject<{
    openCookieModal?: () => void
}>




export default function UserInfo() {

    const { getWaitlistFormValues, getWaitlistReservationState, updateWaitlistFormValues } = useReservationStates()

    const waitlistFormValues = getWaitlistFormValues()

    const { selectData: phoneCodesSelectData } = usePhoneCodesSelectData()

    const form = useForm<TclientValidator.TWaitlistForm>({
        resolver: zodResolver(clientValidator.waitlistFormSchema),
        defaultValues: waitlistFormValues || {
            name: "erdem",
            surname: "yilmaz",
            email: "erdem@gmail.com",
            phoneCodeId: 1,
            phone: "5321234567",
            allergenWarning: false,
            guestNote: "",
            reservationTags: [],
            allergenAccuracyConsent: true,
            marketingConsent: true,
        },
    })


    const { selectData: reservationTagsSelectData, isLoading: reservationTagsIsLoading } = useReservationTagsSelectData()


    const router = useRouter()

    const onGoBack = () => {
        router.back()
    }


    const cookieModalRef = useRef<ResponsiveModalHandleRef>({})



    function onSubmit(values: TclientValidator.TWaitlistForm) {

        const waitlistData = getWaitlistReservationState()
        const userInfoData = values

        console.log(waitlistData, 'waitlistData')


        const newDate = waitlistData?.date!
        newDate.setHours(0, 0, 0);


        createWaitlist({
            guestCount: waitlistData?.guestCount!,
            waitlistDate: newDate,
            mealId: EnumMealNumeric.dinner,
            waitlistUserInfo: values
        })

        updateWaitlistFormValues(values)
    }


    const { toast } = useToast();



    const {
        mutate: createWaitlist,
        isPending: isCreateWaitlistLoading
    } = api.waitlist.createWaitlist.useMutation({
        onSuccess: ({ waitlistId }) => {
            toast({
                title: 'Waitlist created successfully',
                description: 'We will inform you when a table is available',
            })
            router.push(`/reservation/waitlist/status/${waitlistId}`);
        }
    })




    return (
        <div>
            <HeadBanner showHoldingSection={false} />

            <FrontMaxWidthWrapper className=" px-2 md:px-6 pb-12">
                <ReservationStatusHeader onGoBack={onGoBack} />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="First name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="surname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Last name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="phoneCodeId"
                                render={({ field }) => (
                                    <FormItem >
                                        <FormLabel>Code</FormLabel>

                                        <FormControl>
                                            <CustomComboSelect
                                                buttonClass="w-full"
                                                data={phoneCodesSelectData}
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                value={String(field.value)}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Phone number" {...field} />
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
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Email" type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="allergenWarning"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Allergen Warning</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(value) => field.onChange(value === "true")}
                                            defaultValue={field.value ? "true" : "false"}
                                            className="flex space-x-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="true" id="yes" />
                                                <label htmlFor="yes">Yes</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="false" id="no" />
                                                <label htmlFor="no">No</label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FrontCard className="mt-6">
                            <FrontCard.Title className="">Information about allergies</FrontCard.Title>
                            <div className="font-light text-sm ">
                                Due to our daily micro seasonal changes on our menu, we use onion, garlic and dairy (lactose) in our dishes. Therefore, we cannot remove any of these products. We are not able to accommodate vegan, and gluten free allergies.
                            </div>
                        </FrontCard>



                        <FormField
                            control={form.control}
                            name="guestNote"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Special Requests</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="You can enter special requests or allergen information..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reservationTags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tag your reservation</FormLabel>
                                    <div className="flex space-x-4">
                                        <MultiSelect
                                            options={reservationTagsSelectData}
                                            onValueChange={vals => field.onChange(vals.map(Number))}
                                            value={field.value?.map(String)}
                                        />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="allergenAccuracyConsent"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                I accept the accuracy of the information I have given about allergens.
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="marketingConsent"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm font-normal">
                                                I expressly consent to the sending of special offers and campaign information by TURK FATIH TUTAK within the scope of the{" "}
                                                <a href="#" className="underline">
                                                    Commercial Electronic Message Approval Text
                                                </a>
                                                .
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <div className="text-sm">
                                By clicking Complete My Reservation, you are deemed to have accepted{" "}
                                <span className="underline">
                                    Seatwise Terms of Use and Privacy Policy
                                </span>
                                . You can reach the Information text on the{" "}
                                <span className="underline">
                                    Protection and Processing of Personal Data
                                </span>{" "}
                                here and the{" "}
                                <span
                                    onClick={() => {
                                        cookieModalRef.current.openModal?.()
                                    }}
                                    className="underline cursor-pointer">
                                    Cookie Policy
                                </span>{" "}
                                text here.
                            </div>
                        </div>

                        <Button loading={isCreateWaitlistLoading} type="submit" className="w-full">
                            Complete My Reservation
                        </Button>
                    </form>
                </Form>
            </FrontMaxWidthWrapper>


            <ResponsiveModal
                modalContentClassName="h-[80vh] w-[60vw] max-w-[60vw]  flex flex-col"
                sheetContentClassName="h-[70vh] flex flex-col"
                handleRef={cookieModalRef}
            >
                <CookieContent />
            </ResponsiveModal>



        </div>
    )
}