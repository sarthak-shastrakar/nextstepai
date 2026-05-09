import dbConnect from "./mongoose";
import Notification from "@/models/Notification";

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

export async function sendPushNotification({ userId, title, message, url }) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.warn("[OneSignal] Keys missing. Skipping push notification.");
    return;
  }

  try {
    // 1. Save to MongoDB (for Bell dropdown history)
    await dbConnect();
    await Notification.create({ userId, title, message, url });

    // 2. Send real Browser Push via OneSignal REST API
    //    Targets the specific user via external_id (set from frontend via OneSignal.login)
    const body = {
      app_id: ONESIGNAL_APP_ID,
      target_channel: "push",
      include_aliases: { external_id: [userId.toString()] },
      alias_label: "external_id",
      headings: { en: title },
      contents: { en: message },
    };

    if (url) {
      body.url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${url}`;
    }

    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[OneSignal] API Error:", data);
    } else {
      console.log("[OneSignal] Push sent successfully. ID:", data.id);
    }
  } catch (error) {
    console.error("[OneSignal] Error:", error.message);
  }
}
