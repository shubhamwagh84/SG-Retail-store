import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/manifest.webmanifest", "/sw.js"];
const PUBLIC_FILE = /(.*)\.(.*)$/;

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith("/_next");

  if (isPublic) {
    return NextResponse.next();
  }

  const auth = request.cookies.get("portal_auth")?.value;
  if (auth === "true") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/(.*)"],
};
