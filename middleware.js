import NextAuth from "next-auth";
import { NextResponse } from "next/server";

// Edge-compatible minimal NextAuth instance for middleware.
// JWT `exp` claim (set at login with 8hr maxAge) is verified here automatically.
const { auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [],
  session: { strategy: "jwt" },
});


// Routes that require login
const PROTECTED_ROUTES = [
  "/dashboard",
  "/resume",
  "/interviewprep",
  "/cover-letter",
  "/job-finding",
  "/profile",
  "/settings",
];

// Routes only for logged-OUT users
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const pathname = nextUrl.pathname;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Not logged in → guard protected routes → redirect to login
  if (!isLoggedIn && isProtected) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged-in user on auth pages → send to homepage
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};