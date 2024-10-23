import { EnumGender, EnumVipLevel } from "@/shared/enums/predefined-enums"
import { TGuestInsert } from "../schema"
import { TCountryInsert, TLanguageInsert } from "../schema/predefined"
import { TRestaurantInsert } from "../schema/restaurant"

const countries = [
    {
        name: 'turkey',
        code: 'tr',
        phoneCode: '+90'
    }, {
        name: 'usa',
        code: 'us',
        phoneCode: '+1'
    },
    {
        name: 'germany',
        code: 'de',
        phoneCode: '+49'
    }
] as TCountryInsert[]

const languages = [
    {
        languageCode: 'tr',
        name: 'turkish',
        isRtl: false
    },
    {
        languageCode: 'en',
        name: 'english',
        isRtl: false
    },
    {
        languageCode: 'de',
        name: 'german',
        isRtl: false
    }
] as TLanguageInsert[]

export const restaurant = [
    {
        name: 'burger-king',
        phoneNumber: '+905555555555',
        id:1
    }, {
        name: 'kfc',
        phoneNumber: '+905555555555',
        id:2
    }

] as TRestaurantInsert[]

export const guests =
    new Array(5).fill(0).map((_, index) => ({
        name: `guest${index}`,
        surname: `guest${index}`,
        countryId: 1,
        birthDate: new Date(),
        email: `guest${index}@gmail.comz`,
        languageId: 1,
        phone: '123',
        gender: EnumGender.male,
        restaurantId: 2,
        tagIds: [],
        vipLevel: EnumVipLevel.goodSpender

    }) as TGuestInsert)

// [{
//     name: 'guest1',
//     countryId: 1,
//     gender: EnumGender.male,
//     languageId: 1,
//     phone: '123',
//     restaurantId: 2,
//     surname: 'guest1',
//     tagIds: [],
//     vipLevel: EnumVipLevel.goodSpender,
//     birthDate: new Date(),
//     email: 'guest1@gmail.com',

// }] as unknown as TGuestInsert[]




export const seedDatas = {
    countries,
    languages,
    restaurant,
    guests
}