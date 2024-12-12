import { clientProcedure } from "../trpc";

import { z } from "zod";
import { createTRPCRouter } from "../trpc";
import { reservationUseCases } from "@/server/layer/use-cases/reservation";
import { clientValidator } from "@/shared/validators/front/create";
import { env } from "@/env";


export const paymentRouter = createTRPCRouter({
    createPayment: clientProcedure.input(clientValidator.createPaymentSchema).mutation(async (opts) => {



        const result = await reservationUseCases.makePrepayment(opts)


        return {
            ...result,
            baseUrl: env.BASE_URL,
            callbackUrl2: env.IYZIPAY_CALLBACK_URL,
        }

    }),
});