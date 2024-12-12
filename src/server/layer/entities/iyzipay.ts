
import { env } from "@/env";
import Iyzipay, { BASKET_ITEM_TYPE, LOCALE } from "iyzipay";



console.log(env.IYZIPAY_API_KEY, env.IYZIPAY_SECRET_KEY, env.IYZIPAY_URI)
console.log(process.env.IYZIPAY_API_KEY, process.env.IYZIPAY_SECRET_KEY, process.env.IYZIPAY_URI)

export const IYZIPAY = new Iyzipay({
    apiKey: env.IYZIPAY_API_KEY,
    secretKey: env.IYZIPAY_SECRET_KEY,
    uri: env.IYZIPAY_URI,
});




// export const IYZIPAY = {}