import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();

  // Log the request
  console.log(
    `[Middleware] ${request.method} ${pathname} - ${new Date().toISOString()}`
  );

  // First, handle internationalization
  const intlResponse = intlMiddleware(request);

  // If intl middleware returns a response (redirect), use it
  if (intlResponse) {
    // Add our custom headers to the intl response
    intlResponse.headers.set(
      "X-Middleware-Timestamp",
      new Date().toISOString()
    );
    intlResponse.headers.set("X-Middleware-Start-Time", startTime.toString());
    intlResponse.headers.set("X-Request-Path", pathname);
    intlResponse.headers.set("X-Intl-Processed", "true");
    return intlResponse;
  }

  // Add custom headers to track middleware execution
  const response = NextResponse.next();

  // Add timing information
  response.headers.set("X-Middleware-Timestamp", new Date().toISOString());
  response.headers.set("X-Middleware-Start-Time", startTime.toString());
  response.headers.set("X-Request-Path", pathname);
  response.headers.set(
    "X-User-Agent",
    request.headers.get("user-agent") || "unknown"
  );

  // Add cache-related headers for testing
  if (pathname.startsWith("/api/")) {
    response.headers.set("X-API-Request", "true");
    response.headers.set("X-Cache-Test", "middleware-processed");
  }

  // Test different behaviors based on path
  if (pathname === "/test-redirect") {
    return NextResponse.redirect(new URL("/test-cache", request.url));
  }

  if (pathname === "/test-rewrite") {
    return NextResponse.rewrite(new URL("/test-cache", request.url));
  }

  // Add custom header for cache testing routes
  if (
    pathname.startsWith("/test-cache") ||
    pathname.startsWith("/api/cache-demo") ||
    pathname.startsWith("/api/test-cache")
  ) {
    response.headers.set("X-Cache-Testing-Route", "true");
    response.headers.set(
      "X-Middleware-Processing-Time",
      (Date.now() - startTime).toString()
    );
  }

  // Test blocking certain requests (uncomment to test)
  // if (pathname === '/blocked') {
  //   return new NextResponse('Blocked by middleware', { status: 403 });
  // }

  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
