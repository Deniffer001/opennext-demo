import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cacheType = searchParams.get('type') || 'default';

  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);

  let cacheConfig;
  let fetchOptions: RequestInit = {};

  // Different cache strategies based on query parameter
  switch (cacheType) {
    case 'no-cache':
      fetchOptions = { cache: 'no-store' };
      cacheConfig = 'No caching - always fresh data';
      break;

    case 'force-cache':
      fetchOptions = { cache: 'force-cache' };
      cacheConfig = 'Force cache - use cached data if available';
      break;

    case 'revalidate-10':
      fetchOptions = { next: { revalidate: 10 } };
      cacheConfig = 'ISR - revalidate every 10 seconds';
      break;

    case 'revalidate-60':
      fetchOptions = { next: { revalidate: 60 } };
      cacheConfig = 'ISR - revalidate every 60 seconds';
      break;

    default:
      fetchOptions = { next: { revalidate: 30 } };
      cacheConfig = 'Default ISR - revalidate every 30 seconds';
  }

  // Fetch external data with the specified cache strategy
  let externalData;
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users/1', fetchOptions);
    externalData = await response.json();
  } catch {
    externalData = { error: 'Failed to fetch' };
  }

  const responseData = {
    endpoint: '/api/cache-demo',
    cacheType,
    cacheConfig,
    timestamp,
    requestId,
    externalData,
    testInstructions: {
      'no-cache': 'Should always return fresh data',
      'force-cache': 'Should return cached data if available',
      'revalidate-10': 'Should cache for 10 seconds, then revalidate',
      'revalidate-60': 'Should cache for 60 seconds, then revalidate',
      'default': 'Should cache for 30 seconds, then revalidate'
    }
  };

  // Set appropriate response headers
  const headers: Record<string, string> = {};

  if (cacheType === 'no-cache') {
    headers['Cache-Control'] = 'no-store, no-cache, must-revalidate';
  } else if (cacheType.startsWith('revalidate-')) {
    const seconds = cacheType.split('-')[1];
    headers['Cache-Control'] = `s-maxage=${seconds}, stale-while-revalidate`;
  }

  return NextResponse.json(responseData, { headers });
}
