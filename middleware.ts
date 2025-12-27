import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/tournaments', '/teams'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/tournaments/:path*', '/teams/:path*']
};
