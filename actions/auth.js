"use server";

// ============================================================
// actions/auth.js — Complete Authentication Server Actions
// Includes: register, verifyEmail, forgotPassword, resetPassword,
//           loginWithMobile, completeProfile, verifyIdentity,
//           resetPasswordDirect, checkUsernameAvailability
// ============================================================
import bcrypt from "bcryptjs";
import { z } from "zod";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { generateVerificationToken, generateResetToken } from "@/lib/tokens";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "@/lib/mail";
import { auth } from "@/lib/auth";
import { sendPushNotification } from "@/lib/onesignal-server";

// ── Zod Schemas ─────────────────────────────────────────────

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(60),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
    // Career fields collected during registration
    industry: z.string().min(1, "Please select an industry"),
    subIndustry: z.string().min(1, "Please select a sub-industry"),
    experience: z.enum(["fresher", "junior", "mid", "senior"], {
      errorMap: () => ({ message: "Please select your experience level" }),
    }),
    skills: z.array(z.string()).min(1, "Please add at least one skill"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const resetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const completeProfileSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(60),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number"),
  industry: z.string().min(1, "Please select an industry"),
  subIndustry: z.string().min(1, "Please select a sub-industry"),
  experience: z.enum(["fresher", "junior", "mid", "senior"], {
    errorMap: () => ({ message: "Please select your experience level" }),
  }),
  skills: z.array(z.string()).min(1, "Please add at least one skill"),
  bio: z.string().max(200, "Bio cannot exceed 200 characters").optional(),
  profilePicture: z.string().optional(),
});

// ============================================================
// 1. registerUser — Create new account, send verification email
// ============================================================
export async function registerUser(formData) {
  try {
    const raw = {
      name: formData.name?.trim(),
      email: formData.email?.toLowerCase().trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      industry: formData.industry?.trim(),
      subIndustry: formData.subIndustry?.trim(),
      experience: formData.experience,
      skills: formData.skills || [],
    };

    const result = registerSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return {
        success: false,
        message: Object.values(fieldErrors)[0]?.[0] || "Validation failed",
        fieldErrors,
      };
    }

    await dbConnect();

    const existingUser = await User.findOne({ email: raw.email }).lean();
    if (existingUser) {
      return { success: false, message: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(raw.password, 12);
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await User.create({
      name: raw.name,
      email: raw.email,
      password: hashedPassword,
      isVerified: false,
      profileCompleted: true, // Career info collected at registration
      industry: raw.industry,
      subIndustry: raw.subIndustry,
      experience: raw.experience,
      skills: raw.skills,
      verificationToken,
      verificationTokenExpiry,
    });

    await sendPushNotification({
      userId: newUser._id,
      title: "Account Created Successfully 🎉",
      message: `Welcome aboard, ${raw.name.split(' ')[0]}! Your career journey starts now.`,
      url: "/"
    });

    await sendVerificationEmail(raw.email, raw.name, verificationToken);

    return {
      success: true,
      message: "Account created! Please check your email to verify your account.",
    };
  } catch (error) {
    console.error("[registerUser] Error:", error.message);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

// ============================================================
// 2. verifyEmail — Verify account using token from email link
// ============================================================
export async function verifyEmail(token) {
  if (!token) {
    return { success: false, message: "Verification token is missing." };
  }

  try {
    await dbConnect();

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return {
        success: false,
        message: "This verification link is invalid or has expired. Please request a new one.",
      };
    }

    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      emailVerified: new Date(),
      verificationToken: null,
      verificationTokenExpiry: null,
    });

    await sendWelcomeEmail(user.email, user.name);

    return { success: true, message: "Email verified successfully! You can now log in." };
  } catch (error) {
    console.error("[verifyEmail] Error:", error.message);
    return { success: false, message: "Something went wrong during verification." };
  }
}

// ============================================================
// 3. forgotPassword — Send password reset email
// ============================================================
export async function forgotPassword(formData) {
  try {
    const email = formData.email?.toLowerCase().trim();
    if (!email || !z.string().email().safeParse(email).success) {
      return { success: false, message: "Please enter a valid email address." };
    }

    await dbConnect();

    const user = await User.findOne({ email }).lean();

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        success: true,
        message: "If an account exists with this email, a reset link has been sent.",
      };
    }

    const resetToken = generateResetToken();
    const resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.findByIdAndUpdate(user._id, { resetPasswordToken: resetToken, resetPasswordExpiry });
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    return {
      success: true,
      message: "If an account exists with this email, a reset link has been sent.",
    };
  } catch (error) {
    console.error("[forgotPassword] Error:", error.message);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

// ============================================================
// 4. resetPassword — Set new password using reset token (email link)
// ============================================================
export async function resetPassword(token, formData) {
  if (!token) {
    return { success: false, message: "Reset token is missing." };
  }

  try {
    const result = resetSchema.safeParse({
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return {
        success: false,
        message: Object.values(fieldErrors)[0]?.[0] || "Validation failed",
        fieldErrors,
      };
    }

    await dbConnect();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
      return {
        success: false,
        message: "This reset link is invalid or has expired. Please request a new one.",
      };
    }

    const hashedPassword = await bcrypt.hash(result.data.password, 12);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
      loginAttempts: 0,
      lockUntil: null,
    });

    return { success: true, message: "Password reset successfully! You can now log in." };
  } catch (error) {
    console.error("[resetPassword] Error:", error.message);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

// ============================================================
// 5. resendVerificationEmail
// ============================================================
export async function resendVerificationEmail(email) {
  if (!email) return { success: false, message: "Email is required." };

  try {
    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) return { success: true, message: "If an account exists, a new link has been sent." };
    if (user.isVerified) return { success: false, message: "This account is already verified." };

    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await User.findByIdAndUpdate(user._id, { verificationToken, verificationTokenExpiry });
    await sendVerificationEmail(user.email, user.name, verificationToken);

    return { success: true, message: "A new verification email has been sent." };
  } catch (error) {
    console.error("[resendVerificationEmail] Error:", error.message);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

// ============================================================
// 6. loginWithMobile — Find user by phone, return for signIn
// (Used as a server-side check, actual session via signIn("mobile"))
// ============================================================
export async function loginWithMobile(phone) {
  if (!phone) return { success: false, message: "Phone number is required." };

  const phoneClean = phone.trim().replace(/\D/g, "");
  if (phoneClean.length !== 10) {
    return { success: false, message: "Please enter a valid 10-digit mobile number." };
  }

  try {
    await dbConnect();
    const user = await User.findOne({ phone: phoneClean }).lean();

    if (!user) {
      return { success: false, message: "Mobile number not registered. Please sign up first." };
    }

    if (!user.isActive) {
      return { success: false, message: "This account has been deactivated. Contact support." };
    }

    return { success: true, message: "Mobile number verified." };
  } catch (error) {
    console.error("[loginWithMobile] Error:", error.message);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

// ============================================================
// 7. checkUsernameAvailability — Live username uniqueness check
// ============================================================
export async function checkUsernameAvailability(username) {
  if (!username || username.length < 3) {
    return { available: false, message: "Username must be at least 3 characters." };
  }

  const cleaned = username.toLowerCase().trim();
  if (!/^[a-z0-9_]+$/.test(cleaned)) {
    return { available: false, message: "Only lowercase letters, numbers, and underscores allowed." };
  }

  try {
    await dbConnect();

    const session = await auth();
    const userId = session?.user?.id;

    const existing = await User.findOne({ username: cleaned }).lean();

    // If the same user already owns this username, it's "available" for them
    if (existing && existing._id.toString() === userId) {
      return { available: true, message: "This is your current username." };
    }

    if (existing) {
      return { available: false, message: "This username is already taken." };
    }

    return { available: true, message: "Username is available!" };
  } catch (error) {
    console.error("[checkUsernameAvailability] Error:", error.message);
    return { available: false, message: "Could not check username. Please try again." };
  }
}

// ============================================================
// 8. completeProfile — Save full profile, set profileCompleted: true
// ============================================================
export async function completeProfile(formData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "You must be logged in to complete your profile." };
    }

    const result = completeProfileSchema.safeParse({
      name: formData.name?.trim(),
      username: formData.username?.toLowerCase().trim(),
      phone: formData.phone?.trim().replace(/\D/g, ""),
      industry: formData.industry,
      subIndustry: formData.subIndustry,
      experience: formData.experience,
      skills: formData.skills,
      bio: formData.bio?.trim() || "",
      profilePicture: formData.profilePicture || undefined,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return {
        success: false,
        message: Object.values(fieldErrors)[0]?.[0] || "Validation failed",
        fieldErrors,
      };
    }

    await dbConnect();

    // ── Check username uniqueness ──────────────────────────
    const existingUsername = await User.findOne({
      username: result.data.username,
      _id: { $ne: session.user.id },
    }).lean();

    if (existingUsername) {
      return { success: false, message: "This username is already taken. Please choose another." };
    }

    // ── Check phone uniqueness (if provided) ───────────────
    if (result.data.phone) {
      const existingPhone = await User.findOne({
        phone: result.data.phone,
        _id: { $ne: session.user.id },
      }).lean();

      if (existingPhone) {
        return { success: false, message: "This phone number is already linked to another account." };
      }
    }

    // ── Update user ────────────────────────────────────────
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        name: result.data.name,
        username: result.data.username,
        phone: result.data.phone,
        industry: result.data.industry,
        subIndustry: result.data.subIndustry,
        experience: result.data.experience,
        skills: result.data.skills,
        bio: result.data.bio,
        ...(result.data.profilePicture && { profilePicture: result.data.profilePicture }),
        updatedAt: new Date(),
      },
      { returnDocument: "after" }
    );


    return {
      success: true,
      message: "Profile completed successfully! Welcome to NextStep AI.",
    };
  } catch (error) {
    console.error("[completeProfile] Error:", error.message);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

// ============================================================
// 9. verifyIdentity — Verify email + phone match for no-email reset
// ============================================================
export async function verifyIdentity(email, phone) {
  if (!email || !phone) {
    return { success: false, message: "Both email and phone number are required." };
  }

  const emailClean = email.toLowerCase().trim();
  const phoneClean = phone.trim().replace(/\D/g, "");

  if (!z.string().email().safeParse(emailClean).success) {
    return { success: false, message: "Please enter a valid email address." };
  }

  if (phoneClean.length !== 10) {
    return { success: false, message: "Please enter a valid 10-digit mobile number." };
  }

  try {
    await dbConnect();

    const user = await User.findOne({ email: emailClean }).lean();

    if (!user || user.phone !== phoneClean) {
      return {
        success: false,
        message: "No account found matching both the email and phone number.",
      };
    }

    if (!user.isActive) {
      return { success: false, message: "This account has been deactivated. Contact support." };
    }

    return {
      success: true,
      message: "Identity verified! Please set your new password.",
      userId: user._id.toString(), // used to scope the reset
    };
  } catch (error) {
    console.error("[verifyIdentity] Error:", error.message);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

// ============================================================
// 10. resetPasswordDirect — Reset without token (email + phone)
// ============================================================
export async function resetPasswordDirect(email, phone, newPassword, confirmPassword) {
  if (!email || !phone || !newPassword) {
    return { success: false, message: "All fields are required." };
  }

  const result = resetSchema.safeParse({ password: newPassword, confirmPassword });
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      message: Object.values(fieldErrors)[0]?.[0] || "Validation failed",
      fieldErrors,
    };
  }

  try {
    // Re-verify identity before resetting
    const verifyResult = await verifyIdentity(email, phone);
    if (!verifyResult.success) {
      return verifyResult;
    }

    await dbConnect();

    const hashedPassword = await bcrypt.hash(result.data.password, 12);
    const emailClean = email.toLowerCase().trim();

    await User.findOneAndUpdate(
      { email: emailClean },
      {
        password: hashedPassword,
        loginAttempts: 0,
        lockUntil: null,
        updatedAt: new Date(),
      }
    );

    return { success: true, message: "Password reset successfully! You can now log in." };
  } catch (error) {
    console.error("[resetPasswordDirect] Error:", error.message);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

// ============================================================
// 11. setProfilePassword — Set platform password & complete profile
// ============================================================
export async function setProfilePassword(password, confirmPassword, skipped = false) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "You must be logged in to set a password." };
    }

    await dbConnect();

    let updateData = { profileCompleted: true, updatedAt: new Date() };

    if (skipped) {
      // Only set to null if they don't have a password. But generally we just don't set it.
      // The instructions say "user.password = null". To be safe, we only unset it if skipped and we really want it null,
      // but if a user already had a password, skipping shouldn't delete it. 
      // Actually, if they are at this step, it means they didn't have one, or we explicitly allow it.
      // Let's check if they have a password before nullifying.
      const user = await User.findById(session.user.id).lean();
      if (!user.password) {
        updateData.password = null;
      }
    } else {
      const result = resetSchema.safeParse({ password, confirmPassword });
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        return {
          success: false,
          message: Object.values(fieldErrors)[0]?.[0] || "Validation failed",
          fieldErrors,
        };
      }
      const hashedPassword = await bcrypt.hash(result.data.password, 12);
      updateData.password = hashedPassword;
    }

    await User.findByIdAndUpdate(session.user.id, updateData);

    // Send single onboarding-complete notification (fire & forget)
    sendPushNotification({
      userId: session.user.id,
      title: "You're all set! 🎉",
      message: `Welcome to CareerForge AI, ${session.user?.name?.split(' ')[0] || 'there'}! Your account is ready. Let's build your career!`,
      url: "/dashboard"
    }).catch(() => { });

    return { success: true, message: "Password set and profile completed!" };
  } catch (error) {
    console.error("[setProfilePassword] Error:", error.message);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}
