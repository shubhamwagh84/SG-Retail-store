"use server";

import { cookies } from "next/headers";

const PASSCODE = process.env.PORTAL_PASSCODE || "change-me";

export async function authenticate(_: { error?: string }, formData: FormData) {
  const passcode = (formData.get("passcode") || "").toString().trim();

  if (!passcode) {
    return { error: "Enter the passcode" };
  }

  if (passcode !== PASSCODE) {
    return { error: "Incorrect passcode" };
  }

  const secure = process.env.NODE_ENV === "production";
  const cookieStore = await cookies();
  cookieStore.set("portal_auth", "true", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure,
  });

  return { success: true };
}
