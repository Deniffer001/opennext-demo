import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);

  // Test external data fetch with caching
  let externalData;
  let cacheStatus = "unknown";

  try {
    const startTime = Date.now();
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts/1",
      {
        next: { revalidate: 30 }, // Cache for 30 seconds
      }
    );
    const fetchTime = Date.now() - startTime;

    externalData = await response.json();

    // If fetch is very fast, it's likely cached
    cacheStatus = fetchTime < 50 ? "likely-cached" : "likely-fresh";
  } catch {
    externalData = { error: "Failed to fetch" };
    cacheStatus = "error";
  }

  const responseData = {
    message: "Cache status check",
    timestamp,
    requestId,
    cacheStatus,
    externalData,
    middleware: {
      processed: request.headers.get("x-middleware-timestamp") ? true : false,
      intlProcessed: request.headers.get("x-intl-processed") ? true : false,
      apiRequest: request.headers.get("x-api-request") ? true : false,
    },
    instructions: [
      "1. Call this endpoint multiple times quickly",
      "2. Check if requestId and timestamp change (should stay same if cached)",
      "3. Wait 30+ seconds and call again to see cache refresh",
      "4. Check middleware headers to ensure they are not interfering",
    ],
  };

  return NextResponse.json(responseData, {
    headers: {
      "Cache-Control": "s-maxage=30, stale-while-revalidate",
      "X-Cache-Test-Response": "true",
    },
  });
}

// Enable ISR caching for this route
export const revalidate = 30;
