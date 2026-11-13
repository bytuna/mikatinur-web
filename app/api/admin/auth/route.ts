import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  isAdminAuthenticated,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const password = body.password ?? "";

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { ok: false, error: "Girdiğiniz yönetici şifresi hatalı." },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();
    const response = NextResponse.json({ ok: true, authenticated: true });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12, // 12 saat
    });

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Giriş işlemi sırasında bir hata oluştu." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true, authenticated: false });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
