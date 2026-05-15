export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/timer/:path*",
    "/problems/:path*",
    "/analytics/:path*",
    "/notes/:path*",
    "/journal/:path*",
    "/revisions/:path*",
    "/review/:path*",
    "/focus/:path*",
    "/settings/:path*",
    "/api/sessions/:path*",
    "/api/problems/:path*",
    "/api/journal/:path*",
    "/api/notes/:path*",
    "/api/patterns/:path*",
    "/api/revisions/:path*",
    "/api/analytics/:path*",
    "/api/reviews/:path*",
  ],
};
