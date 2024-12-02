import { NextRequest, NextResponse } from "next/server";
import Iyzipay from "../../../../node_modules/iyzipay/lib/Iyzipay.js"


export async function GET(req: NextRequest) {

    const iyzipay = new Iyzipay({
        apiKey: 'your-api-key',
        secretKey: 'your-secret-key',
        uri: 'https://sandbox-api.iyzipay.com',
    });


    return NextResponse.json({ message: 'Hello, world!' });
}


// export async function OPTIONS(request: NextRequest) {
//     return new NextResponse(null, {
//         status: 204,
//         headers: {
//             'Access-Control-Allow-Origin': '',
//             'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//             'Access-Control-Allow-Headers': 'Content-Type, Authorization'
//         },
//     })
// }