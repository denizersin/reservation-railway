import { TLanguage } from "@/server/db/schema";
import { EnumLanguage } from "@/shared/enums/predefined-enums";



export const languagesData: TLanguage[] = [
    {
        id: 1,
        languageCode: EnumLanguage.tr,
        name: 'turkish',
        isRtl: false
    },
    {
        id: 2,
        languageCode: EnumLanguage.en,
        name: 'english',
        isRtl: false
    },
    {
        id: 3,
        languageCode: EnumLanguage.de,
        name: 'german',
        isRtl: false
    }
]

export const DEFAULT_LANGUAGE_DATA = languagesData.find((lang) => lang.languageCode === EnumLanguage.en) as TLanguage




// iterate 00:00 , 00:15 , 00:30, 00:45 01:00 ... 23:45

const MINUTES = new Array(4).fill(0).map((_, i) => i * 15)
const HOURS = new Array(24).fill(0).map((_, i) => i)

//!TODO bunu jsona cevir ve o sekilde kullan
export const MEAL_HOURS = HOURS.flatMap(h => MINUTES.map(m => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`))

export const HOURS_SELECT = MEAL_HOURS.map(hour => ({
    label: hour,
    value: hour
}))
