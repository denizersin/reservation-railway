
'use client'
import useAuth from "@/components/providers/AuthProvider";
import { ClientI18nProvider } from "@/hooks/18n-provider";
import useLocalStorage from "@/hooks/useLocalStorage";
import { EnumHeader, EnumUserRole } from "@/shared/enums/predefined-enums";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";


export default function RootPageHandler({ children }: { children: React.ReactNode }) {

  // void api.post.getLatest.prefetch();

  const pathname = usePathname();

  const session = useAuth()

  const router = useRouter();


  useEffect(() => {
    if (session.isLoading) return;
    if (!session.isAuthenticated) {
      router.push('/reservation')

      //!TODO: remove this
      // router.push('/auth/login')
      return;
    };
    if (session.session?.user.userRole === EnumUserRole.admin && !pathname.includes('admin')) {
      router.push('/panel/admin')
    } else if (session.session?.user.userRole === EnumUserRole.owner && !pathname.includes('owner')) {
      router.push('/panel/owner')
    }


  }, [session.isAuthenticated, session.isLoading])

  const [restaurantId, setRestaurantId] = useLocalStorage({
    key: EnumHeader.RESTAURANT_ID,
    defaultValue: 1,
  })






  if (typeof window === 'undefined') return null


  return children
}
