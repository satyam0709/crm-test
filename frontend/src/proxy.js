import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/register(.*)",      
  "/pricing",
  "/contact-us(.*)",
  "/blog(.*)",
  "/features(.*)",
  "/integrations(.*)",
  "/calculators(.*)",
  "/schedule-demo",
  "/testimonials(.*)",
  "/explore-now(.*)",
  "/faqs(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Force signed-in users away from public landing page
  if (req.nextUrl.pathname === "/" && auth.userId) {
    return NextResponse.redirect(new URL("/add-package", req.url));
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};