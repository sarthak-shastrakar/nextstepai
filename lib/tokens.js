// ============================================================
// lib/tokens.js — Secure cryptographic token generation
// ============================================================
import crypto from "crypto";

/**
 * Generates a secure 32-byte hex token for email verification.
 * Expiry: 24 hours from generation.
 */
export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generates a secure 32-byte hex token for password reset.
 * Expiry: 1 hour from generation.
 */
export function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}
