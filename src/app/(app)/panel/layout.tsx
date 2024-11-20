import { AdminI18nProvider } from "@/hooks/18n-provider";

export default function PanelLayout({ children }: { children: React.ReactNode }) {

    return <AdminI18nProvider>
        {children}
    </AdminI18nProvider>
}