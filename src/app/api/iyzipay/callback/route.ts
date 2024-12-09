import { env } from "@/env";
import { IYZIPAY } from "@/server/layer/entities/iyzipay";
import { reservationUseCases } from "@/server/layer/use-cases/reservation";
import { NextRequest, NextResponse } from "next/server";

export type TPaymentResult = {
  status: "success" | "error"
  from: "iyzipay"
}

export async function POST(req: NextRequest) {

  console.log(env.IYZIPAY_CALLBACK_URL, 'callback url')
  // Get raw text body
  const rawBody = await req.text();
  console.log('Raw body:', rawBody);

  // Parse URL-encoded data
  const formData = new URLSearchParams(rawBody);
  const paymentData = {
    status: formData.get('status'),
    paymentId: formData.get('paymentId'),
    conversationData: formData.get('conversationData'),
    conversationId: formData.get('conversationId'),
    mdStatus: formData.get('mdStatus'),
    signature: formData.get('signature')
  };

  const result = {
    from: 'iyzipay'
  } as TPaymentResult

  if (paymentData.status === 'success') {

    try {
      const treedresult = await new Promise((resolve, reject) => {
        IYZIPAY.threedsPayment.create({
          paymentId: paymentData.paymentId,
        } as any, function (err, result) {
          resolve(result);
        });
      });
      result.status = 'success'
    } catch (error) {
      console.log(error, 'error')
      result.status = 'error'
    }

    console.log(result, 'result')



  } else {
    result.status = 'error'
  }

  if (result.status === "success") {
    const result = await reservationUseCases.handleSuccessPrepaymentPublicReservation({
      reservationId: Number(paymentData.conversationId)
    })

  } else {
    result.status = 'error'
  }




  const jsonResult = JSON.stringify(result)

  console.log(jsonResult, 'jsonResult')

  const response = new NextResponse(`
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Iframe Sayfası</title>
</head>

<body>
    <div id="receivedMessage">Mesaj Bekleniyor...</div>
    <script>
        // React'ten gelen mesajı dinle
        const jsonResult = '${jsonResult}';

        document.addEventListener("DOMContentLoaded", () => {
            const data = JSON.parse(jsonResult);
            window.parent.postMessage(data, "*");
        });

    </script>
</body>

</html>
    
    `);

  // There is no content-type by default!
  response.headers.set('Content-Type', 'text/html; charset=utf-8');

  // set response headers, cookies, etc, if desired
  return response;
}
