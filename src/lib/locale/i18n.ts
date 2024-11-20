'use client'

import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import Backend from 'i18next-http-backend'
import { 
  adminLocales, 
  clientLocales, 
  defaultLocale,
  ADMIN_NAMESPACES,
  CLIENT_NAMESPACES 
} from '@/lib/locale/i18n-config'

// Admin için i18n instance'ı
export const adminI18n = i18next.createInstance()
adminI18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/admin/{{ns}}/{{lng}}.json',
    },
    ns: ADMIN_NAMESPACES,
    defaultNS: 'common',
    fallbackLng: defaultLocale,
    supportedLngs: adminLocales,
    interpolation: {
      escapeValue: false,
    },
  })

// Client için i18n instance'ı
export const clientI18n = i18next.createInstance()
clientI18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/client/{{ns}}/{{lng}}.json',
    },
    ns: CLIENT_NAMESPACES,
    defaultNS: 'common',
    fallbackLng: defaultLocale,
    supportedLngs: clientLocales,
    interpolation: {
      escapeValue: false,
    },
  })

// Provider'lar için custom hook'lar
export function useAdminTranslation() {
  return { i18n: adminI18n }
}

export function useClientTranslation() {
  return { i18n: clientI18n }
}