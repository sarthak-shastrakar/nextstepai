import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// Password strength rules - mirrors Zod schema from the website's register page
function validatePassword(password) {
  const errors = [];
  if (!password || password.length < 8) errors.push("Min 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("At least 1 uppercase letter");
  if (!/[0-9]/.test(password)) errors.push("At least 1 number");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("At least 1 special character");
  return errors;
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("=> Mobile register request received:", { ...body, password: body.password ? "[HIDDEN]" : undefined });
    const { name, email, password, industry, subIndustry, experience, skills } = body;

    // Required field check
    if (!name || !email || !password || !industry || !subIndustry || !experience || !skills) {
      return NextResponse.json(
        { success: false, message: "All registration fields are required" },
        { status: 400 }
      );
    }

    // Password strength check (mirrors website's Zod schema)
    const pwErrors = validatePassword(password);
    if (pwErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: pwErrors[0] },
        { status: 400 }
      );
    }

    // Name validation
    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Skills must be an array with at least one entry
    let parsedSkills = skills;
    if (typeof skills === "string") {
      parsedSkills = skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (!parsedSkills.length) {
      return NextResponse.json(
        { success: false, message: "Please add at least one skill" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isVerified: true,         // Auto-verify for mobile flow (simplified)
      profileCompleted: true,
      industry: industry.trim(),
      subIndustry: subIndustry.trim(),
      experience,
      skills: parsedSkills,
    });

    const token = jwt.sign(
      { id: newUser._id.toString(), email: newUser.email },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Welcome to Levora.",
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        industry: newUser.industry,
        subIndustry: newUser.subIndustry,
        experience: newUser.experience,
        skills: newUser.skills,
        profileCompleted: newUser.profileCompleted,
        isVerified: newUser.isVerified,
      },
    });
  } catch (error) {
    console.error("[Mobile Register API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
