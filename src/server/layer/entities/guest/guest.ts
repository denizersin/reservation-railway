import { db } from "@/server/db";
import { tblCountry, tblLanguage, tblReservation, TCountry, TLanguage } from "@/server/db/schema";
import { tblGuest, tblGuestTag, tblGusetCompany, TGuest, TGuestInsert, TGuestTag, TGusetCompany, TGusetCompanyInsert } from "@/server/db/schema/guest";
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
export const createGuestCompany = async ({ companyName, restaurantId }: {
    companyName: string,
    restaurantId: number
}) => {
    const [result] = await db.insert(tblGusetCompany).values({ companyName, restaurantId })
    return result;
};


export const getGuestCompanies = async ({ restaurantId }: { restaurantId: number }) => {
    const result = await db.select().from(tblGusetCompany).where(eq(tblGusetCompany.restaurantId, restaurantId));
    return result;
};






export const getAllGuests = async ({
    page, limit, name, email
}: TGuestValidator.getAllGuestsValidatorSchema):
    Promise<TPagination<TGuest>> => {

    const offset = (page - 1) * limit;

    const whereConditions = [];
    if (name) {
        whereConditions.push(like(tblGuest.name, `%${name}%`))
    }
    if (email) {
        whereConditions.push(like(tblGuest.email, `%${email}%`))
    }
    // if (role) {
    //     whereConditions.push(eq(tblGuest.role, role))
    // }

    let query = db.query.tblGuest.findMany({
        with: { tags: true, country: true, language: true, company: true },
        where: and(...whereConditions),
        limit,
        offset: (page - 1) * limit,
        orderBy: desc(tblGuest.id)
    });

    const countQuery = db.query.tblGuest.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    });
    const totalCount = await countQuery.execute().then(res => res.length);

    const guests = await query;
    return {
        data: guests,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    };
}

//info query




export const guestsPagination = async ({
    page, limit, search, name, email, surname, phone, companyId, countryId, languageId, vipLevel, isVip, isContactAssistant
}: TGuestValidator.GuestsPaginationValidatorSchema): Promise<TPagination<TGuest>> => {


    const whereConditions = [];

    if (name) {
        whereConditions.push(like(tblGuest.name, `%${name}%`))
    }
    if (email) {
        whereConditions.push(like(tblGuest.email, `%${email}%`))
    }
    if (surname) {
        whereConditions.push(like(tblGuest.surname, `%${surname}%`))
    }
    if (phone) {
        whereConditions.push(like(tblGuest.phone, `%${phone}%`))
    }
    if (companyId) {
        whereConditions.push(eq(tblGuest.companyId, companyId))
    }
    if (countryId) {
        whereConditions.push(eq(tblGuest.countryId, countryId))
    }
    if (languageId) {
        whereConditions.push(eq(tblGuest.languageId, languageId))
    }
    if (vipLevel) {
        whereConditions.push(eq(tblGuest.vipLevel, vipLevel))
    }
    if (isVip) {
        whereConditions.push(eq(tblGuest.isVip, isVip))
    }
    if (isContactAssistant) {
        whereConditions.push(eq(tblGuest.isContactAssistant, isContactAssistant))
    }
    const orConditions: SQL<unknown>[] = []
    if (search) {
        orConditions.push(like(tblGuest.name, `%${search}%`))
        orConditions.push(like(tblGuest.email, `%${search}%`))
        orConditions.push(like(tblGuest.phone, `%${search}%`))
    }

    function generateQueryWithoutPagination(whereConditions: SQL<unknown>[]) {
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
            .where(or(
                and(...whereConditions),
                or(...orConditions)
            ))
    }

    const query = generateQueryWithoutPagination(whereConditions)
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(desc(tblGuest.id));

    const result = await query;

    const totalCount = await generateQueryWithoutPagination(whereConditions).execute().then(res => res.length);

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

function mapOneToMany<OneKey extends string, ManyKey extends string>(oneKey: OneKey, manyKey: ManyKey) {
    return <
        One extends Record<string, unknown>,
        Many extends Record<string, unknown>,
        T extends (Record<OneKey, One> & Record<ManyKey, Many>)[]
    >(result: T): T[number][OneKey] & Record<ManyKey, T[number][ManyKey][]> => {
        const one = result[0]?.[oneKey];
        const many = result.map((row) => row[manyKey]);
        const mapped: Record<string, unknown> = one || {};
        mapped[manyKey] = many;
        return mapped as any;
    }
}


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