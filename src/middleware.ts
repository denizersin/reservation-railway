import { NextRequest, NextResponse } from 'next/server'
import { jwtEntities } from './server/layer/entities/jwt'
import { EnumUserRole } from './shared/enums/predefined-enums'

export async function middleware(request: NextRequest) {
    return NextResponse.next()

}

export const config = {
    matcher: [
        '/admin/:path*',
        '/owner/:path*',
    ],

}