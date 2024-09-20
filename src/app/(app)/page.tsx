"use client"

import useAuth from "@/components/providers/AuthProvider";
import { EnumUserRole } from "@/shared/enums/predefined-enums";
import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";


export default function Home() {

  // void api.post.getLatest.prefetch();

  const pathname = usePathname();

  const session = useAuth()

  useEffect(() => {
    if (!session.isAuthenticated) return;
    if (session.session?.user.userRole === EnumUserRole.admin) {
      redirect('/admin')
    } else if (session.session?.user.userRole === EnumUserRole.owner) {
      redirect('/owner')
    }

  }, [session])


  return (
    <div className='relative h-full overflow-hidden bg-background flex'>
      <div className="main h-screen overflow-y-scroll flex-1">
        <div className="text-5xl h-[200vh]">HELO</div>
      </div>
    </div>
  );
}
