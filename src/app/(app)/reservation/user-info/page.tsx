"use client"
import { Button } from "@/components/custom/button"
import { CustomComboSelect } from "@/components/custom/custom-combo-select"
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
import { Textarea } from "@/components/ui/textarea"
import { useReservationStates } from "@/hooks/front/useReservatoinStates"
import { usePhoneCodesSelectData, useReservationTagsSelectData } from "@/hooks/predefined/predfined"
import { useToast } from "@/hooks/use-toast"
import { useShowLoadingModal } from "@/hooks/useShowLoadingModal"
import { api } from "@/server/trpc/react"
import { EnumMealNumeric } from "@/shared/enums/predefined-enums"
import TclientValidator, { clientValidator } from "@/shared/validators/front/create"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { RefObject, useRef } from "react"
import { useForm } from "react-hook-form"
import { CookieContent } from "../_components/cookie-content"
import { ReservationStatusHeader } from "../_components/reservation-status-header"
export type UserInfoImperativeModalRefs = RefObject<{
    openCookieModal?: () => void
}>




export default function UserInfo() {

    const { getReservationUserInfoFormValues, updateReservationUserInfoFormValues, getReservationState } = useReservationStates()

    const reservationUserInfoFormValues = getReservationUserInfoFormValues()

    const { selectData: phoneCodesSelectData } = usePhoneCodesSelectData()
    const form = useForm<TclientValidator.TUserInfoForm>({
        resolver: zodResolver(clientValidator.userInfoFormSchema),
        defaultValues: reservationUserInfoFormValues || {
            name: "erdem",
            surname: "yilmaz",
            email: "",
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
    const { mutate: unHoldHoldedTable, isPending: isUnHoldHoldedTableLoading } = api.reservation.unHoldHoldedTable.useMutation({
        onSuccess: () => {
            router.back()
        }
    })

    const router = useRouter()

    const onGoBack = () => {
        unHoldHoldedTable({});
    }


    const cookieModalRef = useRef<ResponsiveModalHandleRef>({})



    function onSubmit(values: TclientValidator.TUserInfoForm) {


        const reservationData = getReservationState()
        const userInfoData = values


        const newDate = reservationData?.date!
        newDate.setHours(Number(reservationData?.time?.split(':')[0]), Number(reservationData?.time?.split(':')[1]), 0)


        createReservation({
            reservationData: {
                date: newDate,
                guestCount: reservationData?.guestCount!,
                mealId: EnumMealNumeric.dinner,
                time: reservationData?.time!,
                roomId: reservationData?.areaId!
            },
            userInfo: values
        })

        updateReservationUserInfoFormValues(values)
        // router.push('/reservation/summary');
    }


    const { toast } = useToast();



    const {
        mutate: createReservation,
        isPending: isCreateReservationLoading
    } = api.reservation.createReservation.useMutation({
        onSuccess: ({ newReservationId }) => {
            toast({
                title: 'Reservation created successfully',
                description: 'You can now see your reservation in the summary page to confirm your reservation please pay the prepayment',
            })
            router.push(`/reservation/status/${newReservationId}`);
        }
    })

    console.log(form.formState.errors, 'err')
    console.log(form.getValues(), 'values')


    useShowLoadingModal([isUnHoldHoldedTableLoading])




    return (
        <div>
            <HeadBanner showHoldingSection={true} />

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

                        <Button loading={isCreateReservationLoading} type="submit" className="w-full">
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