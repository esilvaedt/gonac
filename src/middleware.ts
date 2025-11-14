import { NextResponse } from "next/server";

export function middleware() {
  // Get token from cookie or header (for now we'll skip this as we're using localStorage)
  // In production, you should use httpOnly cookies

  // For now, we'll let the client-side AuthContext handle redirects
  // This middleware can be enhanced later with proper token validation

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
