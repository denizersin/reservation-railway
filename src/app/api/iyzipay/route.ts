// import { NextRequest, NextResponse } from "next/server";
// import Iyzipay from "iyzipay"
// import { env } from "@/env";


// export async function GET(req: NextRequest) {

//     const iyzipay = new Iyzipay({
//         apiKey: env.IYZIPAY_API_KEY,
//         secretKey: env.IYZIPAY_SECRET_KEY,
//         uri: 'https://sandbox-api.iyzipay.com',
//     });

//     var request = {
//         "locale": "en",
//         "price": "3.2",
//         "paidPrice": "3.2",
//         "installment": 1,
//         "paymentChannel": "WEB",
//         "basketId": "B67832",
//         "paymentGroup": "PRODUCT",
//         "paymentCard": {
//             "cardHolderName": "Dev iyzico",
//             cardNumber: '5528790000000008',
//             expireMonth: '12',
//             expireYear: '2030',
//             cvc: '123',
//         },
//         "buyer": {
//             "id": "BY789",
//             "name": "John",
//             "surname": "Doe",
//             "identityNumber": "74300864791",
//             "email": "email@email.com",
//             "gsmNumber": "+905350000000",
//             "registrationDate": "2013-04-21 15:12:09",
//             "lastLoginDate": "2015-10-05 12:43:35",
//             "registrationAddress": "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
//             "city": "Istanbul",
//             "country": "Turkey",
//             "zipCode": "34732",
//             "ip": "85.34.78.112"
//         },
//         "conversationId": "deviyzico",
//         "shippingAddress": {
//             "address": "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
//             "zipCode": "34742",
//             "contactName": "Jane Doe",
//             "city": "Istanbul",
//             "country": "Turkey"
//         },
//         "billingAddress": {
//             "address": "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
//             "zipCode": "34742",
//             "contactName": "Jane Doe",
//             "city": "Istanbul",
//             "country": "Turkey"
//         },
//         "basketItems": [
//             {
//                 "id": "BI101",
//                 "price": "1.1",
//                 "name": "Binocular",
//                 "category1": "Collectibles",
//                 "category2": "Accessories",
//                 "itemType": "PHYSICAL"
//             },
//             {
//                 "id": "BI1012",
//                 "price": "2.1",
//                 "name": "Binocular",
//                 "category1": "Collectibles",
//                 "category2": "Accessories",
//                 "itemType": "PHYSICAL"
//             }
//         ],
//         "currency": "TRY",
//         "callbackUrl": env.IYZIPAY_CALLBACK_URL
//     }
//     const result = await new Promise((resolve, reject) => {
//         iyzipay.threedsInitialize.create(request as any, function (err, result) {
//             console.log(err, result);
//             resolve(result);
//         });
//     });


//     return NextResponse.json(result);
// }


// // export async function OPTIONS(request: NextRequest) {
// //     return new NextResponse(null, {
// //         status: 204,
// //         headers: {
// //             'Access-Control-Allow-Origin': '',
// //             'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
// //             'Access-Control-Allow-Headers': 'Content-Type, Authorization'
// //         },
// //     })
// // }