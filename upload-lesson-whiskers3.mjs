// Run this once to upload the Detective Whiskers Lesson 3 video to Supabase
// Usage: node upload-lesson-whiskers3.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL = "https://tanxhrdihnkmouhdufzy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhbnhocmRpaG5rbW91aGR1Znp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjM4NTIsImV4cCI6MjA4ODU5OTg1Mn0.Cw_kQ1PJsK0JB3XfA8QXj4H6XL1rb-2gtxmvOtU31YA";

const VIDEO_PATH = "/Users/amayaharris/cyber-hero-academy-36/Detective Whiskers_ Digital Traps_1080p_caption.mp4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function upload() {
  console.log("📤 Reading video file...");
  const file = readFileSync(VIDEO_PATH);

  console.log(`📦 File size: ${(file.length / 1024 / 1024).toFixed(1)} MB`);
  console.log("🚀 Uploading to Supabase...");

  const { data, error } = await supabase.storage
    .from("lessons")
    .upload("Lesson-Whiskers3.mp4", file, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (error) {
    console.error("❌ Upload failed:", error.message);
    process.exit(1);
  }

  console.log("✅ Upload complete!", data);
  console.log("\n🎉 Done! Detective Whiskers Lesson 3 video is live.");
}

upload();
