import { clientProcedure } from "../trpc";

import { env } from "@/env";
import Iyzipay, { BASKET_ITEM_TYPE, LOCALE } from "iyzipay";
import { z } from "zod";
import { createTRPCRouter } from "../trpc";
import { reservationUseCases } from "@/server/layer/use-cases/reservation";
export const iyzipay = new Iyzipay({
    apiKey: env.IYZIPAY_API_KEY,
    secretKey: env.IYZIPAY_SECRET_KEY,
    uri: env.IYZIPAY_URI,
});

export const paymentRouter = createTRPCRouter({
    createPayment: clientProcedure.input(z.object({
        reservationId: z.number(),
    })).mutation(async ({ input }) => {

        type TPaymentData = Omit<Parameters<typeof iyzipay.threedsInitialize.create>[0], 'shippingAddress'>
        type TResult = {
            status: string,
            locale: string,
            systemTime: number,
            conversationId: string,
            threeDSHtmlContent: string,
            paymentId: string,
            signature: string
        }
        var request: TPaymentData = {
            "locale": LOCALE.EN,
            "price": "1.1",
            "paidPrice": "1.1",
            installments:1,
            "paymentChannel": "WEB",
            "basketId": "B67832",
            "paymentGroup": "PRODUCT",
            "paymentCard": {
                "cardHolderName": "Dev iyzico",
                cardNumber: '5528790000000008',
                expireMonth: '12',
                expireYear: '2030',
                cvc: '123',
                cardAlias: '1234567890',
                
            },
            "buyer": {
                "id": "BY789",
                "name": "John",
                "surname": "Doe",
                "identityNumber": "74300864791",
                "email": "email@email.com",
                "city": "Istanbul",
                "country": "Turkey",
                "ip": "85.34.78.112",
                "registrationAddress": "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",

                // optional
                // "gsmNumber": "+905350000000",
                // "registrationDate": "2013-04-21 15:12:09",
                // "lastLoginDate": "2015-10-05 12:43:35",
                // "zipCode": "34732",
            },
            "conversationId": "deviyzico",

            //required
            "billingAddress": {
                "address": "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
                "zipCode": "34742",
                "contactName": "Jane Doe",
                "city": "Istanbul",
                "country": "Turkey"
            },
            "basketItems": [
                {
                    "id": "BI101",
                    "price": "1.1",
                    "name": "Binocular",
                    "category1": "Collectibles",
                    "itemType": BASKET_ITEM_TYPE.VIRTUAL,
                    // optional
                    // "category2": "Accessories",
                },
            ],
            "currency": "TRY",
            "callbackUrl": env.IYZIPAY_CALLBACK_URL
        }
        
        const result: TResult = await new Promise((resolve, reject) => {
            iyzipay.threedsInitialize.create(request as any, function (err, result) {
                console.log(err, result);
                resolve(result as TResult);
            });
        });

        if(result.status==="success"){
            const result = await reservationUseCases.handleSuccessPrepaymentPublicReservation({
                reservationId: input.reservationId
            })

        }else{
            throw new Error("Payment failed");
        }
        
    
        return result

    }),
});