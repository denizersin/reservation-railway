"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import HeadBanner from "@/components/custom/front/head-banner"
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { TermsConditionsCard } from "../../_components/terms-conditions-card"
import { ResponsiveModal, ResponsiveModalHandleRef } from "@/components/modal/responsive-modal"
import { useRef } from "react"
import { CookieContent } from "../../_components/cookie-content"
import { useRouter } from "next/navigation"
import { IconArrowLeft } from "@/components/svgs"
import { localStorageStates } from "@/data/local-storage-states"

// Define the form schema with Zod
const waitlistFormSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phoneCountry: z.string(),
    email: z.string().email("Please enter a valid email address"),
    acceptAllergens: z.boolean().refine(val => val === true, {
        message: "You must accept the allergens information"
    }),
    acceptMarketing: z.boolean().optional(),
})

export type WaitlistFormValues = z.infer<typeof waitlistFormSchema>

export default function ReservationWaitlistJoinPage() {
    const form = useForm<WaitlistFormValues>({
        resolver: zodResolver(waitlistFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            phoneCountry: "tr",
            email: "",
            acceptAllergens: false,
            acceptMarketing: false,
        },
    })

    async function onSubmit(data: WaitlistFormValues) {


        router.push('/reservation/waitlist/success')
        localStorageStates.updateWaitlistFormValues(form.getValues())
        // Here you would typically:
        // 1. Call your tRPC mutation
        // 2. Handle success (redirect to success page)
        // 3. Handle errors

    }

    const cookieModalRef = useRef<ResponsiveModalHandleRef>({})

    const router = useRouter()

    const onGoBack = () => {
        router.back()
    }




    return (
        <div className='relative h-full overflow-hidden bg-background flex text-front-primary'>
            <div className="main h-screen overflow-y-scroll flex-1">
                <HeadBanner showHoldingSection={false} />




                <FrontMaxWidthWrapper className="mt-10 pb-10">
                    <div className="flex items-center mb-8">
                        <IconArrowLeft onClick={onGoBack} className="size-5 mr-2 text-front-primary cursor-pointer" />
                        <div className="text-lg flex-1 font-bold flex justify-center items-center">
                            Join The Waitlist
                        </div>
                    </div>


                    <Form {...form} >
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto text-front-primary text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="First Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Last Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phoneCountry"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select country code" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="tr">Turkey(+90)</SelectItem>
                                                </SelectContent>
                                            </Select>
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

                            <TermsConditionsCard />



                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="acceptAllergens"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="">
                                                    I accept the accuracy of the information I have given about allergens.
                                                </FormLabel>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="acceptMarketing"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-front-primary">
                                                    I expressly consent to the sending of special offers and campaign information by TURK FATIH TUTAK within the scope of the{" "}
                                                    <Link href="#" className="underline">Commercial Electronic Message Approval Text</Link>.
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>


                            <Button
                                type="submit"
                                className="w-full bg-front-primary text-white h-[45px] rounded-sm"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? "Submitting..." : "Waitlist"}
                            </Button>
                        </form>
                    </Form>
                </FrontMaxWidthWrapper>
            </div>

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