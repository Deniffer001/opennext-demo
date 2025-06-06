import { NextRequest, NextResponse } from 'next/server';

// This API route demonstrates caching behavior
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const revalidate = searchParams.get('revalidate') || '60';

  // Simulate some data fetching
  const currentTime = new Date().toISOString();
  const randomData = Math.random().toString(36).substring(7);

  // Fetch some external data to test caching
  let externalData;
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
      // Enable caching with revalidation
      next: { revalidate: parseInt(revalidate) }
    });
    externalData = await response.json();
  } catch {
    externalData = { error: 'Failed to fetch external data' };
  }

  const responseData = {
    message: 'Cache test endpoint',
    timestamp: currentTime,
    randomData,
    revalidateTime: `${revalidate} seconds`,
    externalData,
    cacheInfo: {
      description: 'This response should be cached and revalidated based on the revalidate parameter',
      testInstructions: [
        '1. Call this endpoint multiple times quickly',
        '2. The timestamp and randomData should remain the same (cached)',
        '3. Wait for the revalidate time to pass',
        '4. Call again - you should see updated timestamp and randomData'
      ]
    }
  };

  return NextResponse.json(responseData, {
    headers: {
      'Cache-Control': `s-maxage=${revalidate}, stale-while-revalidate`,
    },
  });
}

// You can also test with different revalidation times
export const revalidate = 30; // Default revalidation time for this route
