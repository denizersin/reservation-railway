import { initCronsIntercepter } from "@/server/api/root";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    initCronsIntercepter("test-api")
    console.log("CRONE INITIALIZED44")
    return NextResponse.json({ message: 'Hello, world!' });
}