import { db } from "@/server/db";
import { tblCountry, tblLanguage, tblReservation, TCountry, TLanguage } from "@/server/db/schema";
import { tblGuest, tblGuestTag, tblGusetCompany, TGuest, TGuestInsert, TGuestTag, TGuestCompany, TGuestCompanyInsert } from "@/server/db/schema/guest";
import { TPagination } from "@/server/types/types";
import TGuestValidator from "@/shared/validators/guest";
import { and, desc, eq, like, or, SQL } from "drizzle-orm";
import { record } from "zod";



export const createGuest = async ({ guestData }: {
    guestData: TGuestInsert
}) => {
    const { tagIds, ..._guestData } = guestData;

    const [result] = await db.insert(tblGuest).values(_guestData).$returningId();

    if (tagIds.length > 0) {
        await db.insert(tblGuestTag).values(tagIds.map(tagId => ({ guestId: result?.id!, tagId })));
    }

    if (!result) throw new Error('Guest not created')
    return result.id

};



export const updateGuest = async ({ id, guestData }: {
    id: number,
    guestData: Partial<TGuestInsert>
}) => {
    const { tagIds, ..._guestData } = guestData;
    await db.update(tblGuest).set(_guestData).where(eq(tblGuest.id, id));

    if (tagIds && tagIds.length > 0) {
        await db.delete(tblGuestTag).where(eq(tblGuestTag.guestId, id));
        await db.insert(tblGuestTag).values(tagIds.map(tagId => ({ guestId: id, tagId })));
    } else if (tagIds && tagIds.length === 0) {
        await db.delete(tblGuestTag).where(eq(tblGuestTag.guestId, id));
    }

};



export const deleteGuestById = async ({ id }: { id: number }) => {
    await db.delete(tblGuest).where(eq(tblGuest.id, id));
};


// create guset company with companyName
export const createGuestCompany = async ({ data }: { data: TGuestCompanyInsert }) => {
    const [result] = await db.insert(tblGusetCompany).values(data).$returningId();
    if (!result) throw new Error('Guest company not created')
    return result;
};

export const updateGuestCompany = async ({ id, data }: { id: number, data: Partial<TGuestCompanyInsert> }) => {
    await db.update(tblGusetCompany).set(data).where(eq(tblGusetCompany.id, id));
};

export const deleteGuestCompany = async ({ id }: { id: number }) => {
    await db.delete(tblGusetCompany).where(eq(tblGusetCompany.id, id));
};








//info query




export const guestsPagination = async ({
    restaurantId,
    paginationQuery
}: {
    restaurantId: number,
    paginationQuery: TGuestValidator.GuestsPaginationSchema
}): Promise<TPagination<TGuest>> => {

    const { name, email, surname, phone, companyId, countryId, languageId, vipLevel, isVip, isContactAssistant, guestId } = paginationQuery.filters;
    const { page, limit } = paginationQuery.pagination;
    const { global_search } = paginationQuery;


    const andConditions: SQL<unknown>[] = [];
    if (name) {
        andConditions.push(like(tblGuest.name, `%${name}%`))
    }
    if (email) {
        andConditions.push(like(tblGuest.email, `%${email}%`))
    }
    if (surname) {
        andConditions.push(like(tblGuest.surname, `%${surname}%`))
    }
    if (phone) {
        andConditions.push(like(tblGuest.phone, `%${phone}%`))
    }
    if (companyId) {
        andConditions.push(eq(tblGuest.companyId, companyId))
    }
    if (countryId) {
        andConditions.push(eq(tblGuest.countryId, countryId))
    }
    if (languageId) {
        andConditions.push(eq(tblGuest.languageId, languageId))
    }
    if (vipLevel) {
        andConditions.push(eq(tblGuest.vipLevel, vipLevel))
    }
    if (isVip) {
        andConditions.push(eq(tblGuest.isVip, isVip))
    }
    if (isContactAssistant) {
        andConditions.push(eq(tblGuest.isContactAssistant, isContactAssistant))
    }

    if (guestId) {
        andConditions.push(eq(tblGuest.id, guestId))
    }

    const orConditions: SQL<unknown>[] = []
    if (global_search) {
        orConditions.push(like(tblGuest.name, `%${global_search}%`))
        orConditions.push(like(tblGuest.email, `%${global_search}%`))
        orConditions.push(like(tblGuest.phone, `%${global_search}%`))
    }

    const whereCondition: SQL<unknown> | undefined = and(
        eq(tblGuest.restaurantId, restaurantId),
        andConditions.length > 0 ? and(...andConditions) : undefined,
        orConditions.length > 0 ? or(...orConditions) : undefined
    )

    function generateQueryWithoutPagination(whereCondition: SQL<unknown> | undefined) {
        return db.select({
            guest: tblGuest,
            company: tblGusetCompany,
            country: tblCountry,
            language: tblLanguage,
            tag: tblGuestTag
        })
            .from(tblGuest)
            .leftJoin(tblGuestTag, eq(tblGuest.id, tblGuestTag.guestId))
            .leftJoin(tblGusetCompany, eq(tblGuest.companyId, tblGusetCompany.id))
            .leftJoin(tblCountry, eq(tblGuest.countryId, tblCountry.id))
            .leftJoin(tblLanguage, eq(tblGuest.languageId, tblLanguage.id))
            .where(whereCondition)
    }

    const query = generateQueryWithoutPagination(whereCondition)
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(desc(tblGuest.id));

    const result = await query;

    const totalCount = await generateQueryWithoutPagination(whereCondition).execute().then(res => res.length);

    // More efficient grouping using a Map
    const guestMap = new Map<number, TGuest>();

    result.forEach(row => {

        const guest = guestMap.get(row.guest.id);

        if (!guest) {
            guestMap.set(row.guest.id, {
                ...row.guest,
                tags: [],
                company: row.company,
                country: row.country!,
                language: row.language!,
            });
        }
        if (guest && row.tag) {
            guest.tags.push(row.tag);
        }
    });

    const guests = Array.from(guestMap.values());

    // const totalCount = 

    return {
        data: guests,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    }
}

export const getGuestCompaniesPagination = async ({
    restaurantId,
    paginationQuery,
}: {
    restaurantId: number,
    paginationQuery: TGuestValidator.GuestCompanyPaginationSchema
}): Promise<TPagination<TGuestCompany>> => {

    const { global_search, pagination: { page, limit } } = paginationQuery
    const orConditions: SQL<unknown>[] = [];

    if (global_search) {
        orConditions.push(like(tblGusetCompany.companyName, `%${global_search}%`))
        orConditions.push(like(tblGusetCompany.email, `%${global_search}%`))
        orConditions.push(like(tblGusetCompany.phone, `%${global_search}%`))
    }

    const whereCondition: SQL<unknown> | undefined = and(
        eq(tblGusetCompany.restaurantId, restaurantId),
        orConditions.length > 0 ? or(...orConditions) : undefined
    )

    function generateQueryWithoutPagination(whereCondition: SQL<unknown> | undefined) {
        return db.select().from(tblGusetCompany).where(whereCondition)
    }

    const query = generateQueryWithoutPagination(whereCondition)
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(desc(tblGusetCompany.id));

    const totalCount = await generateQueryWithoutPagination(whereCondition).execute().then(res => res.length);

    const result = await query;


    return {
        data: result,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    }
};





export const getGuestById = async ({ guestId }: { guestId: number }) => {
    const [result] = await db.select().from(tblGuest).where(eq(tblGuest.id, guestId));
    if (!result) throw new Error('Guest not found')
    return result;
}




export const getGuestDetail = async ({ guestId }: { guestId: number }) => {
    const guest = await db.query.tblGuest.findFirst({
        with: {
            tags: true,
            country: true,
            language: true,
            company: true,

        },
        where: eq(tblGuest.id, guestId)
    })

    const guestReservations = await db.query.tblReservation.findMany({
        with: {
            reservationStatus: true,
        },
        where: eq(tblReservation.guestId, guestId)
    })



    return { guest, guestReservations }
}


export const getGuestByPhoneAndEmail = async ({ phone, email, phoneCode }: { phone: string, email: string, phoneCode: string }) => {
    const [result] = await db.select().from(tblGuest).where(and(eq(tblGuest.phone, phone), eq(tblGuest.email, email), eq(tblGuest.phoneCode, phoneCode)));
    return result;
}