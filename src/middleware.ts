import { NextRequest, NextResponse } from "next/server";

/**
 * In-memory rate limiter using a sliding window approach.
 * Tracks request counts per IP within a configurable time window.
 *
 * Note: In a multi-instance deployment, use Redis or a shared store instead.
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 60; // Max 60 requests per window per IP
const RATE_LIMIT_MAX_MUTATION_REQUESTS = 20; // Max 20 write operations per window

// Maximum request body size for API routes (in characters)
const MAX_BODY_SIZE = 50_000;

function getClientIp(request: NextRequest): string {
    return (
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown"
    );
}

function isRateLimited(key: string, maxRequests: number): { limited: boolean; remaining: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        return { limited: false, remaining: maxRequests - 1 };
    }

    entry.count++;

    if (entry.count > maxRequests) {
        return { limited: true, remaining: 0 };
    }

    return { limited: false, remaining: maxRequests - entry.count };
}

// Clean up stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Security headers applied to all responses.
 * These protect against common web vulnerabilities.
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
    // Prevent clickjacking
    response.headers.set("X-Frame-Options", "DENY");

    // Prevent MIME type sniffing
    response.headers.set("X-Content-Type-Options", "nosniff");

    // Enable XSS protection (legacy browsers)
    response.headers.set("X-XSS-Protection", "1; mode=block");

    // Referrer policy - only send origin for cross-origin requests
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permissions policy - restrict dangerous APIs
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    );

    // Content Security Policy
    response.headers.set(
        "Content-Security-Policy",
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
        ].join("; ")
    );

    // Strict Transport Security (HTTPS only in production)
    if (process.env.NODE_ENV === "production") {
        response.headers.set(
            "Strict-Transport-Security",
            "max-age=63072000; includeSubDomains; preload"
        );
    }

    return response;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const clientIp = getClientIp(request);

    // Only apply rate limiting and body size checks to API routes
    if (pathname.startsWith("/api")) {
        const method = request.method;

        // Rate limit — stricter for mutations (POST, PUT, DELETE)
        const isMutation = ["POST", "PUT", "DELETE"].includes(method);
        const rateLimitKey = isMutation ? `mutation:${clientIp}` : `read:${clientIp}`;
        const maxRequests = isMutation ? RATE_LIMIT_MAX_MUTATION_REQUESTS : RATE_LIMIT_MAX_REQUESTS;

        const { limited, remaining } = isRateLimited(rateLimitKey, maxRequests);

        if (limited) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": "60",
                        "X-RateLimit-Limit": String(maxRequests),
                        "X-RateLimit-Remaining": "0",
                    },
                }
            );
        }

        // Check body size for POST/PUT requests
        const contentLength = request.headers.get("content-length");
        if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
            return NextResponse.json(
                { error: "Request body too large. Maximum size is 50KB." },
                { status: 413 }
            );
        }

        // Continue with rate limit headers
        const response = NextResponse.next();
        response.headers.set("X-RateLimit-Limit", String(maxRequests));
        response.headers.set("X-RateLimit-Remaining", String(remaining));
        return applySecurityHeaders(response);
    }

    // Apply security headers to all responses
    const response = NextResponse.next();
    return applySecurityHeaders(response);
}

export const config = {
    matcher: [
        // Match all API routes
        "/api/:path*",
        // Match all pages (for security headers)
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
