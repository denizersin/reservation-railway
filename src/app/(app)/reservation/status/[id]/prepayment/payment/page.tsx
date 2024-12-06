"use client";

import { Button } from "@/components/custom/button";
import { FrontCard } from "@/components/custom/front/card";
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper";
import HeadBanner from "@/components/custom/front/head-banner";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShowLoadingModal } from "@/hooks/useShowLoadingModal";
import { api } from "@/server/trpc/react";
import TclientValidator, { clientValidator } from "@/shared/validators/front/create";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { ReservationStatusHeader } from "@/app/(app)/reservation/_components/reservation-status-header";
import { TPaymentResult } from "@/app/api/iyzipay/callback/route";
import { CustomComboSelect } from "@/components/custom/custom-combo-select";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePhoneCodesSelectData } from "@/hooks/predefined/predfined";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useReservationStatusContext } from "../../layout";
import { ThreeDModal } from "./_components/ThreeDModal";

export default function Page() {
    const { selectData: phoneCodes, isLoading: isLoadingPhoneCodes } = usePhoneCodesSelectData();

    const { reservationStatusData, inValidateReservationStatusData } = useReservationStatusContext()

    const amount = reservationStatusData?.currentPrepayment?.amount

    const router = useRouter();

    const form = useForm<TclientValidator.TPrePaymentForm>({
        resolver: zodResolver(clientValidator.prePaymentFormSchema),
        defaultValues: {
            name_and_surname: reservationStatusData?.guest?.name ?? "",
            card_number: "1212121212121212",
            expiry_date: "12/24",
            cvc: "123",

            cancellation_policy_consent: true,
            preliminary_form_consent: true,
            distance_sales_consent: true,

        },
    })

    const onGoBack = () => {
        router.back();
    }

    function onSubmit(values: TclientValidator.TPrePaymentForm) {
        console.log(values)
        // Handle payment submission
        // makePrepayment({ reservationId: reservationStatusData?.id! })
        createPayment({
            reservationId: reservationStatusData?.id!
        })

    }


    const [threeDSContent, setThreeDSContent] = useState<string | null>(null);

    const { mutate: createPayment, isPending: isCreatingPayment } = api.payment.createPayment.useMutation({
        onSuccess: (data) => {
            if (data.status === 'success') {
                setThreeDSContent(data.threeDSHtmlContent);
                setIsThreeDModalOpen(true)
            } else {
                toast({
                    title: data.status,
                    description: "Something went wrong",
                    variant: 'destructive',
                    
                })
            }
        }
    });


    const invoiceRequired = form.watch("invoice.invoiceRequired")
    const invoiceType = form.watch("invoice.invoiceType")

    const { toast } = useToast();
    const onMessageFromThreeDModal = (data: TPaymentResult) => {
        toast({
            title: data.status,
            description: data.status === 'success' ? 'Payment successful' : 'Payment failed',
            variant: data.status === 'success' ? 'default' : 'destructive'
        })
        if (data.status === 'success') {
            inValidateReservationStatusData()
        }
        setIsThreeDModalOpen(false)
        setThreeDSContent(null)
    }

    useEffect(() => {
        form.setValue("name_and_surname", reservationStatusData?.guest?.name ?? "")
    }, [reservationStatusData?.guest?.name])

    const [isThreeDModalOpen, setIsThreeDModalOpen] = useState(false)

    const onChangeModal = (value: boolean) => {
        setIsThreeDModalOpen(value)
        if (!value) {
            setThreeDSContent(null)
        }
    }

    useShowLoadingModal([isCreatingPayment])


    return (
        <div>
            <HeadBanner showHoldingSection={false} />
            <FrontMaxWidthWrapper className="px-2 md:px-6 pb-12">
                <ReservationStatusHeader
                    guestCount={reservationStatusData?.guestCount}
                    date={reservationStatusData?.reservationDate}
                    time={reservationStatusData?.hour}
                    onGoBack={onGoBack}
                    showBackButton={false}
                />

                <div className="info-alert p-4 text-sm text-front-primary bg-gray-100/80 rounded-md mb-6">
                    <span className="font-bold">{amount} TL</span> will be charged to your credit card to confirm your reservation.
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-front-primary ">

                        <div className="space-y-4">

                            <FormField
                                control={form.control}
                                name="name_and_surname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input className="rounded-sm h-12" placeholder="Card holder name and surname" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />


                        </div>


                        <FormField
                            control={form.control}
                            name="card_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input className="rounded-sm h-12"
                                            placeholder="Card number"
                                            {...field}
                                            maxLength={16}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="expiry_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input className="rounded-sm h-12"
                                                placeholder="MM/YY"
                                                {...field}
                                                maxLength={5}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\D/g, '');
                                                    if (value.length >= 2) {
                                                        value = value.slice(0, 2) + '/' + value.slice(2);
                                                    }
                                                    field.onChange(value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cvc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input className="rounded-sm h-12"
                                                placeholder="CVC"
                                                {...field}
                                                maxLength={3}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    field.onChange(value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="invoice.invoiceRequired"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Will you request an invoice for this visit?</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(value) => {
                                                field.onChange(value === "true")
                                                if (value === "false") {
                                                    form.setValue("invoice.invoiceType", undefined)
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
                                    name="invoice.invoiceType"
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
                                        name="invoice.invoiceFirstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    <Input className="rounded-sm h-12" placeholder="First name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="invoice.invoiceLastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <Input className="rounded-sm h-12" placeholder="Last name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="invoice.invoicePhoneCodeId"
                                        render={({ field }) => (
                                            <FormItem className="">
                                                <FormLabel>Phone Code</FormLabel>
                                                <CustomComboSelect
                                                    buttonClass='w-full'
                                                    data={phoneCodes}
                                                    onValueChange={(value) => field.onChange(String(value))}
                                                    value={String(field.value)}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="invoice.invoicePhone"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input className="rounded-sm h-12" placeholder="Phone number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="invoice.city"
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
                                        name="invoice.district"
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
                                        name="invoice.neighbourhood"
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
                                    name="invoice.address"
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
                                                name="invoice.tin"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>TIN</FormLabel>
                                                        <FormControl>
                                                            <Input className="rounded-sm h-12" placeholder="Tax Identification Number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="invoice.taxOffice"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tax Office</FormLabel>
                                                        <FormControl>
                                                            <Input className="rounded-sm h-12" placeholder="Tax Office" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="invoice.companyName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Company Name</FormLabel>
                                                    <FormControl>
                                                        <Input className="rounded-sm h-12" placeholder="Company Name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="invoice.isEInvoiceTaxpayer"
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



                        <FrontCard>
                            <FrontCard.Title>Prepayment Cancellation Policy</FrontCard.Title>
                            <div className="text-sm text-front-primary">
                                Only cancellations made up to 72 hours before the reservation time will be refunded.
                            </div>
                        </FrontCard>

                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="cancellation_policy_consent"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm font-normal ">
                                                I accept and declare that the prepayment amount will not be refunded to me in case of no-show, except for cancellations made less than 72 hours before the reservation time and in cases of force majeure.
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="preliminary_form_consent"
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
                                                I have read and approved the{" "}
                                                <a href="#" className="underline">
                                                    Preliminary Information Form
                                                </a>
                                                .
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="distance_sales_consent"
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
                                                I have read and approved the{" "}
                                                <a href="#" className="underline">
                                                    Distance Sales Agreement
                                                </a>
                                                .
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            loading={isCreatingPayment}
                            type="submit" className="w-full">
                            Start Prepayment (3D)
                        </Button>
                    </form>
                </Form>
                {threeDSContent && <ThreeDModal
                    threeDSContent={threeDSContent}
                    isOpen={isThreeDModalOpen}
                    setIsOpen={onChangeModal}
                    onMessage={onMessageFromThreeDModal}
                />}
            </FrontMaxWidthWrapper>
        </div>
    );
}