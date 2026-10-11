import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("=> Mobile login request received:", { ...body, password: body.password ? "[HIDDEN]" : undefined });
    const { method, email, password, phone } = body;

    await dbConnect();

    // ────────────────────────────────────────
    // EMAIL + PASSWORD LOGIN  (mirrors NextAuth "credentials" provider)
    // ────────────────────────────────────────
    if (method === "email") {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: "Email and password are required" },
          { status: 400 }
        );
      }

      const user = await User.findOne({
        email: email.toLowerCase().trim(),
      }).select("+password +loginAttempts +lockUntil +isVerified +isActive");

      if (!user) {
        return NextResponse.json(
          { success: false, message: "No account found with this email address" },
          { status: 404 }
        );
      }

      // Account lock check
      if (user.lockUntil && user.lockUntil > new Date()) {
        const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
        return NextResponse.json(
          {
            success: false,
            message: `Account locked. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`,
          },
          { status: 423 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { success: false, message: "This account has been deactivated. Contact support." },
          { status: 403 }
        );
      }

      if (!user.isVerified) {
        return NextResponse.json(
          { success: false, message: "Please verify your email before logging in." },
          { status: 403 }
        );
      }

      if (!user.password) {
        return NextResponse.json(
          {
            success: false,
            message: "This account uses Google sign-in. Please use the Google button.",
          },
          { status: 400 }
        );
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        const newAttempts = (user.loginAttempts || 0) + 1;
        const updateData = { loginAttempts: newAttempts };

        // Lock after 5 failed attempts for 30 minutes
        if (newAttempts >= 5) {
          updateData.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
          updateData.loginAttempts = 0;
        }

        await User.findByIdAndUpdate(user._id, updateData);

        const remaining = Math.max(0, 5 - newAttempts);
        return NextResponse.json(
          {
            success: false,
            message:
              remaining > 0
                ? `Incorrect password. ${remaining} attempt${remaining > 1 ? "s" : ""} remaining.`
                : "Account locked for 30 minutes due to too many failed attempts.",
          },
          { status: 401 }
        );
      }

      // Successful login
      await User.findByIdAndUpdate(user._id, {
        loginAttempts: 0,
        lockUntil: null,
        lastLogin: new Date(),
      });

      const token = jwt.sign(
        { id: user._id.toString(), email: user.email },
        process.env.NEXTAUTH_SECRET,
        { expiresIn: "30d" }
      );

      return NextResponse.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.profilePicture || user.image,
          industry: user.industry,
          subIndustry: user.subIndustry,
          experience: user.experience,
          skills: user.skills,
          profileCompleted: user.profileCompleted,
          isVerified: user.isVerified,
        },
      });
    }

    // ────────────────────────────────────────
    // MOBILE NUMBER LOGIN  (mirrors NextAuth "mobile" provider)
    // ────────────────────────────────────────
    if (method === "mobile") {
      if (!phone) {
        return NextResponse.json(
          { success: false, message: "Phone number is required" },
          { status: 400 }
        );
      }

      const phoneClean = phone.trim().replace(/\D/g, "");
      if (phoneClean.length !== 10) {
        return NextResponse.json(
          { success: false, message: "Please enter a valid 10-digit mobile number" },
          { status: 400 }
        );
      }

      const user = await User.findOne({ phone: phoneClean });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Mobile number not registered. Please sign up first." },
          { status: 404 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { success: false, message: "This account has been deactivated. Contact support." },
          { status: 403 }
        );
      }

      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

      const token = jwt.sign(
        { id: user._id.toString(), email: user.email },
        process.env.NEXTAUTH_SECRET,
        { expiresIn: "30d" }
      );

      return NextResponse.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.profilePicture || user.image,
          industry: user.industry,
          subIndustry: user.subIndustry,
          experience: user.experience,
          skills: user.skills,
          phone: user.phone,
          profileCompleted: user.profileCompleted,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid login method. Use 'email' or 'mobile'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Mobile Login API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
