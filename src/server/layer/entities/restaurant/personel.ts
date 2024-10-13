import { db } from "@/server/db"
import { tblPersonel, TPersonelInsert } from "@/server/db/schema/guest"
import { eq } from "drizzle-orm"

export const createPersonel = async ({
    personelData
}: {
    personelData: TPersonelInsert
}) => {
    await db.insert(tblPersonel).values(personelData)
}

export const deletePersonelById = async ({
    personelId
}: {
    personelId: number
}) => {
    await db.delete(tblPersonel).where(eq(tblPersonel.id, personelId))
}

export const getPersonel = async ({
    restaurantId
}: {
    restaurantId: number
}) => {
    const personel = await db.query.tblPersonel.findMany({
        where: eq(tblPersonel.restaurantId, restaurantId)
    })

    return personel
}

export const updatePersonel = async ({
    personelId,
    personelData
}: {
    personelId: number,
    personelData: Partial<TPersonelInsert>
}) => {
    await db.update(tblPersonel).set(personelData).where(eq(tblPersonel.id, personelId))
}