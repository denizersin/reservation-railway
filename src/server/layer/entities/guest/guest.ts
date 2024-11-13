import { db } from "@/server/db";
import { tblReservation } from "@/server/db/schema";
import { tblGuest, tblGuestTags, tblGusetCompany, TGuest, TGuestInsert, TGusetCompanyInsert } from "@/server/db/schema/guest";
import { TPagination } from "@/server/types/types";
import TGuestValidator from "@/shared/validators/guest";
import { and, desc, eq, like } from "drizzle-orm";



export const createGuest = async ({ guestData }: {
    guestData: TGuestInsert
}) => {
    const { tagIds, ..._guestData } = guestData;

    const [result] = await db.insert(tblGuest).values(_guestData).$returningId();

    if (tagIds.length > 0) {
        await db.insert(tblGuestTags).values(tagIds.map(tagId => ({ guestId: result?.id!, tagId })));
    }

};



export const updateGuest = async ({ id, guestData }: {
    id: number,
    guestData: Partial<TGuestInsert>
}) => {
    const { tagIds, ..._guestData } = guestData;
    await db.update(tblGuest).set(_guestData).where(eq(tblGuest.id, id));

    if (tagIds && tagIds.length > 0) {
        await db.delete(tblGuestTags).where(eq(tblGuestTags.guestId, id));
        await db.insert(tblGuestTags).values(tagIds.map(tagId => ({ guestId: id, tagId })));
    } else if (tagIds && tagIds.length === 0) {
        await db.delete(tblGuestTags).where(eq(tblGuestTags.guestId, id));
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