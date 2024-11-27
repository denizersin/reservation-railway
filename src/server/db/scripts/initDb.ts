import { env } from "@/env";
import { getEnumValues } from "@/server/utils/server-utils";
import { EnumMealNumeric, EnumMeals, EnumReservationExistanceStatus, EnumReservationExistanceStatusNumeric, EnumReservationPrepaymentNumeric, EnumReservationPrepaymentType, EnumReservationStatus, EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { exit } from "process";
import * as schema from "../schema";
import { tblCountry, tblLanguage, tblMeal } from "../schema/predefined";
import { predefinedData } from "@/server/data/db/predefined";
import { HOLDING_RESERVATION_GUEST_ID } from "@/server/utils/server-constants";
const connection = await mysql.createConnection({
    uri: env.DATABASE_URL,
});

const db = drizzle(connection, {
    schema,
    mode: 'default',
});

const initFunctions = [
    async function createPredefinedData() {
        //meal
        await Promise.all(
            Object.values(EnumMeals).map(async (meal) => {
                await db.insert(tblMeal).values({
                    name: meal,
                    id: EnumMealNumeric[meal]
                })
            })
        )

        await db.insert(tblCountry).values(predefinedData.countries)
        await db.insert(tblLanguage).values(predefinedData.languages)

        await Promise.all(
            getEnumValues(EnumReservationStatus).map(async (status) => {
                await db.insert(schema.tblReserVationStatus).values({
                    status: status,
                    id: EnumReservationStatusNumeric[status]
                })
            })
        )

        await Promise.all(
            getEnumValues(EnumReservationExistanceStatus).map(async (status) => {
                await db.insert(schema.tblReservationExistanceStatus).values({
                    status: status,
                    id: EnumReservationExistanceStatusNumeric[status]
                })
            })
        )

        await Promise.all(
            getEnumValues(EnumReservationPrepaymentType).map(async (status) => {
                await db.insert(schema.tblReservationPrepaymentType).values({
                    type: status,
                    id: EnumReservationPrepaymentNumeric[status]
                })
            })
        )

        await db.insert(schema.tblGuest).values({
            id: HOLDING_RESERVATION_GUEST_ID,
            name: 'Holding',
            email: 'holding@example.com',
            phone: '1234567890',
            languageId: 1,
            phoneCodeId: 1,
            restaurantId: 1,
            surname: 'Reservation',
        })




    },
].filter(Boolean)

async function initDb() {
    try {
        //seed data
        for (const func of initFunctions) {
            await func()
        }

        console.log('initlaiozon end')
    }
    catch (error) {
        console.error('Error initializing database:', error)
    }
    finally {
        await connection.end()
        exit()
    }
}

initDb()