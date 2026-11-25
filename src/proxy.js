// src/middleware.js
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

    // Agar route /admin hai aur user ADMIN nahi hai toh home page par bhej dein
    if (isAdminRoute && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Login hona zaroori hai
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/my-orders/:path*', '/checkout/:path*'],
};