import { db } from "@/server/db";
import { tblRestaurantReview, tblRestaurantReviewTranslation, TRestaurantReview, TRestaurantReviewSettings, TRestaurantReviewWithTranslationsInsert, TRestaurantReviewWithTranslationsUpdate } from "@/server/db/schema/restaurant-setting/review-settings";
import { tblRestaurantReviewSettings } from "@/server/db/schema/restaurant-setting/review-settings";
import { and, desc, eq } from "drizzle-orm";

export const updateReviewSettings = async ({ reviewSettingId, reviewSetting }: { reviewSettingId: number, reviewSetting: Partial<TRestaurantReviewSettings> }) => {
    await db.update(tblRestaurantReviewSettings).set(reviewSetting).where(eq(tblRestaurantReviewSettings.id, reviewSettingId))
}

export const getRestaurantReviewSettings = async ({ restaurantId }: { restaurantId: number }) => {
    const reviewSettings = await db.query.tblRestaurantReviewSettings.findFirst({ where: eq(tblRestaurantReviewSettings.restaurantId, restaurantId) })
    if (!reviewSettings) {
        throw new Error("Review settings not found")
    }
    return reviewSettings
}

export const getAllReviews = async ({ restaurantId }: { restaurantId: number }) => {
    const reviews = await db.query.tblRestaurantReview.findMany({
        where: and(
            eq(tblRestaurantReview.restaurantId, restaurantId),
        ),
        with: {
            translations: true
        }
    })
    return reviews
}

export const getActiveReviewsByLanguage = async ({ languageId, restaurantId }: { languageId: number, restaurantId: number }) => {
    const reviews = await db.query.tblRestaurantReview.findMany({
        where: and(
            eq(tblRestaurantReview.restaurantId, restaurantId),
            eq(tblRestaurantReview.isActive, true)
        ),
        orderBy: [desc(tblRestaurantReview.order)],
        with: {
            translations: {
                where: eq(tblRestaurantReviewTranslation.languageId, languageId)
            }
        }
    })
    return reviews
}

export const getAllReviewsByLanguage = async ({ languageId, restaurantId }: { languageId: number, restaurantId: number }) => {
    const reviews = await db.query.tblRestaurantReview.findMany({
        where: and(
            eq(tblRestaurantReview.restaurantId, restaurantId),
        ),
        orderBy: [desc(tblRestaurantReview.order)],
        with: {
            translations: {
                where: eq(tblRestaurantReviewTranslation.languageId, languageId)
            }
        }
    })
    return reviews
}


// export const updateReview = async ({ id, review }: { id: number, review: Partial<TRestaurantReview> }) => {
//     await db.update(tblRestaurantReview).set(review).where(eq(tblRestaurantReview.id, id))
// }



// export const updateReviewTranslations = async ({ id, translations }: TRestaurantReviewWithTranslationsUpdate) => {

//     if (translations.length === 0) return

//     await db.delete(tblRestaurantReviewTranslation).where(eq(tblRestaurantReviewTranslation.restaurantReviewId, id))
//     await db.insert(tblRestaurantReviewTranslation).values(translations.map(translation => ({
//         ...translation,
//         restaurantReviewId: id
//     })))
// }

export const deleteReview = async ({ id }: { id: number }) => {
    await db.delete(tblRestaurantReview).where(eq(tblRestaurantReview.id, id))
}

export const createReview = async ({ review, translations }:
    TRestaurantReviewWithTranslationsInsert
) => {
    const reviewId = await db.insert(tblRestaurantReview).values(review).$returningId()
    await db.insert(tblRestaurantReviewTranslation).values(translations.map(translation => ({
        ...translation,
        restaurantReviewId: reviewId?.[0]?.id!
    })))
}


export const updateReview = async ({ id, data }: {
    id: number,
    data: TRestaurantReviewWithTranslationsUpdate
}) => {
    const { review, translations } = data
    await db.update(tblRestaurantReview).set(review).where(eq(tblRestaurantReview.id, id))
    await db.delete(tblRestaurantReviewTranslation).where(eq(tblRestaurantReviewTranslation.restaurantReviewId, id))
    await db.insert(tblRestaurantReviewTranslation).values(translations.map(translation => ({
        ...translation,
        restaurantReviewId: id
    })))
}


