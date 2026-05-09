// ============================================================
// lib/checkUser.js — NextAuth v5 replacement for Clerk's checkUser
// Uses NextAuth auth() to get the current session user
// ============================================================
import { auth } from "@/lib/auth";
import dbConnect from "./mongoose";
import User from "@/models/User";

/**
 * Returns the current authenticated user from MongoDB.
 * Returns null if not authenticated or user not found.
 */
export const checkUser = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    await dbConnect();

    const user = await User.findById(session.user.id).lean();

    if (!user) return null;

    const serialized = JSON.parse(JSON.stringify(user));
    return { ...serialized, id: serialized._id.toString() };
  } catch (error) {
    console.error("[checkUser] Error:", error.message);
    return null;
  }
};