import { EnumLanguage } from "@/shared/enums/predefined-enums"

export const adminLocales: EnumLanguage[] = [EnumLanguage.en, EnumLanguage.tr]
export const clientLocales: EnumLanguage[] = [EnumLanguage.en, EnumLanguage.tr, EnumLanguage.de]

export type AdminLocale = (typeof adminLocales)[number]
export type ClientLocale = (typeof clientLocales)[number]

export const defaultLocale =  EnumLanguage.en

// Namespace'leri tanımlayalım
export const ADMIN_NAMESPACES = ['common'] as const
export const CLIENT_NAMESPACES = ['common'] as const

export type AdminNamespace = (typeof ADMIN_NAMESPACES)[number]
export type ClientNamespace = (typeof CLIENT_NAMESPACES)[number]