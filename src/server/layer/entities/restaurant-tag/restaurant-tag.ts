import { db } from "@/server/db"
import { tblRestaurantTag, tblRestaurantTagTranslation, TRestaurantTagInsert, TRestaurantTagTranslationInsert } from "@/server/db/schema/restaurant-tags"
import TRestaurantTagValidator from "@/shared/validators/restaurant-tag"
import { and, eq, like } from "drizzle-orm"


export const createRestaurantTag = async ({
    translations,
    restaurantId
}: {
    restaurantId: number,
    translations: TRestaurantTagValidator.createRestaurantFormSchema['translations']
}) => {
    if (translations.length === 0) return;
    console.log('cas1')

    const [newTag] = await db.insert(tblRestaurantTag).values({
        restaurantId,

    }).$returningId()
    console.log('cas2')
    if (!newTag) {
        throw new Error('Tag not created')
    }
    const [translationId] = await db.insert(tblRestaurantTagTranslation).values(
        translations.map((t) => ({
            ...t,
            tagId: newTag.id
        }))

    ).$returningId()

}

export const deleteRestaurantTag = async ({
    tagId
}: {
    tagId: number
}) => {
    await db.delete(tblRestaurantTag).where(eq(tblRestaurantTag.id, tagId))
}

export const getRestaurantTagTranslationsById = async ({
    tagId
}: {
    tagId: number
}) => {
    const translations = await db.query.tblRestaurantTagTranslation.findMany({
        where: eq(tblRestaurantTagTranslation.tagId, tagId)
    })
    return translations
}

export const getAllRestaurantTags = async ({
    limit, page, languageId, name
}: TRestaurantTagValidator.getAllRestaurantTagsSchema) => {

    const offset = (page - 1) * limit

    const whereConditions = [];

    whereConditions.push(eq(tblRestaurantTagTranslation.languageId, languageId))

    if (name) {
        whereConditions.push(like(tblRestaurantTagTranslation.name, `%${name}%`))
    }

    let query = db.query.tblRestaurantTagTranslation.findMany({
        where: and(...whereConditions),
        limit,
        offset
    })

    const countQuery = db.query.tblRestaurantTagTranslation.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined
    })

    const totalCount = await countQuery.execute().then(res => res.length)

    const tags = await query

    return {
        data: tags,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    }

}

