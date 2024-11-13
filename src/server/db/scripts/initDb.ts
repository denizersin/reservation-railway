import { env } from "@/env";
import { restaurantEntities } from "@/server/layer/entities/restaurant";
import { getEnumValues, localHourToUtcHour } from "@/server/utils/server-utils";
import { EnumLanguage, EnumMeals, EnumReservationExistanceStatus, EnumReservationExistanceStatusNumeric, EnumReservationPrepaymentNumeric, EnumReservationPrepaymentType, EnumReservationStatus, EnumReservationStatusNumeric, EnumUserRole } from "@/shared/enums/predefined-enums";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { exit } from "process";
import * as schema from "../schema";
import { tblCountry, tblLanguage, tblMeal } from "../schema/predefined";
import { tblUser } from "../schema/user";
import { seedDatas } from "./seedData";
import { RoomEntities } from "@/server/layer/entities/room";
import { languagesData } from "@/server/data";
import { predefinedEntities } from "@/server/layer/entities/predefined";
import { restaurantTagEntities } from "@/server/layer/entities/restaurant-tag";
const connection = await mysql.createConnection({
    uri: env.DATABASE_URL,
});

const db = drizzle(connection, {
    schema,
    mode: 'default',
});

const seedFunctions = [
    async function createPredefinedData() {
        //meal
        await Promise.all(
            Object.values(EnumMeals).map(async (meal) => {
                await db.insert(tblMeal).values({
                    name: meal,
                })
            })
        )

        await db.insert(tblCountry).values(seedDatas.countries)
        await db.insert(tblLanguage).values(seedDatas.languages)

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




    },
    async function createUsers() {
        const result_admin = await db.insert(tblUser).values({
            email: 'admin@gmail.com',
            name: 'Admin',
            password: 'admin',
            role: EnumUserRole.admin
        }).$returningId()
        if (result_admin[0]?.id) console.log('Admin user created')

        const result = await db.insert(tblUser).values({
            email: 'user@gmail.com',
            name: 'User',
            password: 'user',
            role: EnumUserRole.user
        }).$returningId()
        if (result[0]?.id) console.log('User created')

        const result2 = await db.insert(tblUser).values({
            email: 'owner@gmail.com',
            name: 'Owner',
            password: 'owner',
            role: EnumUserRole.owner
        }).$returningId()

        const result2_2 = await db.insert(tblUser).values({
            email: 'owner2@gmail.com',
            name: 'Owner2',
            password: 'owner2',
            role: EnumUserRole.owner
        }).$returningId()

        if (result2[0]?.id) console.log('Owner2 created')
    },

    async function createRestaurant() {
        const owner = await db.query.tblUser.findFirst({ where: eq(tblUser.email, 'owner@gmail.com') })
        const owner2 = await db.query.tblUser.findFirst({ where: eq(tblUser.email, 'owner2@gmail.com') })


        const restauran1Id = await restaurantEntities.createRestaurant({
            restaurant: {
                ...seedDatas.restaurant[0]!,
                ownerId: owner?.id!
            }
        })

        const restaurant1 = await db.query.tblRestaurant.findFirst({ where: eq(schema.tblRestaurant.id, restauran1Id) })

        await db.update(schema.tblRestaurantGeneralSetting).set({
            prePayemntPricePerGuest: 2000,
            restaurantId: restaurant1?.id!
        })

        await new Promise((resolve) => setTimeout(resolve, 1000))

        await restaurantEntities.createRestaurant({
            restaurant: {
                ...seedDatas.restaurant[1]!,
                ownerId: owner2?.id!
            }
        })


        await RoomEntities.createRoomWithTranslations({
            order: 1,
            restaurantId: 1,
            translations: [
                {
                    languageId: languagesData.find(l => l.languageCode === EnumLanguage.tr)?.id!,
                    name: "Ana alan",
                    description: 'Ana alan description'
                },
                {
                    languageId: languagesData.find(l => l.languageCode === EnumLanguage.en)?.id!,
                    name: "Main area",
                    description: 'Main area description'
                },
            ]
        })

        await RoomEntities.createRoomWithTranslations({
            order: 2,
            restaurantId: 1,
            translations: [
                {
                    languageId: languagesData.find(l => l.languageCode === EnumLanguage.tr)?.id!,
                    name: "Sef",
                    description: 'Sef description'
                },
                {
                    languageId: languagesData.find(l => l.languageCode === EnumLanguage.en)?.id!,
                    name: "Sef",
                    description: 'Sef description'
                },
            ]
        })

        await RoomEntities.createRoomWithTranslations({
            order: 3,
            restaurantId: 1,
            isWaitingRoom: true,
            translations: [
                {
                    languageId: languagesData.find(l => l.languageCode === EnumLanguage.tr)?.id!,
                    name: "waiting room",
                    description: 'waiting room description'
                },
                {
                    languageId: languagesData.find(l => l.languageCode === EnumLanguage.en)?.id!,
                    name: "waiting room",
                    description: 'waiting room description'
                },
            ]
        })


        await RoomEntities.createTables({
            tables: new Array(10).fill(undefined).map((_, i) => ({
                capacity: 2,
                maxCapacity: 2,
                minCapacity: 2,
                no: 'R1-' + i.toString(),
                order: i,
                roomId: 1
            })),
        })

        const waitingRoom = await db.query.tblRoom.findFirst({ where: eq(schema.tblRoom.isWaitingRoom, true) })

        await RoomEntities.createTables({
            tables: new Array(10).fill(undefined).map((_, i) => ({
                capacity: 2,
                maxCapacity: 2,
                minCapacity: 2,
                no: 'W-' + i.toString(),
                order: i,
                roomId: waitingRoom?.id!
            })),
        })


        seedDatas.hours.map(async (h) => {
            let hour = localHourToUtcHour(h)
            await restaurantEntities.createMealHours({
                restaurantId: 1,
                mealHours: [
                    {
                        hour,
                        mealId: 3,
                        isOpen: true
                    }
                ]
            })

        })

        await Promise.all(
            seedDatas.reservationTags.map(async (tag) => {
                await restaurantTagEntities.createRestaurantTag({
                    tag: { restaurantId: 1 },
                    translations: tag.translations
                })
            })
        )







    },
    async function createGuests() {
        for (const guest of seedDatas.guests) {
            await db.insert(schema.tblGuest).values(guest)
        }
    },
    async function createNotificationsTables() {
        await db.insert(schema.tblPrepaymentMessage).values({
            languageId: languagesData.find(l => l.languageCode === EnumLanguage.en)?.id!,
            restaurantId: 1,
            prepaymentMessage: 'Prepayment message',
            prepaymentCancellationMessage: 'Prepayment cancellation message',
            prepaymentReminderMessage: 'Prepayment reminder message',
            prepaymentRefundMessage: 'Prepayment refund message',
            prepaymentReceivedMessage: 'Prepayment received message',
            accountPaymentRequestMessage: 'Account payment request message',
            accountPaymentSuccessMessage: 'Account payment success message',
        })


        await db.insert(schema.tblReservationMessage).values({
            languageId: languagesData.find(l => l.languageCode === EnumLanguage.en)?.id!,
            restaurantId: 1,
            newReservationMessage: 'New reservation message',
            dateTimeChangeMessage: 'Date time change message',
            guestCountChangeMessage: 'Guest count change message',
            reservationCancellationMessage: 'Reservation cancellation message',
            reservationConfirmationRequestMessage: 'Reservation confirmation request message',
            reservationCancellationWithReasonMessage: 'Reservation cancellation with reason message',
            reservationReminderMessage: 'Reservation reminder message',
            reservationFeedbackRequestMessage: 'Reservation feedback request message',
            reservationConfirmedMessage: 'Reservation confirmed message',
        })

        await db.insert(schema.tblRestaurantTexts).values({
            restaurantId: 1,
            languageId: languagesData.find(l => l.languageCode === EnumLanguage.en)?.id!,
            agreements: 'Agreements',
            dressCode: 'Dress code',
            reservationRequirements: 'Reservation requirements',
        })

        await db.insert(schema.tblWaitlistMessage).values({
            restaurantId: 1,
            languageId: languagesData.find(l => l.languageCode === EnumLanguage.en)?.id!,
            addedToWaitlistMessage: 'Added to waitlist message',
            addedToWaitlistWalkinMessage: 'Added to waitlist walkin message',
            calledFromWaitlistMessage: 'Called from waitlist message',
        })




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
        exit()
    }
}

initDb()