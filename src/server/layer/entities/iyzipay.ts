import { env } from "@/env";
import Iyzipay, { BASKET_ITEM_TYPE, LOCALE } from "iyzipay";

export const IYZIPAY = new Iyzipay({
    apiKey: env.IYZIPAY_API_KEY,
    secretKey: env.IYZIPAY_SECRET_KEY,
    uri: env.IYZIPAY_URI,
});

// export const IYZIPAY = {}