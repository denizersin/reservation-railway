"use client"

import useAuth from "@/components/providers/AuthProvider";
import { EnumUserRole } from "@/shared/enums/predefined-enums";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Home() {

  // void api.post.getLatest.prefetch();

  const pathname = usePathname();

  const session = useAuth()

  const router = useRouter();


  useEffect(() => {
    if (session.isLoading) return;
    if (!session.isAuthenticated) {
      router.push('/auth/login')
    };
    if (session.session?.user.userRole === EnumUserRole.admin && !pathname.includes('admin')) {
      router.push('/admin')
    } else if (session.session?.user.userRole === EnumUserRole.owner && !pathname.includes('owner')) {
      router.push('/owner')
    }


  }, [session.isAuthenticated, session.isLoading])





  return (
    <div className='relative h-full overflow-hidden bg-background flex'>
      <div className="main h-screen overflow-y-scroll flex-1">
        <div className="text-5xl h-[200vh]"></div>
      </div>
    </div>
  );
}
