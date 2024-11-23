"use client";

import { useRouter } from "next/navigation";
import HeadBanner from "@/components/custom/front/head-banner";
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper";
import { Button } from "@/components/custom/button";
import { FrontCard } from "@/components/custom/front/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ReservationStatusHeader } from "../../../_components/reservation-status-header";
import { useReservationStatusContext } from "../layout";
import { api } from "@/server/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useShowLoadingModal } from "@/hooks/useShowLoadingModal";

const formSchema = z.object({
    card_number: z.string().min(16, "Card number must be 16 digits"),
    expiry_date: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Invalid expiry date (MM/YY)"),
    cvc: z.string().min(3, "CVC must be 3 digits"),
    cancellation_policy_consent: z.boolean().refine((val) => val === true, {
        message: "You must accept the cancellation policy",
    }),
    preliminary_form_consent: z.boolean().refine((val) => val === true, {
        message: "You must accept the preliminary information form",
    }),
    distance_sales_consent: z.boolean().refine((val) => val === true, {
        message: "You must accept the distance sales agreement",
    }),
})

export type TPaymentFormValues = z.infer<typeof formSchema>

export default function Page() {


    const { reservationStatusData } = useReservationStatusContext()

    const amount = reservationStatusData?.currentPrepayment?.amount

    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
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

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        // Handle payment submission
        makePrepayment({ reservationId: reservationStatusData?.id! })
    }

    const queryClient = useQueryClient()

    const {
        mutate: makePrepayment,
        isPending: isMakingPrepayment
    } = api.test.makePrepayment.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.reservation.getReservationStatusData) })
        }
    })

    useShowLoadingModal([isMakingPrepayment])


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

                <div className="info-alert p-4 text-sm text-front-primary bg-gray-100/50 rounded-md mb-6">
                    <span className="font-bold">{amount} TL</span> will be charged to your credit card to confirm your reservation.
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-front-primary ">
                        <FormField
                            control={form.control}
                            name="card_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="">Card Number</FormLabel>
                                    <FormControl>
                                        <Input
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
                                        <FormLabel>Month/Year</FormLabel>
                                        <FormControl>
                                            <Input
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
                                        <FormLabel>CVC</FormLabel>
                                        <FormControl>
                                            <Input
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
                            loading={ isMakingPrepayment}
                            type="submit" className="w-full">
                            Start Prepayment (3D)
                        </Button>
                    </form>
                </Form>
            </FrontMaxWidthWrapper>
        </div>
    );
}