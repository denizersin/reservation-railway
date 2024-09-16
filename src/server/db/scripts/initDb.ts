import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { schema } from "../schema";
import { env } from "@/env";
import { eq } from "drizzle-orm";
import { EnumDays, EnumMeals, EnumReservationStatus, EnumUserRole } from "@/shared/enums/predefined-enums";
import { tblCountry, tblLanguage, tblMeal, tblReserVationStatus } from "../schema/predefined";
import { tblUser } from "../schema/user";
import { tblRestaurantTranslations, tblResturant } from "../schema/restaurant";
import { seedDatas } from "./seedData";
import { restaurantEntities } from "@/server/layer/entities/restaurant";
const connection = await mysql.createConnection({
    uri: env.DATABASE_URL,
});

const db = drizzle(connection, {
    schema,
    mode: 'default',
});

const seedFunctions = [
    async function createUsers() {
        const result_admin = await db.insert(tblUser).values({
            email: 'admin@gmail.com',
            password: 'admin',
            role: EnumUserRole.admin
        }).$returningId()
        if (result_admin[0]?.id) console.log('Admin user created')

        const result = await db.insert(tblUser).values({
            email: 'user@gmail.com',
            password: 'user',
            role: EnumUserRole.user
        }).$returningId()
        if (result[0]?.id) console.log('User created')

        const result2 = await db.insert(tblUser).values({
            email: 'owner@gmail.com',
            password: 'owner',
            role: EnumUserRole.owner
        }).$returningId()

        const result2_2 = await db.insert(tblUser).values({
            email: 'owner2@gmail.com',
            password: 'owner2',
            role: EnumUserRole.owner
        }).$returningId()

        if (result2[0]?.id) console.log('Owner2 created')
    },
    async function createPredefinedData() {
        //meal
        Object.values(EnumMeals).forEach(async (meal) => {
            await db.insert(tblMeal).values({
                name: meal,
            })
        })
        await db.insert(tblCountry).values(seedDatas.countries)
        await db.insert(tblLanguage).values(seedDatas.languages).$returningId()
        Object.values(EnumReservationStatus).forEach(async (status) => {
            await db.insert(tblReserVationStatus).values({
                status: status,
            })
        })



    },
    async function createRestaurant() {
        const owner = await db.query.tblUser.findFirst({ where: eq(tblUser.email, 'owner@gmail.com') })
        const owner2 = await db.query.tblUser.findFirst({ where: eq(tblUser.email, 'owner2@gmail.com') })


        await restaurantEntities.createRestaurant({
            restaurant: {
                ...seedDatas.restaurant[0]!,
                ownerId: owner?.id!
            }
        })

        await restaurantEntities.createRestaurant({
            restaurant: {
                ...seedDatas.restaurant[1]!,
                ownerId: owner2?.id!
            }
        })

        const kfcRestaurant = (await db.query.tblResturant.findFirst({ where: eq(tblResturant.name, 'kfc') }))
        //set owner to restaurant
        if (!kfcRestaurant) return console.error('Restaurant not found')


        await restaurantEntities.setDefaultsToRestaurant({ restaurantId: kfcRestaurant?.id! })

        console.log('restaurant created')

    }
].filter(Boolean)

async function initDb() {
    try {
        //seed data
        for (const func of seedFunctions) {
            await func()
        }
    }
    catch (error) {
        console.error('Error initializing database:', error)
    }
    finally {
        await connection.end()
    }
}

initDb()