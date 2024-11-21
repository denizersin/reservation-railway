import { env } from "@/env";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../../schema/index";

import { EnumGender, EnumLanguage, EnumMealNumeric, EnumReservationPrepaymentNumeric, EnumReservationPrepaymentType, EnumTheme, EnumUserRole, EnumVipLevel } from "@/shared/enums/predefined-enums";
import { guestEntities } from "@/server/layer/entities/guest";
import { and, eq } from "drizzle-orm";
import { TOwnerProcedureCtx } from "@/server/api/trpc";
import { languagesData } from "@/shared/data/predefined";
import { reservationUseCases } from "@/server/layer/use-cases/reservation";
import { getRandom } from "@/server/utils/server-utils";
import TReservationValidator from "@/shared/validators/reservation";
import { restaurantEntities } from "@/server/layer/entities/restaurant";
if (!("DATABASE_URL" in process.env))
    throw new Error("DATABASE_URL not found on .env.development");

const connection = await mysql.createConnection({
    uri: env.DATABASE_URL,
});

const db = drizzle(connection, {
    schema,
    mode: 'default',
});

const reservationCount = 20000
const guestCount = 40000

async function createReservations() {

    const guestsData = await guestEntities.guestsPagination({
        paginationQuery: {
            pagination: {
                page: 1,
                limit: 20
            },
            filters: {}
        },
        restaurantId: 1
    })

    const guests = guestsData.data


    const nonWaitingRooms = await db.query.tblRoom.findFirst({
        where: and(
            eq(schema.tblRoom.restaurantId, 1),
            eq(schema.tblRoom.isWaitingRoom, false)
        ),
    })

    const firstNonWaitingRoomId = nonWaitingRooms?.id!

    const roomTables = (await db.query.tblTable.findMany({
        where: eq(schema.tblTable.roomId, firstNonWaitingRoomId)
    }))

    const mealId = EnumMealNumeric.dinner
    const mealHours = await restaurantEntities.getMealHours({ restaurantId: 1 })
    const dinnerMealHours = mealHours.find(m => m.meal.id == mealId)?.mealHours?.map(m => m.hour)!
    console.log(dinnerMealHours, 'dinnerMealHours')
    const ownerCtx: TOwnerProcedureCtx = {
        headers: new Headers(),
        session: {
            user: {
                restaurantId: 1,
                userId: 2, //owner
                userRole: EnumUserRole.owner 
            },
        },
        userPrefrences: {
            theme: EnumTheme.light,
            language: languagesData.find(l => l.languageCode === EnumLanguage.en)!
        },
        restaurantId:1
    }


    const reservationCreateionCount = reservationCount/roomTables.length
    const firstReservationDate = new Date()

    for (let i = 0; i < reservationCreateionCount; i++) {
        const randomGuest = guests[getRandom(0, guests.length - 1)]
        const newDate = new Date(firstReservationDate)
        newDate.setDate(firstReservationDate.getDate() + i)
        const getNewDateYear = newDate.getFullYear()
        if (getNewDateYear === 2038) {
            newDate.setFullYear(2039)
        }
        const promises = roomTables.map(async (table, index) => {

            const tableId = table.id
            const hour = dinnerMealHours[getRandom(0, dinnerMealHours.length - 1)]!
            newDate.setHours(Number(hour.split(':')[0]!), Number(hour.split(':')[1]!))
            const input: TReservationValidator.createReservation = {
                data: {
                    reservationTagIds: [],
                    tableIds: [tableId],
                },
                reservationData: {
                    guestCount: getRandom(1, 4),
                    guestId: randomGuest?.id!,
                    mealId: mealId,
                    prepaymentTypeId: EnumReservationPrepaymentNumeric.none,
                    reservationDate: newDate,
                    hour: hour,
                    isSendSms: false,
                    isSendEmail: false,
                    roomId: firstNonWaitingRoomId
                }
            }

            if (i === 0) {
                console.log('first reservation')
                console.log(input)
            }

            await reservationUseCases.createReservation({
                input,
                ctx: ownerCtx
            })


        })

        await Promise.all(promises)

    }


}

async function createGuests() {

    for (let i = 300; i < guestCount; i++) {
        const createdAt = new Date()
        createdAt.setMinutes(getRandom(0, 59))
        const newGuest = await guestEntities.createGuest({
            guestData: {
                name: `Guest ${i}`,
                birthDate: new Date(),
                countryId: 1,
                email: `guest${i}@example.com`,
                gender: EnumGender.male,
                languageId: languagesData.find(a => a.languageCode === EnumLanguage.en)!.id,
                restaurantId: 1,
                surname: `Surname ${i}`,
                phone: `5331234567`,
                phoneCode: `+90`,
                tagIds: [],
                vipLevel: EnumVipLevel.goodSpender,
                isSendReviewNotifs: false,
                createdAt: createdAt
            }
        })
    }
    console.log('end')

}




async function seed() {
    await createGuests()
    console.log('end guests')
    await createReservations()
    console.log('end seed')
}

seed()