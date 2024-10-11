import { EnumLanguage } from "@/shared/enums/predefined-enums";
import { TLanguage } from "../db/schema/predefined";



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

export const DEFAULT_LANGUAGE = languagesData.find((lang) => lang.languageCode === EnumLanguage.en) as TLanguage