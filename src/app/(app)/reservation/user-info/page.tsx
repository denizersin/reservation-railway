"use client"
import { FrontCard } from "@/components/custom/front/card"
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper"
import HeadBanner from "@/components/custom/front/head-banner"
import { ResponsiveModal, ResponsiveModalHandleRef } from "@/components/modal/responsive-modal"
import { Button } from "@/components/ui/button"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { localStorageStates } from "@/data/local-storage-states"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { RefObject, useRef } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CookieContent } from "../_components/cookie-content"
import { ReservationStatusHeader } from "../_components/reservation-status-header"

export type UserInfoImperativeModalRefs = RefObject<{
    openCookieModal?: () => void
}>

const formSchema = z.object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone_number_code: z.string(),
    phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
    allergen_warning: z.boolean(),
    special_requests: z.string().optional(),
    reservation_tags: z.array(z.string()).optional(),
    invoice_required: z.boolean(),
    // Invoice related fields
    invoice_type: z.enum(["individual", "corporate"]).optional(),
    invoice_first_name: z.string().optional(),
    invoice_last_name: z.string().optional(),
    invoice_phone_number_code: z.string().optional(),
    invoice_phone_number: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    neighbourhood: z.string().optional(),
    address: z.string().optional(),
    tin: z.string().optional(),
    tax_office: z.string().optional(),
    company_name: z.string().optional(),
    is_e_invoice_taxpayer: z.boolean().optional(),
    allergen_accuracy_consent: z.boolean().refine((val) => val === true, {
        message: "You must accept the accuracy of allergen information",
    }),
    marketing_consent: z.boolean().optional(),
})

export type TReservationUserInfoFormValues = z.infer<typeof formSchema>

const reservationTags = [
    { id: "birthday", label: "Birthday" },
    { id: "anniversary", label: "Anniversary" },
    { id: "honeymoon", label: "Honeymoon" },
]

export default function UserInfo() {

    const reservationUserInfoFormValues = localStorageStates.getReservationUserInfoFormValues()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: reservationUserInfoFormValues || {
            first_name: "",
            last_name: "",
            email: "",
            phone_number_code: "+90",
            phone_number: "",
            allergen_warning: false,
            special_requests: "",
            reservation_tags: [],
            invoice_required: false,
            invoice_type: "individual",
            invoice_first_name: "",
            invoice_last_name: "",
            invoice_phone_number_code: "+90",
            invoice_phone_number: "",
            city: "",
            district: "",
            neighbourhood: "",
            address: "",
            tin: "",
            tax_office: "",
            company_name: "",
            is_e_invoice_taxpayer: false,
            allergen_accuracy_consent: false,
            marketing_consent: false,
        },
    })

    const invoiceRequired = form.watch("invoice_required")
    const invoiceType = form.watch("invoice_type")

    function onSubmit(values: z.infer<typeof formSchema>) {
        localStorageStates.updateReservationUserInfoFormValues(values)
        router.push('/reservation/summary');
    }


    const router = useRouter()

    const onGoBack = () => {
        // localStorageStates.clearReservationUserInfoFormValues()
        router.back()
    }


    const cookieModalRef = useRef<ResponsiveModalHandleRef>({})

    return (
        <div>
            <HeadBanner showHoldingSection={true} />

            <FrontMaxWidthWrapper className="mt-10 px-2 md:px-6 pb-12">
                <ReservationStatusHeader onGoBack={onGoBack} />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="first_name"
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
                                name="last_name"
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
                                name="phone_number_code"
                                render={({ field }) => (
                                    <FormItem >
                                        <FormLabel>Code</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="+90">Turkey (+90)</SelectItem>
                                                <SelectItem value="+1">USA (+1)</SelectItem>
                                                <SelectItem value="+44">UK (+44)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone_number"
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
                            name="allergen_warning"
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
                            name="special_requests"
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
                            name="reservation_tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tag your reservation</FormLabel>
                                    <div className="flex space-x-4">
                                        {reservationTags.map((tag) => (
                                            <div key={tag.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    checked={field.value?.includes(tag.id)}
                                                    onCheckedChange={(checked) => {
                                                        const updatedTags = checked
                                                            ? [...(field.value || []), tag.id]
                                                            : field.value?.filter((value) => value !== tag.id) ||
                                                            []
                                                        field.onChange(updatedTags)
                                                    }}
                                                />
                                                <label>{tag.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="invoice_required"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Will you request an invoice for this visit?</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(value) => {
                                                field.onChange(value === "true")
                                                if (value === "false") {
                                                    form.setValue("invoice_type", undefined)
                                                }
                                            }}
                                            defaultValue={field.value ? "true" : "false"}
                                            className="flex space-x-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="true" id="invoice-yes" />
                                                <label htmlFor="invoice-yes">Yes</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="false" id="invoice-no" />
                                                <label htmlFor="invoice-no">No</label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {invoiceRequired && (
                            <div className="space-y-6 border rounded-lg p-4">
                                <FormField
                                    control={form.control}
                                    name="invoice_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Tabs
                                                    defaultValue={field.value}
                                                    className="w-full justify-center flex"
                                                    onValueChange={field.onChange}
                                                >
                                                    <TabsList className="grid grid-cols-2 w-max h-max rounded-full p-1.5">
                                                        <TabsTrigger className="py-2.5 px-5 rounded-full data-[state=active]:bg-front-primary data-[state=active]:text-white" value="individual">
                                                            Individual
                                                        </TabsTrigger>
                                                        <TabsTrigger className="py-2.5 px-5 rounded-full data-[state=active]:bg-front-primary data-[state=active]:text-white" value="corporate">
                                                            Corporate
                                                        </TabsTrigger>
                                                    </TabsList>
                                                </Tabs>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="invoice_first_name"
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
                                        name="invoice_last_name"
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
                                        name="invoice_phone_number_code"
                                        render={({ field }) => (
                                            <FormItem className="">
                                                <FormLabel>Code</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="+90">Turkey (+90)</SelectItem>
                                                        <SelectItem value="+1">USA (+1)</SelectItem>
                                                        <SelectItem value="+44">UK (+44)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="invoice_phone_number"
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
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select city" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="istanbul">Istanbul</SelectItem>
                                                        <SelectItem value="ankara">Ankara</SelectItem>
                                                        <SelectItem value="izmir">Izmir</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="district"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>District</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select district" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="kadikoy">Kadıköy</SelectItem>
                                                        <SelectItem value="besiktas">Beşiktaş</SelectItem>
                                                        <SelectItem value="sisli">Şişli</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="neighbourhood"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Neighbourhood</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select neighbourhood" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="caferaga">Caferağa</SelectItem>
                                                        <SelectItem value="moda">Moda</SelectItem>
                                                        <SelectItem value="fenerbahce">Fenerbahçe</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Enter your address" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {invoiceType === "corporate" && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="tin"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>TIN</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Tax Identification Number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="tax_office"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tax Office</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Tax Office" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="company_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Company Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Company Name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="is_e_invoice_taxpayer"
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
                                                            I am an e-invoice taxpayer
                                                        </FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                )}
                            </div>
                        )}


                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="allergen_accuracy_consent"
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
                                name="marketing_consent"
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

                        <Button type="submit" className="w-full">
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