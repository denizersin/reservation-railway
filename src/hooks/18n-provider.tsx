'use client'

import { PropsWithChildren, useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import { adminI18n, clientI18n } from '@/lib/locale/i18n'
import useClientLocalStorage from './useClientLocalStorage'

export function AdminI18nProvider({ children }: PropsWithChildren) {

  const localStorage = useClientLocalStorage()

  useEffect(() => {
    const savedLang = localStorage?.getItem('admin-language')
    if (savedLang) {
      adminI18n.changeLanguage(savedLang)
    }
  }, [])

  return (
    <I18nextProvider i18n={adminI18n}>
      {children}
    </I18nextProvider>
  )
}

export function ClientI18nProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const savedLang = localStorage?.getItem('client-language')
    if (savedLang) {
      clientI18n.changeLanguage(savedLang)
    }
  }, [])

  return (
    <I18nextProvider i18n={clientI18n}>
      {children}
    </I18nextProvider>
  )
}