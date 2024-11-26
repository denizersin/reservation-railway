import { EnumGender, EnumLanguage, EnumMealNumeric, EnumReservationStatusNumeric, EnumVipLevel } from "@/shared/enums/predefined-enums"
import TRestaurantTagValidator from "@/shared/validators/restaurant-tag"
import { TGuestCompanyInsert, TGuestInsert, TPersonelInsert, TReservationInsert } from "../schema"
import { TCountryInsert, TLanguageInsert } from "../schema/predefined"
import { TRestaurantInsert } from "../schema/restaurant"
import { languagesData } from "@/shared/data/predefined"
import { restaurantEntities } from "@/server/layer/entities/restaurant"
import { RoomEntities } from "@/server/layer/entities/room"
import { guestEntities } from "@/server/layer/entities/guest"
import TReviewSettingsValidator from "@/shared/validators/setting/review"

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
        id: 1
    }, {
        name: 'kfc',
        phoneNumber: '+905555555555',
        id: 2
    }

] as TRestaurantInsert[]

const getGuestCompanies = (restaurantId: number) => new Array(10).fill(0).map((_, index) => ({
    companyName: `guestCompany${index}`,
    restaurantId
})) as TGuestCompanyInsert[]

export const getGuests = (restaurantId: number) => new Array(40).fill(0).map((_, index) => ({
    name: `guest${index}`,
    surname: `guest${index}`,
    countryId: 1,
    birthDate: new Date(),
    email: `guest${index}@gmail.comz`,
    languageId: languagesData.find(lang => lang.languageCode === EnumLanguage.en)!.id,
    phone: '123',
    phoneCode: '+90',
    gender: EnumGender.male,
    restaurantId,
})) as TGuestInsert[]


export const getPersonels = (restaurantId: number) => new Array(8).fill(0).map((_, index) => ({
    fullName: `personel${index}`,
    restaurantId,
})) as TPersonelInsert[]

export const reservationTags = [
    {
        translations: [
            {
                name: 'Dogum gunu',
                code: 'dgm',
                languageId: languagesData.find(lang => lang.languageCode === EnumLanguage.tr)!.id
            },
            {
                name: 'Birthday',
                code: 'bday',
                languageId: languagesData.find(lang => lang.languageCode === EnumLanguage.en)!.id
            }

        ]
    },
    {
        translations: [
            {
                name: 'Anniversary',
                code: 'anv',
                languageId: languagesData.find(lang => lang.languageCode === EnumLanguage.en)!.id
            },
            {
                name: 'Yildonumu',
                code: 'yld',
                languageId: languagesData.find(lang => lang.languageCode === EnumLanguage.tr)!.id
            }
        ]
    },
] as TRestaurantTagValidator.createRestaurantTagFormSchema[]


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

const hours = [
    "15:00",
    "15:30",
    "15:45",
    "16:00",
]

const reviewCategories = [
    {
        tr: {
            title: 'Servis',
            description: 'Personelin ilgisi ve servis kalitesi'
        },
        en: {
            title: 'Service',
            description: 'Staff attention and service quality'
        }
    },
    {
        tr: {
            title: 'Yemek',
            description: 'Yemeklerin lezzeti ve sunumu'
        },
        en: {
            title: 'Food',
            description: 'Taste and presentation of the food'
        }
    },
    {
        tr: {
            title: 'Ambians',
            description: 'Mekanın atmosferi ve dekorasyonu'
        },
        en: {
            title: 'Ambiance',
            description: 'Venue atmosphere and decoration'
        }
    },
    {
        tr: {
            title: 'Kokteyl',
            description: 'Kokteyl çeşitliliği ve kalitesi'
        },
        en: {
            title: 'Cocktails',
            description: 'Cocktail variety and quality'
        }
    },
    {
        tr: {
            title: 'Müzik',
            description: 'Müzik seçimi ve ses seviyesi'
        },
        en: {
            title: 'Music',
            description: 'Music selection and volume level'
        }
    },
    {
        tr: {
            title: 'Vale',
            description: 'Vale hizmeti ve park kolaylığı'
        },
        en: {
            title: 'Valet',
            description: 'Valet service and parking convenience'
        }
    },
    {
        tr: {
            title: 'Karşılama',
            description: 'Karşılama ve ilk izlenim'
        },
        en: {
            title: 'Welcome',
            description: 'Welcome experience and first impression'
        }
    },
    {
        tr: {
            title: 'Rezervasyon',
            description: 'Rezervasyon süreci ve kolaylığı'
        },
        en: {
            title: 'Reservation',
            description: 'Reservation process and convenience'
        }
    }
]


export const seedDatas = {
    countries,
    languages,
    restaurant,
    getGuests,
    hours,
    reservationTags,
    getPersonels,
    getGuestCompanies,
}
