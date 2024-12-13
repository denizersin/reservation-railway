import { db } from "@/server/db"
import { tblRestaurantTag, tblRestaurantTagTranslation, TRestaurantTag, TRestaurantTagInsert, TRestaurantTagInsretWithTranslationsInsert, TRestaurantTagTranslationInsert, TRestaurantTagWithTranslations, TRestaurantTagWithTranslationsUpdate } from "@/server/db/schema/restaurant-tags"
import { TPagination } from "@/server/types/types"
import TRestaurantTagValidator from "@/shared/validators/restaurant-tag"
import { and, eq, like } from "drizzle-orm"


export const createRestaurantTag = async ({
    tag,
    translations
}: TRestaurantTagInsretWithTranslationsInsert) => {
    if (translations.length === 0) return;
    const [newTag] = await db.insert(tblRestaurantTag).values(tag).$returningId()
    if (!newTag) {
        throw new Error('Tag not created')
    }
    if (translations.length === 0) return;
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

    const tag = await db.query.tblRestaurantTag.findFirst({
        where: eq(tblRestaurantTag.id, tagId),
        with: {
            translations: true
        }
    })

    return tag
}

export const getRestaurantTagWithTrnsById = async ({
    tagId
}: {
    tagId: number
}): Promise<TRestaurantTagWithTranslations> => {
    const tag = await db.query.tblRestaurantTag.findFirst({
        where: eq(tblRestaurantTag.id, tagId),
        with: {
            translations: true
        }
    })
    return tag!
}

export const updateRestaurantTagTranslations = async ({
    id,
    tag,
    translations
}: TRestaurantTagWithTranslationsUpdate) => {

    await db.update(tblRestaurantTag).set(tag).where(eq(tblRestaurantTag.id, id))
    await db.delete(tblRestaurantTagTranslation).where(eq(tblRestaurantTagTranslation.tagId, id))

    await db.insert(tblRestaurantTagTranslation).values(
        translations.map((t) => ({
            ...t,
            tagId: id
        }))
    )


}





export const getAllRestaurantTags2 = async ({
    limit, page, languageId, name, restaurantId
}: {
    limit: number,
    page: number,
    languageId: number,
    name?: string,
    restaurantId: number
})
    : Promise<TPagination<TRestaurantTagWithTranslations>> => {

    const offset = (page - 1) * limit;

    const whereConditions = [];
    whereConditions.push(eq(tblRestaurantTagTranslation.languageId, languageId));


    if (name) {
        whereConditions.push(like(tblRestaurantTagTranslation.name, `%${name}%`));
    }

    let query = db.query.tblRestaurantTag.findMany({
        with: {
            translations: {
                where: and(...whereConditions)
            }
        },
        limit: page === -1 ? undefined : limit,
        offset: page === -1 ? undefined : offset,
        where: eq(tblRestaurantTag.restaurantId, restaurantId)
    });

    const countQuery = db.query.tblRestaurantTag.findMany({
        with: {
            translations: {
                where: and(...whereConditions)
            }
        },
        where: eq(tblRestaurantTag.restaurantId, restaurantId)
    });

    const totalCount = await countQuery.execute().then(res => res.length);

    const tags = await query;

    return {
        data: tags,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: page === -1 ? 1 : Math.ceil(totalCount / limit)
        }
    };
}


export const updateRestaurantTag = async ({
    data,
    tagId
}: {
    data: Omit<Partial<TRestaurantTag>, 'restaurantId' | 'id'>,
    tagId: number
}) => {
    await db.update(tblRestaurantTag).set(data).where(eq(tblRestaurantTag.id, tagId))
}