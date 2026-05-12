"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

export async function getNotifications() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, notifications: [] };

    await dbConnect();
    
    // Fetch last 50 notifications, sorted by newest
    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return { 
      success: true, 
      notifications: JSON.parse(JSON.stringify(notifications)) 
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, notifications: [] };
  }
}

export async function markAsRead(notificationId) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    await dbConnect();
    
    await Notification.findOneAndUpdate(
      { _id: notificationId, userId: session.user.id },
      { isRead: true }
    );

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false };
  }
}

export async function markAllAsRead() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    await dbConnect();
    
    await Notification.updateMany(
      { userId: session.user.id, isRead: false },
      { isRead: true }
    );

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false };
  }
}

export async function deleteNotification(notificationId) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    await dbConnect();
    
    // Sometimes Mongoose string casting fails in complex queries, so we enforce it
    const result = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: session.user.id
    });

    if (!result) {
      console.error(`[deleteNotification] Notification not found or unauthorized. ID: ${notificationId}, User: ${session.user.id}`);
      return { success: false, message: "Not found or not authorized" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, message: error.message };
  }
}

