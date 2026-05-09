"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Resume from "@/models/Resume";
import CoverLetter from "@/models/CoverLetter";
import Assessment from "@/models/Assessment";
import bcrypt from "bcryptjs";
import cloudinary from "@/lib/cloudinary";

// Helper to check authentication
async function getAuthUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user) throw new Error("User not found");
  return user;
}

export async function checkUsernameUnique(username) {
  try {
    await dbConnect();
    const session = await auth();
    const existing = await User.findOne({ username: username.toLowerCase() });
    
    // It's unique if it doesn't exist, or if it belongs to the current user
    const isUnique = !existing || (session?.user?.id === existing._id.toString());
    return { isUnique };
  } catch (error) {
    return { isUnique: false };
  }
}

export async function updatePersonalInfo(data) {
  try {
    const user = await getAuthUser();

    // Check username uniqueness
    if (data.username && data.username !== user.username) {
      const existing = await User.findOne({ username: data.username.toLowerCase() });
      if (existing) return { success: false, message: "Username is already taken" };
    }

    const updateData = {
      name: data.name,
      username: data.username?.toLowerCase(),
      phone: data.phone,
      bio: data.bio,
      location: data.location,
      profileCompleted: true,
    };

    if (data.profilePicture) {
      updateData.profilePicture = data.profilePicture;
    }

    // Remove undefined
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, { new: true }).lean();

    return { success: true, message: "Personal info updated successfully", user: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (error) {
    console.error("Error updating personal info:", error);
    return { success: false, message: error.message || "Failed to update personal info" };
  }
}

export async function uploadProfilePicture(dataUri) {
  try {
    const user = await getAuthUser();
    
    // Delete old image if exists and is from cloudinary (checking by our folder structure)
    if (user.profilePicture && user.profilePicture.includes("cloudinary")) {
      try {
        const urlParts = user.profilePicture.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const publicId = `nextstepai/profiles/${fileName.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.error("Error deleting old image from cloudinary", e);
      }
    }

    const uploadRes = await cloudinary.uploader.upload(dataUri, {
      folder: "nextstepai/profiles",
      public_id: `profile_${user._id}_${Date.now()}`,
      overwrite: true,
    });

    await User.findByIdAndUpdate(user._id, { profilePicture: uploadRes.secure_url });

    return { success: true, url: uploadRes.secure_url };
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return { success: false, message: error.message || "Failed to upload image" };
  }
}

export async function updateCareerInfo(data) {
  try {
    const user = await getAuthUser();

    const updateData = {
      industry: data.industry,
      subIndustry: data.subIndustry,
      experience: data.experience,
      skills: data.skills,
    };

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, { new: true }).lean();

    return { success: true, message: "Career info updated successfully", user: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (error) {
    console.error("Error updating career info:", error);
    return { success: false, message: error.message || "Failed to update career info" };
  }
}

export async function updatePassword(data) {
  try {
    const user = await getAuthUser();
    const userWithPassword = await User.findById(user._id).select("+password");

    // If setting a password for the first time, currentPassword isn't required
    if (userWithPassword.password) {
      if (!data.currentPassword) {
        return { success: false, message: "Current password is required" };
      }
      const isMatch = await bcrypt.compare(data.currentPassword, userWithPassword.password);
      if (!isMatch) {
        return { success: false, message: "Current password is incorrect" };
      }
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, message: error.message || "Failed to update password" };
  }
}

export async function deleteAccount() {
  try {
    const user = await getAuthUser();
    
    // Delete profile picture from Cloudinary
    if (user.profilePicture && user.profilePicture.includes("cloudinary")) {
      try {
        const urlParts = user.profilePicture.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const publicId = `nextstepai/profiles/${fileName.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.error("Error deleting image from cloudinary", e);
      }
    }

    // In a real app, delete associated data (resumes, interviews, etc)
    await Resume.deleteMany({ userId: user._id });
    await Assessment.deleteMany({ userId: user._id });
    await CoverLetter.deleteMany({ userId: user._id });
    
    await User.findByIdAndDelete(user._id);

    return { success: true, message: "Account deleted successfully" };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, message: error.message || "Failed to delete account" };
  }
}

export async function markFirstLoginSeen() {
  try {
    const user = await getAuthUser();
    await User.findByIdAndUpdate(user._id, { isFirstLogin: false });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getFullProfileData() {
  try {
    const user = await getAuthUser();
    
    const [resumeCount, interviewCount, coverLetterCount] = await Promise.all([
      Resume.countDocuments({ userId: user._id }),
      Assessment.countDocuments({ userId: user._id }),
      CoverLetter.countDocuments({ userId: user._id })
    ]);

    const stats = {
      resumeCount,
      interviewCount,
      coverLetterCount,
    };

    const userWithPassword = await User.findById(user._id).select("+password");
    const hasPassword = !!userWithPassword.password;

    const userData = JSON.parse(JSON.stringify(user));
    userData.hasPassword = hasPassword;

    return {
      success: true,
      user: userData,
      stats
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updateSocialEducation(data) {
  try {
    const user = await getAuthUser();

    const updateData = {
      socialLinks: {
        linkedin: data.linkedin?.trim() || "",
        github: data.github?.trim() || "",
        portfolio: data.portfolio?.trim() || "",
      },
      languages: data.languages || [],
      education: {
        degree: data.degree?.trim() || "",
        institution: data.institution?.trim() || "",
        graduationYear: data.graduationYear?.trim() || "",
      },
    };

    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, { new: true }).lean();

    return {
      success: true,
      message: "Social & Education info updated successfully",
      user: JSON.parse(JSON.stringify(updatedUser)),
    };
  } catch (error) {
    console.error("Error updating social/education info:", error);
    return { success: false, message: error.message || "Failed to update info" };
  }
}
