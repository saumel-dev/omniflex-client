import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "./app/lib/auth";

export async function proxy(request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    console.log(session);
}

export const config = {
    matcher: [
        "/class/:path*",
        "/forum/:id",
        "/dashboard/:path*",
    ],
};