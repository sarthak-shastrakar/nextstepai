import dns from "node:dns";
if (dns.setServers) {
  try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}
}
import mongoose from "mongoose";

const fixIndexes = async () => {
  try {
    const MONGODB_URI = "mongodb+srv://sarthakshastrakar9:zG0XsAo4Q2NWcA1e@nextstep.irshjam.mongodb.net/nextstep-ai?retryWrites=true&w=majority&appName=nextstep";
    
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    
    // Drop all conflicting indexes
    const indexesToDrop = ["clerkUserId_1", "email_1", "googleId_1"];
    
    for (const indexName of indexesToDrop) {
      try {
        await db.collection("users").dropIndex(indexName);
        console.log(`Successfully dropped '${indexName}' index.`);
      } catch (e) {
        console.log(`Index '${indexName}' might not exist or couldn't be dropped:`, e.message);
      }
    }
    
    const User = (await import("../models/User.js")).default;
    await User.syncIndexes();
    console.log("Synced current Mongoose indexes.");
    
    console.log("Done.");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing indexes:", error);
    process.exit(1);
  }
};

fixIndexes();
