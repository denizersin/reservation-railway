"use client";
import FrontMaxWidthWrapper from "@/components/custom/front/front-max-w-wrapper";
import HeadBanner from "@/components/custom/front/head-banner";
import { useReservationStatusContext } from "../layout";
import { SummaryCard } from "../../../_components/summary-card";
import { api } from "@/server/trpc/react";
import { StarRating } from "@/components/star-rating";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { Button } from "@/components/custom/button";
import { useShowLoadingModal } from "@/hooks/useShowLoadingModal";

type Rating = {
    restaurantReviewId: number;
    rating: number;
}

export default function ReservationReviewPage() {
    const { reservationStatusData } = useReservationStatusContext();
    const { data: reviews, isLoading } = api.reservation.getActiveReviewsByLanguage.useQuery();
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [guestReview, setGuestReview] = useState<string>("");

    useEffect(() => {
        if (reviews) {
            console.log('Setting initial ratings for reviews:', reviews);

            const initialRatings = reviews.map((review) => ({
                restaurantReviewId: review.id,
                rating: 0
            }));

            console.log('Initial ratings:', initialRatings);
            setRatings(initialRatings);
        }
    }, [reviews]);

    const handleRatingChange = (index: number, value: number) => {
        console.log('handleRatingChange called with:', { index, value });

        setRatings(prev => {
            const newRatings = [...prev];
            newRatings[index] = {
                restaurantReviewId: prev[index]?.restaurantReviewId!,
                rating: value
            };
            console.log('New ratings state:', newRatings);
            return newRatings;
        });
    };

    useEffect(() => {
        console.log('Current ratings state:', ratings);
    }, [ratings]);

    const handleSubmit = () => {
        console.log('Submitted ratings:', ratings);
        makeReservationReview({
            reviewId: reservationStatusData?.reviewId!,
            data: {
                ratings,
                guestReview
            }
        });
    };

    const queryClient = useQueryClient();

    const { mutate: makeReservationReview, isPending } = api.reservation.makeReservationReview.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.reservation.getReservationStatusData) });
        }
    });


    useShowLoadingModal([isPending, isLoading])
    

    return <div>
        <HeadBanner showHoldingSection={false} />
        <FrontMaxWidthWrapper >
            <div className="mt-10"></div>
            <div className="px-2 pb-10">
                <SummaryCard
                    guestCount={reservationStatusData?.guestCount!}
                    area={reservationStatusData?.roomName!}
                    date={reservationStatusData?.reservationDate!}
                    time={reservationStatusData?.hour!}
                    prepaymentAmount={reservationStatusData?.currentPrepayment?.amount}
                />

                <div className="text-center text-front-primary font-semibold mt-5">
                    Your opinion is important to us!
                </div>
                <div className="text-center text-front-primary mb-6">
                    Please take a moment to review your experience with us.
                </div>

                <div className="flex flex-col gap-6">
                    {reviews?.map((review, index) => {

                        return (
                            <div key={review.id} className="space-y-2 flex flex-col items-center">
                                <div className="text-front-primary font-semibold ">
                                    {review.translations[0]?.title}
                                </div>
                                <div className="text-front-primary text-sm">
                                    {review.translations[0]?.description}
                                </div>
                                <StarRating
                                    name={review.id.toString()}
                                    key={review.id}  // changed from string template to just id
                                    value={ratings[index]?.rating.toString()}
                                    onRatingChange={(value) => {
                                        console.log('StarRating onChange:', {
                                            reviewId: review.id,
                                            index: index,
                                            newValue: value
                                        });
                                        handleRatingChange(index, Number(value));
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="text-front-primary font-semibold">
                        Your Review
                    </div>
                    <Textarea
                        value={guestReview}
                        onChange={(e) => setGuestReview(e.target.value)}
                    />
                </div>

                <Button
                    loading={isPending}
                    onClick={handleSubmit}
                    className="w-full bg-front-primary text-white py-2 px-4 rounded-md hover:bg-front-primary/90 mt-6"
                    disabled={isPending}
                >
                    Submit Review
                </Button>
            </div>
        </FrontMaxWidthWrapper>
    </div>
}

