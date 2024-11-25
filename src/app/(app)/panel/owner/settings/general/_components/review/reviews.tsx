import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReviewsList } from "./reviews-list"
import { ReviewSettings } from "./review-settings"

export const Reviews = () => {
    return <Card>
        <CardHeader>
            <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>   
            <ReviewSettings />
            <ReviewsList />
        </CardContent>
    </Card>
}