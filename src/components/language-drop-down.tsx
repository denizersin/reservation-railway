"use client";
import { useLanguage } from '@/hooks/useLanguage';
import { api } from '@/server/trpc/react';
import React, { useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import { EnumLanguage } from '@/shared/enums/predefined-enums';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { IconLoader2 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const LanguageDropDown = () => {
    const { data: languages } = api.restaurant.getLanguages.useQuery();
    const { language: languageCode, isLoading } = useLanguage();
    const router = useRouter();
    const { i18n, t } = useTranslation('common');

    const queryClient = useQueryClient();

    const { mutate: update, isPending } = api.user.updateUserPreferences.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.user.getUserPreferences)
            });
        }
    });

    const handleLanguageChange = (value: string) => {
        update({ language: value as EnumLanguage });
        router.refresh();
    };

    useEffect(() => {
        if (i18n.language !== languageCode) {
            i18n.changeLanguage(languageCode);
        }
    }, [languageCode])

    if (!languages) return null;

    const isUpdateing = isLoading || isPending;

    return (
        <Select value={languageCode} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-max">
                {
                    isUpdateing ? <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                        :
                        <SelectValue placeholder={t('selectLanguage')} />
                }
            </SelectTrigger>
            <SelectContent>
                {languages.map((language) => (
                    <SelectItem key={language.languageCode} value={language.languageCode}>
                        {t(`languages.${language.languageCode}`, { defaultValue: language.name })}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default LanguageDropDown;