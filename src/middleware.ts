import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip intl middleware for API routes to preserve caching
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // For non-API routes, handle internationalization
  const intlResponse = intlMiddleware(request);

  // If intl middleware returns a response (redirect), use it
  if (intlResponse) {
    // 只在重定向时添加最少的头部，避免影响缓存
    intlResponse.headers.set("X-Intl-Processed", "true");
    return intlResponse;
  }

  // 对于主页面，尽量减少头部添加以保持缓存效果
  const response = NextResponse.next();

  // 只为特定测试路由添加头部
  if (
    pathname.includes("/test-cache") ||
    pathname.includes("/test-middleware")
  ) {
    response.headers.set("X-Cache-Testing-Route", "true");
  }

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
