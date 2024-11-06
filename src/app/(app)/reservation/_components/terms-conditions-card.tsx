import { FrontCard } from "@/components/custom/front/card"

export const TermsConditionsCard = () => {
    return <FrontCard>
        <FrontCard.Title>Terms & Conditions</FrontCard.Title>
        <div className="text-sm text-gray-500 mt-5">
            <div className=" text-front-primary">Kindly READ and follow the steps below:</div>
            <div className="my-4 mt-2">
                <div className="font-medium mb-1 text-front-primary">Booking & Payment Policy:</div>
                <div className="leading-loose">
                    TURK Fatih Tutak tasting menu experience is priced at 9900TL/per guest. A 12% service charge is added to all food and beverage items.
                    To secure your booking a pre-payment of 4.900TL per person is required within 24 hours. The pre-payment received via online reservation will be deducted from your bill at the restaurant.
                </div>
            </div>
            <div className="my-4">
                <div className="font-medium mb-1 text-front-primary">Special Dietaries Policy:</div>
                <div className="leading-loose">
                    Due to our daily micro seasonal changes, we are NOT able to accommodate Vegan, Lactose intolerances and/or Gluten allergies. Any other dietary restrictions need to be informed in advance during the booking process or via e-mail at info@turkt.com for further confirmation.
                </div>
            </div>
            <div className="my-4">
                <div className="font-medium mb-1 text-front-primary">Restaurant Concept:</div>
                <div className="leading-loose">
                    Chef Signature Tasting Menu consists of 12 courses and other surprises (Slow Dining 3 hours). À la carte options are not available.
                </div>
            </div>
            <div className="my-4">
                <div className="font-medium mb-1 text-front-primary">Child's Policy:</div>
                <div className="leading-loose">
                    TURK accommodates children 12 years of age and above. Kids menu is not available.
                    <div>
                        Valet parking available
                    </div>
                </div>
            </div>

            <div className="my-4">
                <div className="font-medium mb-1 text-front-primary">Cancellation Policy:</div>
                <div className="leading-loose">
                    Cancellations made 72 hours (or less) before the reservation date, or no-shows, will not be eligible for a refund of the deposit previously made. Cancellations made 72 hours (or more) before the reservation date will receive a full refund of the respective deposit.
                </div>
            </div>
        </div>
    </FrontCard>
}