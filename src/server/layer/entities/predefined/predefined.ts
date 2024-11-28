import { env } from "@/env"
import { db } from "@/server/db"
import { tblReserVationStatus } from "@/server/db/schema"
import { tblCountry, tblLanguage } from "@/server/db/schema/predefined"
import { EnumLanguage, EnumReservationStatus } from "@/shared/enums/predefined-enums"
import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"


const secretKey = new TextEncoder().encode(env.JWT_SECRET)


export const getCountries = async () => {
    const countries = await db.query.tblCountry.findMany()
    //language properties
    return countries
}

export const getCountryById = async ({
    id
}: {
    id: number
}) => {
    const country = await db.query.tblCountry.findFirst({ where: eq(tblCountry.id, id) })
    return country
}

export const getLanguages = async () => {
    const languages = await db.query.tblLanguage.findMany()
    //language properties
    return languages

}




export const getCountryByName = async ({
    countryName
}: {
    countryName: string
}) => {

    const country = await db.query.tblCountry.findFirst({
        where: eq(tblCountry.name, countryName)
    })

    return country

}

//get language by code

export const getLanguageByCode = async ({
    languageCode
}: {
    languageCode: EnumLanguage
}) => {
    const language = await db.query.tblLanguage.findFirst({
        where: eq(tblLanguage.languageCode, languageCode)
    })
    return language
}


//get reservation status by status

export const getReservationStatusByStatus = async ({
    status
}: {
    status: EnumReservationStatus
}) => {
    const reservationStatus = await db.query.tblReserVationStatus.findFirst({
        where: eq(tblReserVationStatus.status, status)
    })
    return reservationStatus
}

export const getMeals = async () => {
    const meals = await db.query.tblMeal.findMany()
    return meals
}



export const getReservationSatues = async () => {
    const reservationStatus = await db.query.tblReserVationStatus.findMany()
    return reservationStatus
}

export const getFullPhone = async ({
    phone,
    phoneCodeId
}: {
    phone: string,
    phoneCodeId: number
}) => {
    const country = await getCountryById({ id: phoneCodeId })
    if (!country) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Country not found' })
    }
    const fullPhone = `${country.phoneCode}${phone}`
    return fullPhone
}