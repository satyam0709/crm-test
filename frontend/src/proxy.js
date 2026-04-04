import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/blog(.*)",
  "/features(.*)",
  "/pricing(.*)",
  "/login(.*)",
  "/register(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/contact-us(.*)",
  "/faqs(.*)",
  "/testimonials(.*)",
  "/explore-now(.*)",
  "/calculators(.*)",
  "/schedule-demo(.*)",
  "/integrations(.*)",
  "/api/webhook/clerk(.*)",
  "/api/contact(.*)",
  "/api/health",
]);

const isDashboardRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/add-package(.*)",
  "/cart(.*)",
  "/leads(.*)",
  "/tasks(.*)",
  "/reminders(.*)",
  "/meetings(.*)",
  "/notes(.*)",
  "/chat(.*)",
  "/calendar(.*)",
  "/customers(.*)",
  "/invoice(.*)",
  "/storage(.*)",
  "/reports(.*)",
  "/hr(.*)",
  "/hr-ops(.*)",
  "/settings(.*)",
  "/search(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl.clone();

  if (userId && isPublicRoute(req)) {
    url.pathname = "/add-package";
    return NextResponse.redirect(url);
  }

  if (!userId && isDashboardRoute(req)) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};