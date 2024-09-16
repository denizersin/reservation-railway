"use client"
import Link from "next/link";

import { HydrateClient } from "@/server/trpc/server";
import Nav from "@/components/layout/nav";
import { sidelinks } from "@/data/sidelinks";
import Sidebar from "@/components/layout/sidebar";
import useIsCollapsed from "@/hooks/useIsCollapsed";

export default function Home() {

  // void api.post.getLatest.prefetch();




  return (
    <div className='relative h-full overflow-hidden bg-background flex'>
      <Sidebar
        sidelinks={sidelinks}
      />
      <div className="main h-screen overflow-y-scroll flex-1">
        <div className="text-5xl h-[200vh]">HELO</div>
      </div>
      {/* <main
        id='content'
        className={`overflow-x-hidden pt-16 transition-[margin] md:overflow-y-hidden md:pt-0 ${isCollapsed ? 'md:ml-14' : 'md:ml-64'} h-full`}
      >
        <div className="text-4xl">HELLo</div>
      </main> */}
    </div>
  );
}
