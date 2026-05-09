/**
 * One-time migration: Drop old unique index on `industry` field
 * from industryinsights collection, so the new userId-based
 * unique index works correctly.
 *
 * Run once with: node scripts/fix-insight-index.mjs
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env");
  process.exit(1);
}

async function run() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected");

  const db = mongoose.connection.db;
  const col = db.collection("industryinsights");

  // List existing indexes
  const indexes = await col.indexes();
  console.log("\n📋 Current indexes:");
  indexes.forEach((idx) => console.log(" -", JSON.stringify(idx.key), idx.unique ? "(UNIQUE)" : ""));

  // Drop the old industry_1 unique index if it exists
  const hasOldIndex = indexes.some(
    (idx) => idx.key?.industry !== undefined && idx.unique
  );

  if (hasOldIndex) {
    console.log("\n🗑️  Dropping old unique index: industry_1 ...");
    await col.dropIndex("industry_1");
    console.log("✅ Old index dropped successfully!");
  } else {
    console.log("\n✅ Old index not found — nothing to drop.");
  }

  // Drop old userId+industry compound index if different from what we want
  const hasOldCompound = indexes.some(
    (idx) => idx.key?.userId !== undefined && idx.key?.industry !== undefined
  );
  if (hasOldCompound) {
    console.log("🗑️  Dropping old compound index: userId_1_industry_1 ...");
    try {
      await col.dropIndex("userId_1_industry_1");
      console.log("✅ Compound index dropped.");
    } catch (e) {
      console.log("ℹ️  Compound index not found, skipping.");
    }
  }

  console.log("\n📋 Remaining indexes after cleanup:");
  const after = await col.indexes();
  after.forEach((idx) => console.log(" -", JSON.stringify(idx.key), idx.unique ? "(UNIQUE)" : ""));

  console.log("\n🎉 Migration complete! Restart your dev server now.");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
