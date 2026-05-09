// ============================================================
// models/User.js — NextStep AI User Schema
// ============================================================
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // ── CORE IDENTITY ──────────────────────────────────────
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: null, select: false }, // null for Google OAuth users

    // ── GOOGLE OAUTH ───────────────────────────────────────
    googleId: { type: String, default: null, sparse: true },
    image: { type: String, default: null },
    emailVerified: { type: Date, default: null },

    // ── PROFILE ────────────────────────────────────────────
    username: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    phone: { type: String, default: null, sparse: true },
    location: { type: String, default: null },
    bio: { type: String, default: "" },
    profilePicture: { type: String, default: null }, // uploaded custom picture URL

    // ── CAREER ─────────────────────────────────────────────
    industry: { type: String, default: null },
    subIndustry: { type: String, default: null },
    skills: { type: [String], default: [] },
    experience: {
      type: String,
      enum: ["fresher", "junior", "mid", "senior"],
      default: null,
    },

    // ── SOCIAL LINKS ───────────────────────────────────────
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },

    // ── LANGUAGES ──────────────────────────────────────────
    languages: { type: [String], default: [] },

    // ── EDUCATION ──────────────────────────────────────────
    education: {
      degree: { type: String, default: "" },
      institution: { type: String, default: "" },
      graduationYear: { type: String, default: "" },
    },

    // ── ONBOARDING ─────────────────────────────────────────
    profileCompleted: { type: Boolean, default: false },

    // ── ACCOUNT STATUS ─────────────────────────────────────
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isFirstLogin: { type: Boolean, default: true },

    // ── SECURITY ───────────────────────────────────────────
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiry: { type: Date, default: null },
    verificationToken: { type: String, default: null },
    verificationTokenExpiry: { type: Date, default: null },
    lastLogin: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// ── VIRTUAL: Check if account is currently locked ──────────
UserSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Delete stale cached model on schema changes (fixes Next.js hot-reload issues)
if (mongoose.models.User) {
  delete mongoose.models["User"];
}
const User = mongoose.model("User", UserSchema);

export default User;
