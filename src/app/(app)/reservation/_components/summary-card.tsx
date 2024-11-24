import { FrontCard } from "@/components/custom/front/card"
import { IconCalendar, IconClock, IconGuests, IconLocation, IconTable, IconWallet } from "@/components/svgs";
import { cn } from "@/lib/utils";

export const SummaryCard = ({
    guestCount,
    area,
    date,
    time,
    prepaymentAmount,
    className
}: {
    guestCount: number,
    area: string,
    date: Date,
    time: string,
    prepaymentAmount?: number,
    className?: string
}) => {
    return <FrontCard className={cn("bg-gray-50 ", className)}  >
        <FrontCard.Title>Summary</FrontCard.Title>

        <div className="flex flex-col gap-y-1">


            {/* location */}
            <div className="flex items-center">
                <IconLocation className="size-5 mr-2 text-front-primary" />
                <div className="text-sm text-front-primary">TURK FATIH TUTAK</div>
            </div>

            {/* date */}
            <div className="flex items-center">
                <IconCalendar className="size-5 mr-2 text-front-primary" />
                <div className="text-sm text-front-primary">{date?.toLocaleDateString()}</div>
            </div>

            {/* time */}
            <div className="flex items-center">
                <IconClock className="size-5 mr-2 text-front-primary" />
                <div className="text-sm text-front-primary">{time}</div>
            </div>
            {/* table */}
            <div className="flex items-center">
                <IconTable className="size-5 mr-2 text-front-primary" />
                <div className="text-sm text-front-primary">{area}</div>
            </div>
            {/* guests */}
            <div className="flex items-center">
                <IconGuests className="size-5 mr-2 text-front-primary" />
                <div className="text-sm text-front-primary">{guestCount} Guests</div>
            </div>


            {prepaymentAmount && <div className="flex items-center">
                <IconWallet className="size-5 mr-2 text-front-primary" />
                <div className="text-sm text-front-primary">{prepaymentAmount} TL</div>
            </div>}

        </div>

    </FrontCard>
}