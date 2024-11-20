
"use client";
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { api } from '@/server/trpc/react';
import { EnumLanguage } from '@/shared/enums/predefined-enums';
import { IconLoader2 } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const FrontLanguageDropDown = () => {
    const { data: languages } = api.restaurant.getRestaurantLanguages.useQuery();

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
        <div>


            <div>
                <div className="flex items-center  h-max  px-2">
                    {languages.map(({ language },index) => (
                        <button
                            key={language.languageCode}
                            onClick={() => handleLanguageChange(language.languageCode)}
                            className={cn(' px-2 py-0 text-sm text-muted-foreground transition-colors h-max', {
                                'text-primary font-medium': languageCode === language.languageCode,
                                'border-r border-primary': index !== languages.length - 1
                            })}
                            disabled={isUpdateing}
                        >
                            {isUpdateing && languageCode === language.languageCode ? (
                                <IconLoader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                t(`languages.${language.languageCode}`, { defaultValue: language.languageCode.toUpperCase() })
                            )}
                        </button>
                    ))}
                </div>

                <div>

                </div>
            </div>
        </div>


    );
};

export default FrontLanguageDropDown;