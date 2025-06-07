import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  
  // Get all headers from the request (including those added by middleware)
  const requestHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    requestHeaders[key] = value;
  });
  
  // Filter middleware-specific headers
  const middlewareHeaders = Object.fromEntries(
    Object.entries(requestHeaders).filter(([key]) => 
      key.startsWith('x-middleware') || 
      key.startsWith('x-request') || 
      key.startsWith('x-cache') ||
      key.startsWith('x-api')
    )
  );
  
  const responseData = {
    message: 'Middleware test endpoint',
    timestamp,
    path: request.nextUrl.pathname,
    method: request.method,
    middlewareHeaders,
    allRequestHeaders: requestHeaders,
    testInfo: {
      description: 'This endpoint shows how middleware affects API routes',
      middlewareFeatures: [
        'Request logging',
        'Custom header injection',
        'Timing information',
        'Path-specific processing'
      ]
    }
  };
  
  // Add some response headers for testing
  const response = NextResponse.json(responseData);
  response.headers.set('X-API-Response-Time', timestamp);
  response.headers.set('X-API-Processed', 'true');
  
  return response;
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const body = await request.json().catch(() => ({}));
  
  const requestHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    requestHeaders[key] = value;
  });
  
  const responseData = {
    message: 'POST request processed through middleware',
    timestamp,
    receivedBody: body,
    middlewareHeaders: Object.fromEntries(
      Object.entries(requestHeaders).filter(([key]) => 
        key.startsWith('x-')
      )
    )
  };
  
  return NextResponse.json(responseData);
}
